import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport/index.js';

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT!),
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendMail = async (options: MailOptions) => {
  if (!EMAIL_USER) {
    return Promise.reject(new Error('No email configured.'));
  }

  return transporter
    .sendMail({
      from: {
        name: 'VR Roleplay Repo',
        address: EMAIL_USER,
      },
      ...options,
    })
    .then((message) => {
      if (message.rejected) {
        throw new Error(`Email rejected.`);
      }
    })
    .catch((err) => console.log(err));
};
