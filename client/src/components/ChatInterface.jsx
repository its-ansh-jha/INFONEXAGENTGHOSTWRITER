import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '../utils/api';

const ChatInterface = ({ selectedProject, selectedSession }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.gpt5.chat({
        messages: [
          {
            role: 'system',
            content: `You are an expert coding assistant powered by GPT-5. You're helping with the project "${selectedProject?.displayName || 'Unknown Project'}". 
            
            Key capabilities:
            - Generate clean, well-documented code
            - Analyze and debug existing code
            - Explain complex programming concepts
            - Suggest best practices and optimizations
            - Help with project architecture decisions
            
            Always provide practical, actionable advice with code examples when relevant.`
          },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: input.trim() }
        ],
        reasoning_effort: 'medium',
        verbosity: 'medium',
        max_completion_tokens: 4000
      });

      const result = await response.json();
      
      if (result.success && result.data.choices?.[0]?.message) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.data.choices[0].message.content,
          timestamp: new Date().toISOString(),
          usage: result.usage
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response from GPT-5');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your OpenAI API key and try again.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] p-3 rounded-lg ${
            isUser
              ? 'bg-vscode-primary text-white'
              : message.isError
              ? 'bg-vscode-error text-white'
              : 'bg-vscode-surface border border-vscode-border text-vscode-text'
          }`}
        >
          <div className="text-sm mb-1">
            <span className="font-semibold">
              {isUser ? 'You' : 'GPT-5'}
            </span>
            <span className="text-xs opacity-70 ml-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
          {message.usage && (
            <div className="text-xs opacity-70 mt-2">
              Tokens: {message.usage.total_tokens} ({message.usage.prompt_tokens} + {message.usage.completion_tokens})
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-vscode-border p-4">
        <h3 className="text-lg font-semibold text-vscode-text">
          GPT-5 Chat Assistant
        </h3>
        <p className="text-sm text-vscode-text-muted">
          {selectedProject ? `Working on: ${selectedProject.displayName}` : 'No project selected'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-vscode-text-muted py-8">
            <h4 className="text-lg font-medium mb-2">Welcome to GPT-5 Chat!</h4>
            <p className="mb-4">I'm here to help you with coding, debugging, and project development.</p>
            <div className="text-sm text-left max-w-md mx-auto">
              <p className="mb-2">Try asking me:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"Create a React component for a todo list"</li>
                <li>"Help me debug this JavaScript function"</li>
                <li>"Explain how to implement authentication"</li>
                <li>"What's the best way to structure this project?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-vscode-surface border border-vscode-border text-vscode-text p-3 rounded-lg">
                  <div className="text-sm mb-1">
                    <span className="font-semibold">GPT-5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vscode-primary"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="border-t border-vscode-border p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask GPT-5 anything about coding..."
            className="flex-1 bg-vscode-bg border-vscode-border text-vscode-text"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-vscode-primary text-white hover:bg-vscode-primary/90"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;