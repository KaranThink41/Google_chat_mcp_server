import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.memberships.readonly',
  'https://www.googleapis.com/auth/chat.spaces.readonly'
];

async function getRefreshToken() {
  try {
    const credentialsPath = join(process.cwd(), 'temp-credentials.json');
    const credentialsContent = readFileSync(credentialsPath, 'utf8');
    const credentialsJson = JSON.parse(credentialsContent);
    const clientId = credentialsJson.web.client_id;
    const clientSecret = credentialsJson.web.client_secret;

    const auth = await authenticate({
      scopes: SCOPES,
      keyfilePath: credentialsPath
    });

    const credentials = auth.credentials;
    
    console.log('\nClient ID:', clientId);
    console.log('\nClient Secret:', clientSecret);
    console.log('\nRefresh Token:', credentials.refresh_token);

    writeFileSync('token.json', JSON.stringify(credentials, null, 2));
    console.log('\nCredentials saved to token.json');
    
  } catch (error) {
    console.error('Error getting refresh token:', error);
  }
}

getRefreshToken();
