'use client';

import * as React from 'react';
import { api } from '@/lib/api-client';
import { Sun, Moon, Sunset } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

type TimeBlock = 'morning' | 'afternoon' | 'evening';

function Typewriter({ text, delay = 0, speed = 35 }: { text: string, delay?: number, speed?: number }) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [started, setStarted] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  React.useEffect(() => {
    if (!started) return;
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index >= text.length) {
        clearInterval(timer);
        setIsComplete(true);
        return;
      }
      const char = text.charAt(index);
      setDisplayedText((old) => old + char);
      index++;
    }, speed);
    return () => clearInterval(timer);
  }, [text, started, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse text-muted-foreground ml-1">|</span>}
    </span>
  );
}

export function PremiumGreeting() {
  const { user } = useAuth();
  const [greetingData, setGreetingData] = React.useState<{ greeting: string; quote: string } | null>(null);
  const [timeBlock, setTimeBlock] = React.useState<TimeBlock>('morning');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    const currentHour = new Date().getHours();
    let currentBlock: TimeBlock = 'evening';
    if (currentHour >= 5 && currentHour < 12) currentBlock = 'morning';
    else if (currentHour >= 12 && currentHour < 17) currentBlock = 'afternoon';

    setTimeBlock(currentBlock);

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `greeting_v3:${user._id}:${today}:${currentBlock}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setGreetingData(JSON.parse(cached));
      setIsLoaded(true);
    } else {
      // Fetch fresh greeting
      api.getAiGreeting(currentBlock).then((data) => {
        setGreetingData(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setIsLoaded(true);
      }).catch((err) => {
        console.error('Failed to fetch greeting:', err);
        setGreetingData({
          greeting: `Good ${currentBlock}, ${user.name.split(' ')[0]}`,
          quote: "Let's make today count."
        });
        setIsLoaded(true);
      });
    }
  }, [user]);

  const getStyles = () => {
    switch (timeBlock) {
      case 'morning':
        return {
          Icon: Sun,
          iconColor: 'text-[#D97757]', // Warm earthy tone like Claude's spark
        };
      case 'afternoon':
        return {
          Icon: Sunset,
          iconColor: 'text-[#D97757]',
        };
      case 'evening':
        return {
          Icon: Moon,
          iconColor: 'text-[#8AA1D9]', // Cool muted blue for evening
        };
    }
  };

  const { Icon, iconColor } = getStyles();

  if (!isLoaded || !greetingData) {
    return (
      <div className="w-full flex justify-center py-8 sm:py-12 animate-pulse">
         <div className="h-10 w-72 bg-black/5 dark:bg-white/5 rounded-md" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-10 text-center">
      
      {/* Title with Claude-style minimal aesthetic */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
        <Icon className={`w-10 h-10 sm:w-12 sm:h-12 motion-safe:animate-[pulse_4s_ease-in-out_infinite] ${iconColor}`} strokeWidth={1.5} />
        <h1 className="text-5xl sm:text-6xl font-serif text-slate-800 dark:text-[#E6E6E6] tracking-tight leading-tight">
          <Typewriter text={greetingData.greeting} delay={100} speed={40} />
        </h1>
      </div>

      {/* Quote */}
      <p className="text-muted-foreground font-medium text-xl sm:text-2xl font-serif max-w-3xl mx-auto">
        <Typewriter text={greetingData.quote} delay={1500} speed={30} />
      </p>
      
    </div>
  );
}
