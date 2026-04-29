import { mailTransporter } from "./transporter";

type SendMailParams = {
    to: string;
    subject: string;
    html: string;
};

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
    try {
        const info = await mailTransporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
    });
    return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
