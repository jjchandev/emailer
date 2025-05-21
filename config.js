const fs = require('fs');
const path = require('path');

// Gmail OAuth2 credentials and token
const gmailCreds = require('./gmailapicredentials.json').installed;
const gmailToken = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'gmail_token.json')));

module.exports = {
  OAUTH: {
    clientId: '246923871021-j3krkck8d5m1pnh43stsrb01iem3olof.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://localhost', // or your redirect URI
    refreshToken: '1//0gLD6ZKWZlQ6hCgYIARAAGBASNwF-L9IrNe56DNMT7b0C91z4_p6eYPKutPaH5NzvuB69wBPkpxegM5BMronGrdDDESA0cQeHuN4',
    user: 'goldwebdesigns5@gmail.com',
  },
  GOOGLE_CREDENTIALS_FILE: './sheetsapicredentials.json',
  GOOGLE_API_SCOPES: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/gmail.send'],
  SHEET_ID: '1Q4OxZ6hjoUjzPuDkcJi6rlM4FNjWYHe_Kd-vDgupp98',
  SHEET_RANGE: 'AutomatedContacts!A2:H',
  EMAIL_TEMPLATE: {
  subject: name => `Hi ${name}, we'd love to connect`,

  text: (name, opener) => `
Hi ${name},

${opener ? `\n\n${opener}` : ''}

I'm Binh Le from Gold Web Designs Singapore, and I help cafes build custom websites that bring in customers — with features like online menus, reservation booking, and seasonal promotions tailored to the café experience.

If you want, I can show you some easy ways to get more customers from your website. It’s free and only takes 30 minutes.

Book a free chat: https://calendly.com/goldwebdesigns5/30min

Regards,
Binh Le
WhatsApp: +84 909 427 085
`,

  html: (name, opener) => `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:20px;">
        <img src="https://www.goldwebdesigns.com/logo.webp" alt="Gold Web Designs" width="100" style="display:block;">
      </td></tr>
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd;">
          <tr><td style="padding:30px;">
            <h2 style="margin-top:0;">Hi ${name},</h2>
            ${opener ? `<p>${opener}</p>` : ''}
            <p>I'm <strong>Binh Le</strong> from Gold Web Designs Singapore, and I help cafes build custom websites that bring in real customers — with features like online menus, reservation booking, and seasonal promotions tailored to the café experience.</p>
            <p>If you want, I can show you some easy ways to get more customers from your website. It’s free and only takes 30 minutes.</p>
<p style="text-align:center;">
  <a href="https://calendly.com/goldwebdesigns5/30min" target="_blank"
     style="display:inline-block;padding:12px 24px;text-decoration:none;background:#0073e6;color:#fff;border-radius:4px;">
    Book a Free Chat
  </a>
</p>
            <p style="text-align:center;margin-top:10px;">
              <a href="https://goldwebdesigns.com/" target="_blank"
                 style="display:inline-block;padding:8px 20px;
                        text-decoration:none;
                        background:transparent;
                        color:#0073e6;
                        border:1px solid #0073e6;
                        border-radius:4px;
                        font-size:14px;
                        opacity:0.75;">
                Check out our works
              </a>
            </p>
            <p>Looking forward to chatting,<br>
               Binh Le<br>
               <a href="https://wa.me/84909427085" target="_blank"
                  style="color:#0073e6;text-decoration:none;">
                 WhatsApp: +84 909 427 085
               </a>
            </p>
          </td></tr>
          <tr><td style="padding:10px;font-size:12px;color:#999;text-align:center;">
            213 Serangoon Avenue 4, Singapore<br>
            © 2025 Gold Web Designs. All rights reserved.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
`,
}
};
