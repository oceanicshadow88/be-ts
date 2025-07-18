import { Request, Response } from 'express';
import status from 'http-status';
import { optimizeTextByClaudeWithRetry } from '../../services/aiService';

export const optimize = async (req: Request, res: Response) => {
  const { content, action } = req.body;

  if (!content || !action) {
    return res.status(status.BAD_REQUEST).json({ error: 'content or action are required' });
  }

  // 调用服务层处理业务逻辑，action可选
  const result = await optimizeTextByClaudeWithRetry(content, action);

  if (action === 'optimizeTicketDescription') {
    // 提取结构化内容
    const toolContent = result.content.find((c) => c.type === 'tool_use');
    res.json({ success: true, data: toolContent?.input });
  } else if (action === 'optimizeText') {
    // 提取文本内容
    const textContent = result.content.find((c) => c.type === 'text');
    res.json({ success: true, data: textContent?.text });
  }
};
