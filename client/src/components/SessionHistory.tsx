import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Session {
  id: string;
  title: string;
  isActive: boolean;
  timestamp: Date;
}

// Mock data - replace with actual API calls
const mockSessions: Session[] = [
  {
    id: '1',
    title: 'AI Chat - Feature Planning',
    isActive: true,
    timestamp: new Date(),
  },
  {
    id: '2',
    title: 'Code Review Session',
    isActive: false,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    title: 'Debug Analysis',
    isActive: false,
    timestamp: new Date(Date.now() - 7200000),
  },
];

export default function SessionHistory() {
  const loadSession = (sessionId: string) => {
    // TODO: Load session messages
    console.log('Loading session:', sessionId);
  };

  return (
    <div className="border-t border-vscode-border p-3">
      <h4 className="text-xs font-medium text-vscode-text-muted mb-2">Recent Sessions</h4>
      <ScrollArea className="max-h-32">
        <div className="space-y-1">
          {mockSessions.map((session) => (
            <Button
              key={session.id}
              variant="ghost"
              className="w-full justify-start px-2 py-1 h-auto text-left hover:bg-vscode-bg"
              onClick={() => loadSession(session.id)}
              data-testid={`button-load-session-${session.id}`}
            >
              <div className="flex items-center space-x-2 w-full">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    session.isActive ? 'bg-vscode-success' : 'bg-vscode-text-muted'
                  }`} 
                />
                <span className="truncate text-xs text-vscode-text" title={session.title}>
                  {session.title}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
