import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email: string, token: string) {
  const url = `${process.env.APP_URL}/auth/callback?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Login",
    html: `<a href="${url}">Login</a>`
  });
}