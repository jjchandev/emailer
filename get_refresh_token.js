const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
];

// Load client secrets from gmailapicredentials.json
const credentials = JSON.parse(fs.readFileSync('gmailapicredentials.json'));

const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Generate auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // Important to get refresh token
  scope: SCOPES,
  prompt: 'consent',      // Always show consent screen to get refresh token
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('Tokens acquired:');
    console.log(tokens);
    console.log('\nSave the refresh_token somewhere safe to use in your app:');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('Error retrieving access token', error);
  }
});
