import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY, CLAUDE_MODEL } from '../config/claudeAi';
import { getSystemPrompt, getToolChoice, getTools } from '../utils/aiUtils';

// 创建 Anthropic 客户端实例
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

const optimizeTextByClaude = async (content: string, action: string): Promise<Anthropic.Message> => {
  const messageParams: any = {
    model: CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    temperature: 1,
    system: getSystemPrompt(action),
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
  };

  const tools = getTools(action);
  if (tools.length > 0) {
    messageParams.tools = tools;
    messageParams.tool_choice = getToolChoice(action);
  }

  const msg = await anthropic.messages.create(messageParams);
  return msg;
};

export const optimizeTextByClaudeWithRetry = async (content: string, action: string, retries = 3): Promise<Anthropic.Message> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await optimizeTextByClaude(content, action);
    } catch (error: any) {
      // 处理 529 Overloaded 错误
      if (error.status === 529 && i < retries - 1) {
        // 递增延迟重试
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

