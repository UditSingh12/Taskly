'use client';

import * as React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '../ui/Button';

interface AiTaskCreatorProps {
  onTaskCreated: () => void;
}

export function AiTaskCreator({ onTaskCreated }: AiTaskCreatorProps) {
  const [prompt, setPrompt] = React.useState('');
  const [isParsing, setIsParsing] = React.useState(false);
  const [chatResponse, setChatResponse] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsParsing(true);
    setChatResponse(null);
    try {
      // Step 1: Parse the prompt via AI
      const { parsed } = await api.parseAiTask(prompt);
      
      if (parsed.type === 'reply') {
        setChatResponse(parsed.message);
        setPrompt('');
        return;
      }

      const taskData = parsed.task || parsed;

      // Step 2: Create the task directly
      await api.createTask({
        title: taskData.title || prompt,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        tags: taskData.tags || [],
        projectId: taskData.projectId,
      });
      
      setChatResponse(`✅ Task created successfully: "${taskData.title || prompt}"`);
      setPrompt('');
      onTaskCreated();
    } catch (error: any) {
      alert(`Error parsing task: ${error.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
        <div className="relative flex items-center bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden p-1.5 shadow-2xl transition-all duration-300">
          <div className="px-3 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200">
            {isParsing ? (
              <div className="h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 animate-pulse" />
            )}
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isParsing}
            placeholder="Ask AI to create a task, check teammates, or assign a project..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <Button 
            type="submit" 
            isLoading={isParsing} 
            disabled={!prompt.trim() || isParsing}
            className="h-10 rounded-xl px-5 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-0 shadow-md hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium cursor-pointer"
          >
            <span>Ask AI</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </form>
      
      {/* AI Chat Response Bubble */}
      {chatResponse && (
        <div className="mt-4 p-5 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-4 flex gap-4 items-start shadow-xl shadow-indigo-500/5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-sm text-foreground leading-relaxed pt-1.5 whitespace-pre-wrap flex-1">
            {chatResponse}
          </div>
        </div>
      )}
    </div>
  );
}
