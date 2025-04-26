import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import awsConfig from '../config/aws';

AWS.config.update({
  region: awsConfig.awsRegion,
  accessKeyId: awsConfig.awsAccessKey,
  secretAccessKey: awsConfig.awsSecretKey,
});

const s3 = new AWS.S3();

const storage = multerS3({
  s3: s3,
  bucket: 'image.techscrumapp.com',
  metadata: function (req:any, file:any, cb:any) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req:any, file:any, cb:any) {
    cb(null, Date.now().toString()  + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });


