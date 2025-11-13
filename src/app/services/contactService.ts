import { Request } from 'express';
import config from '../config/app';
import { SES } from '@aws-sdk/client-ses';
import awsConfig from '../config/aws';

export const sendContactEmail = (req: Request) => {
  const params = {
    Destination: {
      ToAddresses: [config.companyAddress],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: 'Techscrum - Contact',
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data:
            '<p>Someone has send you a email.</p>' +
            `<p>FullName: ${req.body.fullName} Company: ${req.body.company} Email: ${req.body.email} Number: ${req.body.number}</p>
                  <p>Techscrum Team</p>`,
        },
      },
    },
    Source: `admin@${config.mainDomain}`,
  };

  // Create the promise and SES service object
  new SES(awsConfig).sendEmail(params);
};
