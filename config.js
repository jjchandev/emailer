require('dotenv').config();

module.exports = {
  SHEET_ID: '1Q4OxZ6hjoUjzPuDkcJi6rlM4FNjWYHe_Kd-vDgupp98',
  SHEET_RANGE: 'Sheet1!A2:C',
  GOOGLE_API_SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  GOOGLE_CREDENTIALS_FILE: 'credentials.json',
  GMAIL: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  EMAIL_TEMPLATE: {
    subject: (company) => `Special Offer for ${company}`,
    body: (company) => `Hi ${company},\n\nWe wanted to reach out with a special opportunity for your business.\n\nPlease reply if you're interested.\n\nBest,\nYour Company`,
  },
};
