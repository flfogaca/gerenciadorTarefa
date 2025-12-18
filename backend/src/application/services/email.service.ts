import nodemailer, { Transporter } from 'nodemailer';
import { injectable } from 'inversify';

export interface IEmailService {
  sendPasswordResetEmail(to: string, token: string, userName: string): Promise<void>;
  sendWelcomeEmail(to: string, userName: string): Promise<void>;
  sendEmailVerification(to: string, token: string, userName: string): Promise<void>;
  sendNotificationEmail(to: string, subject: string, content: string): Promise<void>;
  send(options: { to: string; subject: string; html: string }): Promise<void>;
}

@injectable()
export class EmailService implements IEmailService {
  private transporter: Transporter | null = null;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor() {
    this.fromEmail = process.env['SMTP_FROM'] || 'noreply@gestorpro.com';
    this.frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:5173';
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = process.env['SMTP_HOST'];
    const port = parseInt(process.env['SMTP_PORT'] || '587', 10);
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASS'];

    if (!host || !user || !pass) {
      console.warn('⚠️ Email service not configured. Emails will not be sent.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      console.warn(`📧 Email would be sent to: ${to}`);
      console.warn(`   Subject: ${subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"GestorPro" <${this.fromEmail}>`,
      to,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(to: string, token: string, userName: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = 'Recuperação de Senha - GestorPro';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GestorPro</h1>
          </div>
          <div class="content">
            <h2>Olá, ${userName}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha. Se você não fez essa solicitação, pode ignorar este email.</p>
            <p>Para redefinir sua senha, clique no botão abaixo:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetLink}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GestorPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const loginLink = `${this.frontendUrl}/login`;
    const subject = 'Bem-vindo ao GestorPro!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GestorPro</h1>
          </div>
          <div class="content">
            <h2>Bem-vindo, ${userName}!</h2>
            <p>Sua conta foi criada com sucesso no GestorPro.</p>
            <p>Agora você pode acessar a plataforma e começar a gerenciar seus projetos:</p>
            <p style="text-align: center;">
              <a href="${loginLink}" class="button">Acessar GestorPro</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GestorPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendEmailVerification(to: string, token: string, userName: string): Promise<void> {
    const verifyLink = `${this.frontendUrl}/verify-email?token=${token}`;
    const subject = 'Verifique seu email - GestorPro';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GestorPro</h1>
          </div>
          <div class="content">
            <h2>Olá, ${userName}!</h2>
            <p>Obrigado por se cadastrar no GestorPro. Para completar seu registro, verifique seu email clicando no botão abaixo:</p>
            <p style="text-align: center;">
              <a href="${verifyLink}" class="button">Verificar Email</a>
            </p>
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #3b82f6;">${verifyLink}</p>
            <p><strong>Este link expira em 24 horas.</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GestorPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendNotificationEmail(to: string, subject: string, content: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GestorPro</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GestorPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }

  async send(options: { to: string; subject: string; html: string }): Promise<void> {
    await this.sendEmail(options.to, options.subject, options.html);
  }
}


