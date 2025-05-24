import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendMessageToQueue } from '../../services/mq/publisher';

export const importProjectByCsv = async (req: Request, res: Response): Promise<void> => {
  const input = req.file?.buffer || req.file?.path;

  if (!input) {
    res.status(httpStatus.BAD_REQUEST).json({ error: 'No file uploaded or invalid file path' });
    return;
  }

  try {
    const csvBase64 = Buffer.isBuffer(input)
      ? input.toString('base64')
      : fs.readFileSync(input).toString('base64');

    await sendMessageToQueue('csvImportQueue', {
      tenantId: req.tenantId,
      ownerId: req.ownerId,
      csvBase64,
    });
    res.status(httpStatus.ACCEPTED).json({ message: 'CSV import task has been queued.' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to queue CSV import task' });
  }
};
