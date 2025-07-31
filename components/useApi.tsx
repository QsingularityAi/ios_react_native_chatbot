import { Message, Role } from '@/utils/Interfaces';
import { keyStorage } from '@/utils/Storage';
import { fetch } from 'expo/fetch';
import { useMMKVString } from 'react-native-mmkv';

// Model configuration
export const AVAILABLE_MODELS = {
  // Groq Models
  'meta-llama/llama-4-maverick-17b-128e-instruct': { 
    name: 'Llama 4 Maverick (17B)', 
    provider: 'groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    supportsReasoning: false 
  },
  'moonshotai/kimi-k2-instruct': { 
    name: 'Kimi K2 Instruct', 
    provider: 'groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    supportsReasoning: false 
  },
  'deepseek-r1-distill-llama-70b': { 
    name: 'DeepSeek R1 Distill Llama (70B)', 
    provider: 'groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    supportsReasoning: true 
  },

  // OpenRouter Models
  'z-ai/glm-4.5-air:free': { 
    name: 'GLM-4.5 Air (Free)', 
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportsReasoning: false 
  },
  'qwen/qwen2.5-vl-72b-instruct': { 
    name: 'Qwen 2.5 VL (72B) Instruct', 
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportsReasoning: false 
  },
  'agentica-org/deepcoder-14b-preview': { 
    name: 'DeepCoder (14B) Preview', 
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportsReasoning: false 
  },
  'tencent/hunyuan-a13b-instruct:free': { 
    name: 'Hunyuan A13B Instruct (Free)', 
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportsReasoning: false 
  },
  'moonshotai/kimi-dev-72b:free': { 
    name: 'Kimi Dev (72B) - Free', 
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    supportsReasoning: false 
  },
  
  // Cerebras Production Models
  'llama-4-scout-17b-16e-instruct': { 
    name: 'Llama 4 Scout (17B)', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'llama3.1-8b': { 
    name: 'Llama 3.1 (8B)', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'llama-3.3-70b': { 
    name: 'Llama 3.3 (70B)', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'qwen-3-32b': { 
    name: 'Qwen 3 (32B)', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  
  // Cerebras Preview Models
  'llama-4-maverick-17b-128e-instruct': { 
    name: 'Llama 4 Maverick (17B) [Preview]', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'qwen-3-235b-a22b': { 
    name: 'Qwen 3 (235B) [Preview]', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'qwen-3-235b-a22b-instruct-2507': { 
    name: 'Qwen 3 Instruct (235B) [Preview]', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: false 
  },
  'qwen-3-235b-a22b-thinking-2507': { 
    name: 'Qwen 3 Thinking (235B) [Preview]', 
    provider: 'cerebras',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    supportsReasoning: true 
  },
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

type ApiHook = {
  sendMessage: (
    messages: Message[],
    selectedModel: string,
    onUpdate: (content: string, reasoningContent?: string) => void,
  ) => Promise<void>;
  key?: string;
};

export const useApi = (): ApiHook => {
  const [key, setKey] = useMMKVString('apikey', keyStorage);
  const [cerebrasKey, setCerebrasKey] = useMMKVString('cerebras_apikey', keyStorage);
  const [groqKey, setGroqKey] = useMMKVString('groq_apikey', keyStorage);
  const [openrouterKey, setOpenrouterKey] = useMMKVString('openrouter_apikey', keyStorage);

  const sendMessage = async (
    messages: Message[],
    selectedModel: string,
    onUpdate: (content: string, reasoningContent?: string) => void,
  ) => {
    try {
      const modelConfig = AVAILABLE_MODELS[selectedModel as ModelId];
      if (!modelConfig) {
        throw new Error(`Unsupported model: ${selectedModel}`);
      }

      // Select the appropriate API key based on the model provider
      let apiKey;
      switch (modelConfig.provider) {
        case 'groq':
          apiKey = groqKey;
          break;
        case 'cerebras':
          apiKey = cerebrasKey;
          break;
        case 'openrouter':
          apiKey = openrouterKey;
          break;
        default:
          apiKey = key;
      }
      
      if (!apiKey) {
        throw new Error(`No API key configured for ${modelConfig.provider} models. Please add your API key in settings.`);
      }

      const messageHistory = messages.map((msg) => ({
        role: msg.role === Role.User ? 'user' : 'assistant',
        content: msg.content,
        prefix: msg.prefix,
      }));

      // Only set prefix for models that support reasoning (currently only some Groq models)
      if (modelConfig.supportsReasoning) {
        // The last message for reasoning models should have prefix mode on
        messageHistory[messageHistory.length - 1].prefix = true;
      }

      const response = await fetch(modelConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messageHistory,
          stream: true,
          stop: ['```'],
        }),
      });

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += `: ${errorText}`;
          }
        } catch (e) {
          // If we can't read the error text, just use the status
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!value) continue;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]' || data === '') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content;

              // Handle reasoning content for models that support it
              if (content || (reasoningContent && modelConfig.supportsReasoning)) {
                onUpdate(content || '', reasoningContent);
              }
            } catch (e) {
              // Skip malformed chunks silently - they're common in streaming responses
              if (data && data !== '[DONE]') {
                console.warn('Skipping malformed chunk:', data.substring(0, 50) + '...');
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return { sendMessage, key: key || cerebrasKey || groqKey || openrouterKey };
};
