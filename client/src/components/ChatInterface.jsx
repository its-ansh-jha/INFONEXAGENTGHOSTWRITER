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
            content: `You are an expert coding assistant for the project "${selectedProject?.displayName || 'Unknown Project'}". 

            IMPORTANT RULES:
            1. Keep responses concise - avoid showing large code blocks in chat
            2. When creating OR editing files, use this exact format: CREATE_FILE: filename.ext \`\`\`file content here\`\`\`
            3. For websites, create complete HTML files with inline CSS and JavaScript
            4. After using CREATE_FILE, provide a brief description of what you created/edited
            5. Focus on practical solutions rather than lengthy explanations
            6. When building websites, make them fully functional with inline styles and scripts
            7. IMPORTANT: When user asks to "edit" or "modify" or "update" a website/file, always provide the COMPLETE updated file content using CREATE_FILE format - this will replace the existing file
            8. If the website needs environment variables to run, create a .env file with placeholder values like OPENAIAPIKEY=YOUR_API_KEY and instruct the user to replace YOUR_API_KEY. If another env var is needed later, append to the existing .env file like GOOGLE_API_KEY=YOUR_API_KEY

            Example: If user asks for a website, respond with:
            "I'll create a complete website for you.

            CREATE_FILE: index.html
            \`\`\`
            <!DOCTYPE html>
            <html>
            <head>
                <style>/* CSS here */</style>
            </head>
            <body>
                <!-- HTML content -->
                <script>/* JS here */</script>
            </body>
            </html>
            \`\`\`

            The website includes [brief description of features]."

            When editing existing files, always provide the FULL updated code using the same CREATE_FILE format.

            Provide helpful guidance while keeping responses compact and actionable.`
          },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: input.trim() }
        ],
        max_tokens: 10000
      });

      const result = await response.json();

      if (result.success && result.data.choices?.[0]?.message) {
        const content = result.data.choices[0].message.content;

        // Check if the AI wants to create a file
        const fileMatch = content.match(/CREATE_FILE:\s*(\S+)\s*```([\s\S]*?)```/);
        if (fileMatch && selectedProject) {
          const [, fileName, fileContent] = fileMatch;
          try {
            await api.saveFile(selectedProject.name, fileName, fileContent.trim());

            // Show only a simple success message without the code
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: `✅ I've successfully updated "${fileName}" for you! You can view the changes in the Files tab, or see the preview in the Preview tab if it's an HTML file.`,
              timestamp: new Date().toISOString(),
              usage: result.usage,
              fileCreated: fileName
            };
            setMessages(prev => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Error saving file:', error);
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: `❌ I couldn't update the file "${fileName}" automatically. Please try again or edit it manually in the Files tab.`,
              timestamp: new Date().toISOString(),
              usage: result.usage,
              isError: true
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        } else {
          // Check if the AI wants to create/update a .env file
          const envMatch = content.match(/CREATE_FILE:\s*(\.env(?:\.\w+)?)\s*```([\s\S]*?)```/);
          if (envMatch && selectedProject) {
            const [, envFileName, envFileContent] = envMatch;
            const envFilePath = envFileName;
            const envFileContentTrimmed = envFileContent.trim();

            try {
              // Check if the .env file already exists
              const existingFile = await api.getFileContent(selectedProject.name, envFilePath);
              if (existingFile && existingFile.content) {
                // Append new content if file exists
                const newContent = existingFile.content + '\n' + envFileContentTrimmed;
                await api.saveFile(selectedProject.name, envFilePath, newContent);
                const assistantMessage = {
                  id: Date.now() + 1,
                  role: 'assistant',
                  content: `✅ I've appended new environment variables to "${envFileName}". Please review the file.`,
                  timestamp: new Date().toISOString(),
                  usage: result.usage,
                  fileCreated: envFileName
                };
                setMessages(prev => [...prev, assistantMessage]);
              } else {
                // Create the .env file if it doesn't exist
                await api.saveFile(selectedProject.name, envFilePath, envFileContentTrimmed);
                const assistantMessage = {
                  id: Date.now() + 1,
                  role: 'assistant',
                  content: `✅ I've created "${envFileName}" with your environment variables. Please replace 'YOUR_API_KEY' or similar placeholders with your actual keys.`,
                  timestamp: new Date().toISOString(),
                  usage: result.usage,
                  fileCreated: envFileName
                };
                setMessages(prev => [...prev, assistantMessage]);
              }
            } catch (error) {
              console.error('Error handling .env file:', error);
              const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: `❌ I couldn't manage the "${envFileName}" file automatically. Please try again or create/edit it manually.`,
                timestamp: new Date().toISOString(),
                usage: result.usage,
                isError: true
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
          } else {
            // Display the full AI response content if not a file creation or .env update
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: content || 'No response content received',
              timestamp: new Date().toISOString(),
              usage: result.usage
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        }
      } else {
        throw new Error('No valid response received from AI');
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
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span className="text-xs opacity-70 ml-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="whitespace-pre-wrap max-h-96 overflow-y-auto">
            {message.content}
          </div>
          {message.fileCreated && (
            <div className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded mt-2">
              ✓ Created file: {message.fileCreated}
            </div>
          )}
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
          AI Chat Assistant
        </h3>
        <p className="text-sm text-vscode-text-muted">
          {selectedProject ? `Working on: ${selectedProject.displayName}` : 'No project selected'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-vscode-text-muted py-8">
            <h4 className="text-lg font-medium mb-2">Welcome to AI Chat!</h4>
            <p className="mb-4">I'm here to help you with coding, debugging, and project development.</p>
            <div className="text-sm text-left max-w-md mx-auto">
              <p className="mb-2">Try asking me:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"Create a simple website"</li>
                <li>"Build a portfolio page"</li>
                <li>"Make a todo app"</li>
                <li>"Edit the website to add a contact form"</li>
                <li>"Update the homepage with a dark theme"</li>
                <li>"Create a .env file with OPENAIAPIKEY"</li>
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
                    <span className="font-semibold">AI Assistant</span>
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
            placeholder="Ask me anything about coding..."
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