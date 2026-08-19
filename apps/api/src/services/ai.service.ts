import { env } from '../config/env.js';
import { CreateTaskInput } from '@taskly/shared-types';

export class AiService {
  static async parseTaskPrompt(prompt: string, context: string = ''): Promise<any> {
    // If OPENROUTER_API_KEY is missing, gracefully return empty defaults
    if (!env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY is not set. AI parsing is disabled.');
      return { type: 'task', task: { title: prompt } };
    }

    const systemPrompt = `You are a helpful AI assistant for Taskly. 
You can either create a task for the user, or answer their questions about their team/projects based on the context.

Context:
${context}

If the user is asking a question or just chatting (e.g., "Give me the list of teammates"), return a JSON object with:
{ "type": "reply", "message": "Your text response here" }

If the user is describing a task they want to create, return a JSON object with:
{
  "type": "task",
  "task": {
    "title": "string (the main task title)",
    "description": "string (any additional details, or empty)",
    "priority": "low | medium | high",
    "dueDate": "ISO string date (if mentioned)",
    "tags": ["array of strings"],
    "projectId": "string (the ObjectId of the project if the task should be added to a specific project. See available projects in context. Optional, omit if not specified.)"
  }
}

Return ONLY a valid JSON object matching one of these schemas exactly, nothing else.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000', 
          'X-Title': 'Taskly', 
        },
        body: JSON.stringify({
          model: 'google/gemma-4-26b-a4b-it:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return { title: prompt };

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

      // Sanitize the result
      return {
        type: 'task',
        task: {
          title: taskData.title || prompt,
          description: taskData.description,
          priority: ['low', 'medium', 'high'].includes(taskData.priority) ? taskData.priority : 'medium',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          tags: Array.isArray(taskData.tags) ? taskData.tags : undefined,
          projectId: taskData.projectId || undefined,
        }
      };
    } catch (error) {
      console.error('Failed to parse AI task prompt:', error);
      return { type: 'task', task: { title: prompt } };
    }
  }
}
