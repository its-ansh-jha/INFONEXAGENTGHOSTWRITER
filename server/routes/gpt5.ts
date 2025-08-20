import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-5 Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { model = 'gpt-5', messages, reasoning_effort = 'minimal', verbosity = 'medium', ...options } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // the newest OpenAI model is "gpt-5" which was released August 7, 2024. do not change this unless explicitly requested by the user
    // GPT-5 only supports default temperature and requires max_completion_tokens
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      reasoning_effort: reasoning_effort,
      verbosity: verbosity,
      max_completion_tokens: options.max_completion_tokens || options.max_tokens || 4000,
      ...options
    });

    res.json({
      success: true,
      data: response,
      usage: response.usage
    });

  } catch (error) {
    console.error('GPT-5 API Error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key',
        message: 'Please check your OpenAI API key configuration'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests to OpenAI API'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to process GPT-5 request'
    });
  }
});

// GPT-5 Code Generation endpoint
router.post('/generate-code', async (req, res) => {
  try {
    const { prompt, language = 'javascript', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemMessage = {
      role: 'system',
      content: `You are an expert ${language} developer. Generate clean, well-documented, and production-ready code. Always include comments explaining the logic.`
    };

    const userMessage = {
      role: 'user',
      content: prompt
    };

    // the newest OpenAI model is "gpt-5" which was released August 7, 2024. do not change this unless explicitly requested by the user
    // GPT-5 only supports default temperature and requires max_completion_tokens
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [systemMessage, userMessage],
      reasoning_effort: 'medium',
      verbosity: 'high',
      max_completion_tokens: 4000,
      ...options
    });

    res.json({
      success: true,
      code: response.choices[0].message.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('GPT-5 Code Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      message: error.message
    });
  }
});

export default router;