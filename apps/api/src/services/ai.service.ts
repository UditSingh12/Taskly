import { env } from '../config/env.js';

interface ProjectInfo {
  name: string;
  id: string;
}

export class AiService {
  private static extractProjectsFromContext(context: string): ProjectInfo[] {
    const projects: ProjectInfo[] = [];
    const lines = context.split('\n');
    for (const line of lines) {
      const match = line.match(/Name:\s*"([^"]+)",\s*ID:\s*"([^"]+)"/i);
      if (match) {
        projects.push({ name: match[1], id: match[2] });
      }
    }
    return projects;
  }

  private static findMatchingProject(prompt: string, projects: ProjectInfo[]): ProjectInfo | null {
    const lower = prompt.toLowerCase();
    for (const proj of projects) {
      const projLower = proj.name.toLowerCase();
      // Exact or substring match
      if (lower.includes(projLower)) return proj;
      
      // Token overlap match (e.g. "Taskly refractor" vs "Taskly Refactor")
      const projTokens = projLower.split(/\s+/).filter(t => t.length > 2);
      const promptTokens = lower.split(/\s+/).filter(t => t.length > 2);
      const matches = projTokens.filter(pt => 
        promptTokens.some(qt => qt.includes(pt) || pt.includes(qt) || (pt.startsWith(qt.slice(0, 4)) && qt.length >= 4))
      );
      if (matches.length > 0 && matches.length >= Math.ceil(projTokens.length / 2)) {
        return proj;
      }
    }
    return null;
  }

  private static cleanTaskTitle(rawTitle: string, matchedProjectName?: string): string {
    let title = rawTitle.trim();

    // Strip wrapping quotes
    title = title.replace(/^["']|["']$/g, '');

    // Remove common command prefixes
    title = title.replace(/^(please\s+)?(create|add|make|insert|generate)\s+(a\s+)?(new\s+)?(task|todo)\s*(to|for|called|named|about|with\s+title)?\s*/i, '');
    
    // Remove "in project <name>" or "for project <name>"
    if (matchedProjectName) {
      const projRegex = new RegExp(`\\s*(in|for|into|under)\\s+(the\\s+)?(project\\s+)?["']?${matchedProjectName}["']?\\s*`, 'gi');
      title = title.replace(projRegex, ' ').trim();
    }
    title = title.replace(/\s*(in|for|into|under)\s+(the\s+)?project\s+["']?[^"']+["']?\s*/gi, ' ').trim();

    // Clean up residual punctuation / colons
    title = title.replace(/^[:\-–—]\s*/, '').trim();

    return title;
  }

  static async parseTaskPrompt(prompt: string, context: string = ''): Promise<any> {
    const trimmedPrompt = prompt.trim();
    const lowerPrompt = trimmedPrompt.toLowerCase();
    const availableProjects = this.extractProjectsFromContext(context);
    const matchedProject = this.findMatchingProject(trimmedPrompt, availableProjects);

    // 1. Detect questions or general chat
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
        message: `I am your Taskly AI assistant. You can ask me questions about your team/projects, or type a task to add it (e.g. "Prepare client presentation for Friday in ${availableProjects[0]?.name || 'Taskly'}").`,
      };
    }

    // 2. Check if the prompt ONLY requested creating a task in a project without a specific title
    // e.g. "create a task in the project Taskly refactor"
    const cleanedInitial = this.cleanTaskTitle(trimmedPrompt, matchedProject?.name);
    if (!cleanedInitial || cleanedInitial.length === 0 || /^in\s+project/i.test(cleanedInitial) || /^project/i.test(cleanedInitial)) {
      if (matchedProject) {
        return {
          type: 'reply',
          message: `What would you like the task in "${matchedProject.name}" to be named? (e.g., "Setup auth system in ${matchedProject.name}")`,
        };
      }
      return {
        type: 'reply',
        message: `What task would you like to create? (e.g., "Review design specs by tomorrow priority high")`,
      };
    }

    // 3. If OPENROUTER_API_KEY is available, ask the AI for deep extraction
    if (env.OPENROUTER_API_KEY) {
      const systemPrompt = `You are an intelligent task parsing assistant for Taskly.
Given the user's prompt and workspace context, return a JSON object.

Context:
${context}

Rules:
1. If the user is asking a question or chatting:
   Return { "type": "reply", "message": "Helpful answer" }
2. If the user wants to create a task:
   - Extract the concise task "title" (DO NOT include phrases like "create a task in project" in the title).
   - "projectId": string (Must match the exact ID from Available Projects in context if mentioned, otherwise omit).
   - "priority": "low" | "medium" | "high" (default "medium").
   - "dueDate": ISO string if a date or relative time like "tomorrow", "Friday", "next week" is mentioned.
   - "tags": string array of relevant keywords.
   Return {
     "type": "task",
     "task": { "title": "...", "description": "...", "priority": "...", "dueDate": "...", "tags": [], "projectId": "..." }
   }
3. If no clear task title is given (e.g., only "create a task in project X"):
   Return { "type": "reply", "message": "What would you like to name the task in project X?" }

Return ONLY valid JSON.`;

      const candidateModels = [
        'google/gemma-4-31b-it:free',
        'liquid/lfm-2.5-2.6b:free',
        'nvidia/nemotron-3.5-lightning:free',
        'openrouter/auto'
      ];

      for (const model of candidateModels) {
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
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: trimmedPrompt }
              ],
              response_format: { type: 'json_object' }
            })
          });

          if (!response.ok) continue;

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (!content) continue;

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
          const finalTitle = this.cleanTaskTitle(taskData.title || cleanedInitial, matchedProject?.name);
          const finalProjectId = taskData.projectId || matchedProject?.id || undefined;

          return {
            type: 'task',
            task: {
              title: finalTitle || 'New Task',
              description: taskData.description || '',
              priority: ['low', 'medium', 'high'].includes(taskData.priority) ? taskData.priority : 'medium',
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
              tags: Array.isArray(taskData.tags) ? taskData.tags : [],
              projectId: finalProjectId,
            }
          };
        } catch {
          // Try next candidate model
          continue;
        }
      }
    }

    // 4. Local heuristic fallback if AI is offline / unconfigured
    const priority = lowerPrompt.includes('high priority') || lowerPrompt.includes('urgent') || lowerPrompt.includes('priority high')
      ? 'high'
      : lowerPrompt.includes('low priority') || lowerPrompt.includes('priority low')
      ? 'low'
      : 'medium';

    return {
      type: 'task',
      task: {
        title: cleanedInitial || 'New Task',
        priority,
        status: 'todo',
        projectId: matchedProject?.id || undefined,
      }
    };
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
          model: 'google/gemma-4-31b-it:free',
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
