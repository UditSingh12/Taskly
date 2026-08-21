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
        status: taskData.status || 'todo',
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
    <div className="relative w-full max-w-2xl mx-auto mb-6 px-1 sm:px-0">
      <form onSubmit={handleSubmit}>
      <div className="relative group max-w-2xl mx-auto flex items-center bg-zinc-100 dark:bg-[#2A2A2A] border border-zinc-200 dark:border-zinc-700/50 rounded-2xl p-1 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700">
        <div className="px-2 sm:px-3 text-zinc-400">
          {isParsing ? (
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
        <input
          suppressHydrationWarning
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isParsing}
          placeholder="Ask AI to create a task or answer questions..."
          className="flex-1 min-w-0 h-10 sm:h-12 bg-transparent text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 pr-2"
        />
        <Button 
          suppressHydrationWarning
          type="submit" 
          isLoading={isParsing} 
          disabled={!prompt.trim() || isParsing}
          className="h-9 sm:h-10 rounded-xl px-3 sm:px-5 gap-1.5 bg-zinc-200 dark:bg-[#3F3F3F] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-[#4F4F4F] border-0 transition-colors text-xs font-medium cursor-pointer shrink-0"
        >
          <span className="hidden sm:inline">Ask AI</span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
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
