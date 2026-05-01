import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendMailParams = {
    to: string;
    subject: string;
    html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.MAIL_FROM as string,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent successfully:', data);
        }

        return data;
    } catch (err) {
        console.error('Error in sendMail:', err);
        throw err;
    }
}