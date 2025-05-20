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
  SHEET_RANGE: 'AutomatedContacts!A2:F',
 EMAIL_TEMPLATE: {
  subject: name => `Hi ${name}, we'd love to connect`,
  text: name => `
Hi ${name},

I came across your Instagram profile and wanted to reach out personally. I'm Binh Le from Gold Web Designs, and I specialize in helping roofing companies build high-performing websites that bring in real leads — not just likes.

Book a free 30‑minute strategy session: https://calendly.com/goldwebdesigns5/30min

Regards,
Binh Le
WhatsApp: +84 909 427 085
`,
  html: name => `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:20px;">
        <img src="https://www.goldwebdesigns.com/logo.webp" alt="Gold Web Designs" width="150" style="display:block;">
      </td></tr>
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd;">
          <tr><td style="padding:30px;">
            <h2 style="margin-top:0;">Hi ${name},</h2>
            <p>I came across your Instagram profile and wanted to reach out personally. I'm <strong>Binh Le</strong> from Gold Web Designs, and I specialize in helping roofing companies build high‑performing websites that bring in real leads — not just likes.</p>
            <p>I’d love to offer you a <strong>free 30‑minute strategy session</strong> to explore how your site can turn visitors into paying customers.</p>
            <p style="text-align:center;">
              <a href="https://calendly.com/goldwebdesigns5/30min" target="_blank"
                 style="display:inline-block;padding:12px 24px;text-decoration:none;background:#0073e6;color:#fff;border-radius:4px;">
                Book Your Session
              </a>
            </p>
                <p style="text-align:center;margin-top:10px;">
              <a href="https://goldwebdesigns.com/works" target="_blank"
                 style="display:inline-block;padding:12px 24px;text-decoration:none;background:#28a745;color:#fff;border-radius:4px;">
                Check out our works
              </a>
            </p>
            <p>Looking forward to chatting,<br>Binh Le<br>WhatsApp: +84 909 427 085</p>
          </td></tr>
          <tr><td style="padding:10px;font-size:12px;color:#999;text-align:center;">
            © 2025 Gold Web Designs. All rights reserved.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
`,
},
};
