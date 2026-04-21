import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email: string, token: string) {
  const url = `${process.env.APP_URL}/auth/callback?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Login",
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Login to Tradex</h2>
            <p>Click the button below to log in:</p>

            <a href="${url}"
            style="
                display: inline-block;
                padding: 12px 20px;
                background-color: black;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 10px;
            ">
            Login
            </a>

            <p style="margin-top:20px;font-size:12px;color:gray;">
            If the button doesn’t work, copy this link:
            </p>

            <p style="word-break: break-all;">
            ${url}
            </p>
        </div>
        `
  });
}