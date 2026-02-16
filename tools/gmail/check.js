#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: path.resolve('tools/gmail/.env') });

function mustEnv(name) { const v = process.env[name]; if (!v) throw new Error(`Missing ${name}`); return v; }
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const creds = readJson(path.resolve(mustEnv('GOOGLE_OAUTH_CREDENTIALS_PATH')));
const token = readJson(path.resolve(mustEnv('GOOGLE_OAUTH_TOKEN_PATH')));
const client = creds.installed ?? creds.web;

const oauth2Client = new google.auth.OAuth2({
  clientId: client.client_id,
  clientSecret: client.client_secret,
  redirectUri: (client.redirect_uris && client.redirect_uris[0]) || 'http://localhost',
});
oauth2Client.setCredentials(token);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
const profile = await gmail.users.getProfile({ userId: 'me' });
console.log(JSON.stringify({ ok:true, email: profile.data.emailAddress, messagesTotal: profile.data.messagesTotal }, null, 2));
