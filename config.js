const fs = require('fs');
const path = require('path');

// Gmail OAuth2 credentials and token
const gmailCreds = require('./gmailapicredentials.json').installed;
const gmailToken = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'gmail_token.json')));

module.exports = {
  OAUTH: {
    clientId: gmailCreds.client_id,
    clientSecret: gmailCreds.client_secret,
    redirectUri: gmailCreds.redirect_uris[0],
    refreshToken: gmailToken.refresh_token,
    user: 'goldwebdesigns5@gmail.com', // replace with your Gmail address
  },
  GOOGLE_CREDENTIALS_FILE: './sheetsapicredentials.json',
  GOOGLE_API_SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  SHEET_ID: '1Q4OxZ6hjoUjzPuDkcJi6rlM4FNjWYHe_Kd-vDgupp98',
  SHEET_RANGE: 'AutomatedContacts!A2:F',
  EMAIL_TEMPLATE: {
  subject: (name) => `Hi ${name}, we'd love to connect`,
  body: (name) => 
`Hi ${name},

I came across your Instagram profile and wanted to reach out personally. I'm Binh Le from Gold Web Designs, and I specialize in helping roofing companies build high-performing websites that bring in real leads — not just likes.

Whether you're starting from scratch or looking to upgrade what you’ve got, I’d love to offer you a free 30-minute strategy session. We’ll talk about how your website can work harder for you — from showcasing past projects to turning visitors into paying customers.

👉 Book a time that works for you: https://calendly.com/goldwebdesigns5/30min

No pressure — just practical insights from someone who understands the digital needs of service businesses like yours.

Looking forward to chatting with you,
Binh Le
WhatsApp: +84 909 427 085

[goldwebdesigns](https://www.goldwebdesigns.com)`
},
};
