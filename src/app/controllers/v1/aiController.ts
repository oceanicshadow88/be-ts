import { Request, Response } from 'express';
import status from 'http-status';
import { optimizeTextByClaudeWithRetry } from '../../services/aiService';
import { TextBlock, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';

export const optimize = async (req: Request, res: Response) => {
  const { content, action } = req.body;

  if (!content || !action) {
    return res.status(status.BAD_REQUEST).json({ error: 'content or action are required' });
  }

  const result = await optimizeTextByClaudeWithRetry(content, action);
  
  if (action === 'optimizeTicketDescription') {
    const toolContent: ToolUseBlock | undefined = result.content.find(
      (c) => c.type === 'tool_use',
    ) as ToolUseBlock;
    res.json({ success: true, data: toolContent?.input });
  } else if (action === 'optimizeText') {
    const textContent: TextBlock | undefined = result.content.find(
      (c) => c.type === 'text',
    ) as TextBlock;
    res.json({ success: true, data: textContent?.text });
  }
};
