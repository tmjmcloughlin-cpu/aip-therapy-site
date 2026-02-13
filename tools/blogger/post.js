#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('tools/blogger/.env') });

const argv = await yargs(hideBin(process.argv))
  .option('title', { type: 'string', demandOption: true })
  .option('htmlFile', { type: 'string', demandOption: true, describe: 'Path to an .html file containing post content' })
  .option('labels', { type: 'string', describe: 'Comma-separated labels' })
  .option('mode', { type: 'string', choices: ['draft', 'publish'], describe: 'Override default mode' })
  .option('blogUrl', { type: 'string', describe: 'Override BLOGGER_BLOG_URL' })
  .strict()
  .parse();

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}. Create tools/blogger/.env`);
  return v;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function getAuthedClient() {
  const credentialsPath = path.resolve(mustEnv('GOOGLE_OAUTH_CREDENTIALS_PATH'));
  const tokenPath = path.resolve(mustEnv('GOOGLE_OAUTH_TOKEN_PATH'));

  const creds = readJson(credentialsPath);
  const client = creds.installed ?? creds.web;
  const oauth2Client = new google.auth.OAuth2({
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri: (client.redirect_uris && client.redirect_uris[0]) || 'http://localhost',
  });

  if (!fs.existsSync(tokenPath)) {
    throw new Error(`Missing token file at ${tokenPath}. Run: node tools/blogger/auth.js`);
  }
  oauth2Client.setCredentials(readJson(tokenPath));
  return oauth2Client;
}

async function resolveBlogId(blogger, blogUrl) {
  const res = await blogger.blogs.getByUrl({ url: blogUrl });
  if (!res?.data?.id) throw new Error(`Could not resolve blog id from URL: ${blogUrl}`);
  return res.data.id;
}

async function main() {
  const mode = (argv.mode || process.env.BLOGGER_DEFAULT_MODE || 'draft').toLowerCase();
  const blogUrl = (argv.blogUrl || process.env.BLOGGER_BLOG_URL || '').trim();
  if (!blogUrl) throw new Error('Missing BLOGGER_BLOG_URL (set in tools/blogger/.env)');

  const htmlPath = path.resolve(argv.htmlFile);
  const content = fs.readFileSync(htmlPath, 'utf8');

  const auth = await getAuthedClient();
  const blogger = google.blogger({ version: 'v3', auth });

  const blogId = await resolveBlogId(blogger, blogUrl);

  const labels = argv.labels
    ? argv.labels.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  const requestBody = {
    kind: 'blogger#post',
    title: argv.title,
    content,
    labels,
  };

  const isDraft = mode !== 'publish';

  const res = await blogger.posts.insert({
    blogId,
    isDraft,
    requestBody,
  });

  const post = res.data;
  console.log(JSON.stringify({
    ok: true,
    mode,
    blogId,
    postId: post.id,
    url: post.url,
    title: post.title,
  }, null, 2));
}

main().catch((err) => {
  console.error('Post failed:', err?.message || err);
  process.exit(1);
});
