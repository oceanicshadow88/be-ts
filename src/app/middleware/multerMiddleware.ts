import { S3 } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import awsConfig from '../config/aws';

const s3 = new S3(awsConfig);

const storage = multerS3({
  s3: s3 as any,
  bucket: 'image.techscrumapp.com',
  metadata: function (req: any, file: any, cb: any) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req: any, file: any, cb: any) {
    cb(null, Date.now().toString() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + path.extname(file.originalname));
  },
});

export const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const diskUpload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});
