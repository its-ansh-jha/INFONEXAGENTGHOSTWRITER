import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Terminal, Trash2, Copy, Check } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  fileName?: string;
}

// Mock welcome message
const welcomeMessage: Message = {
  id: 'welcome',
  type: 'assistant',
  content: `Welcome to Claude Code UI! I'm here to help you with your development tasks.

You can ask me to:
• Analyze and edit your code files
• Help with debugging and optimization  
• Generate new code and documentation
• Review and explain existing codebases`,
  timestamp: new Date(),
};

const mockMessages: Message[] = [
  welcomeMessage,
  {
    id: '1',
    type: 'user',
    content: 'Can you help me optimize this JavaScript function for better performance?',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'assistant',
    content: `I'd be happy to help optimize your JavaScript function! First, let me take a look at the current implementation in \`utils.js\`:

\`\`\`javascript
function processData(items) {
  let result = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].active) {
      result.push({
        id: items[i].id,
        name: items[i].name.toUpperCase(),
        processed: true
      });
    }
  }
  return result;
}
\`\`\`

Here's an optimized version using modern JavaScript features:

\`\`\`javascript
const processData = (items) => {
  return items
    .filter(item => item.active)
    .map(item => ({
      id: item.id,
      name: item.name.toUpperCase(),
      processed: true
    }));
};
\`\`\`

**Performance improvements:**
• Uses functional programming for better readability
• Eliminates manual loop and array push operations
• Reduces memory allocations with chained operations
• More concise and maintainable code`,
    timestamp: new Date(),
    isCode: true,
    fileName: 'utils.js',
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isRecording, start: startRecording, stop: stopRecording } = useAudioRecorder();
  const { sendMessage: sendWSMessage, isConnected } = useWebSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Send to WebSocket if connected
    if (isConnected) {
      sendWSMessage({ type: 'chat', content: inputValue });
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI response (replace with actual WebSocket handling)
    setIsTyping(true);
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I understand you'd like help with that. Let me analyze your request and provide assistance.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div 
        key={message.id} 
        className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''} fade-in`}
        data-testid={`message-${message.id}`}
      >
        {!isUser && (
          <div className="w-8 h-8 bg-vscode-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
        )}
        
        <div className={`rounded-lg p-4 max-w-4xl ${
          isUser 
            ? 'bg-vscode-primary text-white' 
            : 'bg-vscode-surface text-vscode-text'
        }`}>
          <div className="prose prose-sm max-w-none text-current">
            {message.content.split('```').map((part, index) => {
              if (index % 2 === 1) {
                // Code block
                const [language, ...codeLines] = part.split('\n');
                const code = codeLines.join('\n');
                
                return (
                  <div key={index} className="bg-vscode-bg rounded border border-vscode-border p-3 font-mono text-sm my-3">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-vscode-border">
                      <span className="text-xs text-vscode-text-muted">{language || 'code'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-vscode-text-muted hover:text-white"
                        onClick={() => copyCode(code)}
                        data-testid={`button-copy-code-${index}`}
                      >
                        {copiedCode === code ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-vscode-text whitespace-pre-wrap"><code>{code}</code></pre>
                  </div>
                );
              } else {
                // Regular text
                return (
                  <div key={index} className="whitespace-pre-wrap">
                    {part.split('\n').map((line, lineIndex) => {
                      if (line.startsWith('•')) {
                        return <li key={lineIndex} className="ml-4">{line.substring(1).trim()}</li>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <strong key={lineIndex}>{line.slice(2, -2)}</strong>;
                      }
                      if (line.includes('`') && !line.includes('```')) {
                        return (
                          <span key={lineIndex}>
                            {line.split('`').map((segment, segIndex) => 
                              segIndex % 2 === 1 ? (
                                <code key={segIndex} className="bg-vscode-bg px-1 rounded text-vscode-text">
                                  {segment}
                                </code>
                              ) : segment
                            )}
                          </span>
                        );
                      }
                      return line && <p key={lineIndex}>{line}</p>;
                    })}
                  </div>
                );
              }
            })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-vscode-purple rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">👤</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 fade-in" data-testid="typing-indicator">
              <div className="w-8 h-8 bg-vscode-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="bg-vscode-surface rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-vscode-text-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-vscode-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-vscode-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t border-vscode-border p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="Type your message or ask about your code..."
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-vscode-surface border border-vscode-border rounded-lg px-4 py-3 pr-12 text-sm text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:border-vscode-primary resize-none"
                rows={1}
                data-testid="textarea-message-input"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 text-vscode-primary hover:text-white disabled:text-vscode-text-muted"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3 text-xs text-vscode-text-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:text-vscode-text hover:bg-vscode-bg"
                  data-testid="button-attach-file"
                >
                  <Paperclip className="h-3 w-3 mr-1" />
                  Attach
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:text-vscode-text hover:bg-vscode-bg"
                  data-testid="button-open-terminal"
                >
                  <Terminal className="h-3 w-3 mr-1" />
                  Terminal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:text-vscode-text hover:bg-vscode-bg"
                  onClick={clearChat}
                  data-testid="button-clear-chat"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="text-xs text-vscode-text-muted">
                <kbd className="bg-vscode-bg px-1 rounded">Ctrl+Enter</kbd> to send
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
