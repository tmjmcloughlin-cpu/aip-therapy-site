#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { google } from 'googleapis';

dotenv.config({ path: path.resolve('tools/blogger/.env') });

const argv = await yargs(hideBin(process.argv))
  .option('queue', { type: 'string', default: 'tools/blogger/queue.json', describe: 'Path to queue JSON' })
  .option('limit', { type: 'number', describe: 'Only post the first N items' })
  .option('dryRun', { type: 'boolean', default: false, describe: 'Print what would be posted but do not call API' })
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

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
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

async function insertPost({ blogger, blogId, item, isDraft }) {
  const htmlPath = path.resolve(item.htmlFile);
  const content = fs.readFileSync(htmlPath, 'utf8');

  const requestBody = {
    kind: 'blogger#post',
    title: item.title,
    content,
    labels: item.labels,
  };

  const res = await blogger.posts.insert({
    blogId,
    isDraft,
    requestBody,
  });

  return res.data;
}

async function main() {
  const mode = (argv.mode || process.env.BLOGGER_DEFAULT_MODE || 'draft').toLowerCase();
  const blogUrl = (argv.blogUrl || process.env.BLOGGER_BLOG_URL || '').trim();
  if (!blogUrl) throw new Error('Missing BLOGGER_BLOG_URL (set in tools/blogger/.env)');

  const queuePath = path.resolve(argv.queue);
  const queue = readJson(queuePath);

  const items = argv.limit ? queue.slice(0, argv.limit) : queue;
  const isDraft = mode !== 'publish';

  if (argv.dryRun) {
    console.log(JSON.stringify({ ok: true, dryRun: true, mode, blogUrl, count: items.length, items }, null, 2));
    return;
  }

  const auth = await getAuthedClient();
  const blogger = google.blogger({ version: 'v3', auth });
  const blogId = await resolveBlogId(blogger, blogUrl);

  const results = [];
  for (const item of items) {
    const post = await insertPost({ blogger, blogId, item, isDraft });
    results.push({ title: item.title, postId: post.id, url: post.url, status: post.status });
    // be nice to API
    await sleep(500);
  }

  console.log(JSON.stringify({ ok: true, mode, blogId, created: results.length, results }, null, 2));
}

main().catch((err) => {
  console.error('Batch post failed:', err?.message || err);
  process.exit(1);
});
