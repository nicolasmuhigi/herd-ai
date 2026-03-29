const { sendEmail } = require('../lib/email.js');

(async () => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Livestock AI Platform',
      html: '<b>This is a test email sent by the platform.</b>'
    });
    console.log('Test email sent successfully');
  } catch (e) {
    console.error('Test email failed:', e);
  }
})();
