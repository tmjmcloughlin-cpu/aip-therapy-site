#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const cwd = process.cwd();
const credsPath = process.env.GOOGLE_OAUTH_CLIENT_PATH || path.join(cwd, 'secrets', 'google-oauth-client.json');
const tokenPath = process.env.GOOGLE_OAUTH_TOKEN_PATH || path.join(cwd, 'secrets', 'google-oauth-token.json');

const blogId = process.env.BLOGGER_BLOG_ID;
const title = process.env.BLOGGER_POST_TITLE;
const content = process.env.BLOGGER_POST_HTML;
const isDraft = (process.env.BLOGGER_IS_DRAFT || 'true').toLowerCase() === 'true';

if (!blogId || !title || !content) {
  console.error('Missing env vars. Required: BLOGGER_BLOG_ID, BLOGGER_POST_TITLE, BLOGGER_POST_HTML');
  process.exit(1);
}
if (!fs.existsSync(credsPath)) {
  console.error(`Missing OAuth client file: ${credsPath}`);
  process.exit(1);
}
if (!fs.existsSync(tokenPath)) {
  console.error(`Missing OAuth token file: ${tokenPath}`);
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
const c = creds.installed || creds.web;
const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

const auth = new google.auth.OAuth2(c.client_id, c.client_secret, c.redirect_uris?.[0]);
auth.setCredentials(token);

const blogger = google.blogger({ version: 'v3', auth });

const post = {
  title,
  content,
};

const run = async () => {
  const res = await blogger.posts.insert({
    blogId,
    isDraft,
    requestBody: post,
  });

  console.log(JSON.stringify({
    ok: true,
    id: res.data.id,
    url: res.data.url,
    status: isDraft ? 'draft' : 'published',
  }, null, 2));
};

run().catch((err) => {
  console.error('Blogger publish failed:', err?.response?.data || err.message || err);
  process.exit(1);
});
