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
  
  return res.status(status.OK).json({
    success: true,
    data: result,
  });
};

