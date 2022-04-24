import nodemailer from 'nodemailer';
import mailgun from 'mailgun-js';

let transporter;
const devMode = (!process.env.NODE_ENV || process.env.NODE_ENV.trim() === 'development');

const mailGunApiKey = process.env.MAIL_GUN_API_KEY;
const mailGunDomain = process.env.MAIL_GUN_DOMAIN;
let mg;

async function setup() {

  if (devMode) {
    let testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  } else {
    mg = mailgun({ apiKey: mailGunApiKey, domain: mailGunDomain });
  }
}

/**
 * Send email
 * Example:
 * sendMail({
 *   to: '"Fred Foo 👻" <foo@example.com>',
 *   from: 'bar@example.com, baz@example.com',
 *   subject: 'Hello ✔',
 *   text: 'Hello world?',
 *   html: '<b>Hello world?</b>');
 * })
 */
exports.sendMail = async function (email) {
  if (devMode) {
    try {
      const result = await transporter.sendMail({
        from: email.from,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      console.log('Message sent: %s', result.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(result));
    }
    catch(error) {
      console.error('Could not send mail! ' + error);
    }
  } else {
    mg.messages().send(email, function (error, body) {
      console.log(body, error);
    });
  }
};

// create transporter
try {
  setup();
}
catch(error) {
  console.error('Could not connect to mail server! ' + error);
}
