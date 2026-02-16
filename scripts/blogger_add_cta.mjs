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

const ctaBlock = `
<h3>Need this implemented, not just understood?</h3>
<p>If you want help turning this into a practical growth system for your business, Snowfox Digital can help.</p>
<ul>
  <li>Local SEO strategy and implementation</li>
  <li>High-converting service page structure</li>
  <li>Google Business Profile and review system optimisation</li>
  <li>SEO/GEO/AEO execution tied to lead quality</li>
</ul>
<p>See services: <a href="https://snowfox.crd.co" target="_blank" rel="noopener noreferrer">https://snowfox.crd.co</a></p>
<hr />`;

if (!content.includes('Need this implemented, not just understood?')) {
  content = content.replace(/<h3>Sources \/ further reading<\/h3>/, `${ctaBlock}\n<h3>Sources / further reading</h3>`);
}

await blogger.posts.update({
  blogId: BLOG_ID,
  postId: POST_ID,
  requestBody: {
    ...post,
    content,
  },
});

console.log('Inserted CTA/services block successfully');
