import { env } from '../config/env.js';

export class AiService {
  static async parseTaskPrompt(prompt: string, context: string = ''): Promise<any> {
    const trimmedPrompt = prompt.trim();
    const lowerPrompt = trimmedPrompt.toLowerCase();

    // 1. Local smart fallback for questions when OpenRouter is not configured or fails
    const isQuestion = 
      lowerPrompt.startsWith('how many') ||
      lowerPrompt.startsWith('who ') ||
      lowerPrompt.startsWith('what ') ||
      lowerPrompt.startsWith('where ') ||
      lowerPrompt.startsWith('which ') ||
      lowerPrompt.startsWith('tell me') ||
      lowerPrompt.startsWith('list ') ||
      lowerPrompt.startsWith('show ') ||
      lowerPrompt.includes('team member') ||
      lowerPrompt.includes('teammate') ||
      lowerPrompt.endsWith('?');

    // If no API key is provided, handle intelligently locally
    if (!env.OPENROUTER_API_KEY) {
      if (isQuestion) {
        if (lowerPrompt.includes('team') || lowerPrompt.includes('member')) {
          return {
            type: 'reply',
            message: `Here is your current team context:\n${context.split('Available Teammates:')[1]?.split('Available Projects:')[0]?.trim() || 'No teammates found.'}`,
          };
        }
        if (lowerPrompt.includes('project')) {
          return {
            type: 'reply',
            message: `Here are your current projects:\n${context.split('Available Projects:')[1]?.trim() || 'No projects found.'}`,
          };
        }
        return {
          type: 'reply',
          message: `I am your Taskly AI assistant. You can ask me questions about your team/projects, or type a task to add it (e.g. "Prepare client presentation for Friday").`,
        };
      }

      // Default to creating a task if it's a task prompt
      return {
        type: 'task',
        task: {
          title: trimmedPrompt,
          priority: 'medium',
          status: 'todo',
        }
      };
    }

    const systemPrompt = `You are a helpful AI assistant for Taskly. 
You can either create a task for the user, or answer their questions about their team/projects based on the context.

Context:
${context}

If the user is asking a question or chatting (e.g., "Give me the list of teammates", "how many my teammembers are there", "what projects do I have?"):
Return a JSON object with:
{ "type": "reply", "message": "Your helpful answer based on the provided context" }

If the user is creating or describing a task (e.g., "Review design specs by tomorrow priority high"):
Return a JSON object with:
{
  "type": "task",
  "task": {
    "title": "string (the main task title)",
    "description": "string (any additional details, or empty)",
    "priority": "low | medium | high",
    "dueDate": "ISO string date (if mentioned)",
    "tags": ["array of strings"],
    "projectId": "string (the ObjectId of the project if matching one in context, optional)"
  }
}

Return ONLY a valid JSON object matching one of these schemas.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://taskly-web-dun.vercel.app', 
          'X-Title': 'Taskly', 
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: trimmedPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');

      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleanContent);
      
      if (parsed.type === 'reply') {
        return parsed;
      }
      
      const taskData = parsed.task || parsed;

      return {
        type: 'task',
        task: {
          title: taskData.title || trimmedPrompt,
          description: taskData.description,
          priority: ['low', 'medium', 'high'].includes(taskData.priority) ? taskData.priority : 'medium',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          tags: Array.isArray(taskData.tags) ? taskData.tags : undefined,
          projectId: taskData.projectId || undefined,
        }
      };
    } catch (error) {
      console.error('Failed to parse AI task prompt, falling back:', error);
      if (isQuestion) {
        if (lowerPrompt.includes('team') || lowerPrompt.includes('member')) {
          return {
            type: 'reply',
            message: `Here is your current team context:\n${context.split('Available Teammates:')[1]?.split('Available Projects:')[0]?.trim() || 'No teammates found.'}`,
          };
        }
        if (lowerPrompt.includes('project')) {
          return {
            type: 'reply',
            message: `Here are your current projects:\n${context.split('Available Projects:')[1]?.trim() || 'No projects found.'}`,
          };
        }
        return {
          type: 'reply',
          message: `I am your Taskly AI assistant. You can ask me questions about your team/projects, or type a task to add it.`,
        };
      }
      return { type: 'task', task: { title: trimmedPrompt, priority: 'medium', status: 'todo' } };
    }
  }

  static async generateGreeting(userName: string, timeOfDay: string, tasksSummary?: string): Promise<{ greeting: string, quote: string }> {
    let contextualFallback = "Focus on what truly matters today.";
    if (tasksSummary) {
      if (tasksSummary.includes('0 active tasks')) {
        contextualFallback = "You have a clear board today. Great job!";
      } else if (tasksSummary.includes('are overdue') && !tasksSummary.includes('0 are overdue')) {
        contextualFallback = "Let's clear out those overdue tasks first.";
      } else {
        contextualFallback = "Let's knock out today's tasks.";
      }
    }

    if (!env.OPENROUTER_API_KEY) {
      return {
        greeting: `Good ${timeOfDay}, ${userName}`,
        quote: contextualFallback
      };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://taskly-web-dun.vercel.app',
          'X-Title': 'Taskly',
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for Taskly. Generate a greeting for ${userName} at ${timeOfDay}. Context: ${tasksSummary || 'No tasks'}. Return JSON: { "greeting": "...", "quote": "..." } with a quote under 12 words.`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error('OpenRouter error');
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content');
      return JSON.parse(content.trim());
    } catch {
      return {
        greeting: `Good ${timeOfDay}, ${userName}`,
        quote: contextualFallback
      };
    }
  }
}
