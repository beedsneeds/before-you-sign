import 'dotenv/config';
import { Resend } from 'resend';
import { fileURLToPath } from 'node:url';

const resend = new Resend(process.env['RESEND_API_KEY']);

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const { data, error } = await resend.emails.send({
    from: 'Before You Sign <onboarding@resend.dev>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    throw new Error(`Email notification send failed: ${error.message ?? JSON.stringify(error)}`);
  }
  return data;
}

// Stub to test if emails work, adjust email
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('email sent');
  try {
    const data = await sendEmail({
      to: 'rviwt2018@gmail.com',
      // to: 'YOUR.EMAIL@example.com',
      subject: `Test ${new Date().toISOString()}`,
      html: `<p>Test send at ${new Date().toISOString()}</p>`,
    });
    console.log(data);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
