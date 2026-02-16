import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: path.resolve('tools/blogger/.env') });

const BLOG_ID = '2781411566405651217';
const POST_ID = '1598397893517227482';

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}
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

const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
const current = await blogger.posts.get({ blogId: BLOG_ID, postId: POST_ID });
const post = current.data;
let content = post.content || '';

// 1) Add visible table borders to the top summary table (first table only)
content = content.replace(
  /<table>/,
  '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
);

// 2) Replace the "Impact vs Effort" block with tighter 30-day action sequence
const replacement = `
<h4>What this means for your next 30 days</h4>
<p>Don’t try to “do modern SEO” everywhere at once. Pick one service line and run this sequence:</p>
<ol>
  <li><strong>Fix the two pages that already make you money</strong><br/>Tighten intent, proof, and CTA.</li>
  <li><strong>Align GBP + reviews to that same service intent</strong><br/>Make your local trust signals support the same conversion goal.</li>
  <li><strong>Strengthen entity proof</strong><br/>Add case evidence, comparisons, and mentions that make recommendation engines trust you.</li>
  <li><strong>Measure lead quality, not just traffic</strong><br/>If the work isn’t improving qualified enquiries, it’s not a win.</li>
</ol>
<hr />`;

content = content.replace(
  /<h4>Chart 2: where to invest time \(UK business edition\)<\/h4>[\s\S]*?<hr\s*\/>/,
  replacement
);

await blogger.posts.update({
  blogId: BLOG_ID,
  postId: POST_ID,
  requestBody: {
    ...post,
    content,
  },
});

console.log('Patched post successfully');
