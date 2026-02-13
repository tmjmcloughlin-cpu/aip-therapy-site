#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('tools/blogger/.env') });

const SCOPES = ['https://www.googleapis.com/auth/blogger'];

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}. Create tools/blogger/.env`);
  return v;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  return answer.trim();
}

async function main() {
  const credentialsPath = path.resolve(mustEnv('GOOGLE_OAUTH_CREDENTIALS_PATH'));
  const tokenPath = path.resolve(mustEnv('GOOGLE_OAUTH_TOKEN_PATH'));

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Missing credentials JSON at: ${credentialsPath}\nDownload OAuth Desktop credentials from Google Cloud and save as tools/blogger/credentials.json`);
  }

  const creds = readJson(credentialsPath);
  const client = creds.installed ?? creds.web;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error('credentials.json does not look like a valid OAuth client file (expected installed.client_id/client_secret).');
  }

  const oauth2Client = new google.auth.OAuth2({
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri: (client.redirect_uris && client.redirect_uris[0]) || 'http://localhost',
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\nOpen this URL in your browser and complete consent:');
  console.log(authUrl);
  console.log('\nThen paste the code you receive here.');

  const code = await prompt('Code: ');
  if (!code) throw new Error('No code provided.');

  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens?.refresh_token) {
    console.warn('\nWARNING: No refresh_token returned. This usually means you already authorised this client_id before.');
    console.warn('Fix: In your Google Account -> Security -> Third-party access, remove the app, then run again.');
  }

  ensureDirForFile(tokenPath);
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.log(`\nSaved tokens to: ${tokenPath}`);
  console.log('Auth complete.');
}

main().catch((err) => {
  console.error('\nAuth failed:', err?.message || err);
  process.exit(1);
});
