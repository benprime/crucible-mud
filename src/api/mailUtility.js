import nodemailer from 'nodemailer';

let transporter;

function setup() {
  transporter = nodemailer.createTransport({
    host: 'localhost',
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

  try
  {
    const result = await transporter.sendMail({
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  }
  catch(error)
  {
      console.error('Could not send mail! ' + error);
  }

  console.log('Message sent: %s', result.messageId, '\n');
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(result), '\n');
};

// create transporter
try
{
  setup();
}
catch(error)
{
  console.error('Could not connect to mail server! ' + error);
}

