import nodemailer from 'nodemailer';

let transporter;

async function setup() {
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
  const result = await transporter.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  // TODO: have a testing mode for using this locally, smtp settings otherwise
  console.log('Message sent: %s', result.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(result));
};

// create transporter
setup();
