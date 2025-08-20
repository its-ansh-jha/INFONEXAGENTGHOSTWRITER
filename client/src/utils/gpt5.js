// GPT-5 Integration for Code UI
import { apiFetch } from './api';

export class GPT5Client {
  constructor() {
    this.baseUrl = '/api/gpt5';
  }

  async chat(messages, options = {}) {
    const payload = {
      model: 'gpt-5',
      messages,
      reasoning_effort: options.reasoningEffort || 'minimal',
      verbosity: options.verbosity || 'medium',
      temperature: options.temperature || 0.7,
      max_completion_tokens: options.maxTokens || 10000,
      ...options
    };

    try {
      const response = await apiFetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`GPT-5 API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GPT-5 chat error:', error);
      throw error;
    }
  }

  async generateCode(prompt, language = 'javascript', options = {}) {
    const systemMessage = {
      role: 'system',
      content: `You are an expert ${language} developer. Generate clean, well-documented, and production-ready code. Always include comments explaining the logic.`
    };

    const userMessage = {
      role: 'user',
      content: prompt
    };

    return this.chat([systemMessage, userMessage], {
      reasoning_effort: 'medium',
      verbosity: 'high',
      ...options
    });
  }

  async analyzeCode(code, language = 'javascript', questions = []) {
    const systemMessage = {
      role: 'system',
      content: 'You are a senior code reviewer. Analyze the provided code for best practices, potential issues, and improvements.'
    };

    let userContent = `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    if (questions.length > 0) {
      userContent += '\n\nSpecific questions:\n' + questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    }

    const userMessage = {
      role: 'user',
      content: userContent
    };

    return this.chat([systemMessage, userMessage], {
      reasoning_effort: 'high',
      verbosity: 'high'
    });
  }

  async explainError(error, code, language = 'javascript') {
    const systemMessage = {
      role: 'system',
      content: 'You are a debugging expert. Help explain errors and provide solutions.'
    };

    const userMessage = {
      role: 'user',
      content: `I'm getting this error in my ${language} code:\n\nError: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease explain what's wrong and how to fix it.`
    };

    return this.chat([systemMessage, userMessage], {
      reasoning_effort: 'high',
      verbosity: 'medium'
    });
  }

  async createProject(projectDetails) {
    const systemMessage = {
      role: 'system',
      content: 'You are a project scaffolding expert. Create well-structured project templates with proper file organization.'
    };

    const userMessage = {
      role: 'user',
      content: `Create a project structure for: ${JSON.stringify(projectDetails, null, 2)}\n\nProvide a complete file structure with basic starter files and configuration.`
    };

    return this.chat([systemMessage, userMessage], {
      reasoning_effort: 'medium',
      verbosity: 'high'
    });
  }
}

export const gpt5 = new GPT5Client();