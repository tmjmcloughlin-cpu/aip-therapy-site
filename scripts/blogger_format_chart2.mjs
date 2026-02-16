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

const replacement = `
<h4>Chart 2: where to invest time (UK business edition)</h4>
<p><strong>Why this is included:</strong> most businesses don’t fail from lack of tactics — they fail from poor sequencing. This section helps you decide what to do first.</p>

<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
  <thead>
    <tr>
      <th>Priority tier</th>
      <th>What to focus on</th>
      <th>Why it matters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>High impact, low effort</strong></td>
      <td>
        <ul>
          <li>Fix your top 2 money pages</li>
          <li>GBP hygiene + reviews</li>
          <li>Internal linking from support content to money pages</li>
        </ul>
      </td>
      <td>Fastest route to better enquiries without adding lots of new work.</td>
    </tr>
    <tr>
      <td><strong>High impact, higher effort</strong></td>
      <td>
        <ul>
          <li>Credible proof assets (case studies, outcomes, comparisons)</li>
          <li>Real mentions/partnerships</li>
          <li>Structured data where it genuinely fits</li>
        </ul>
      </td>
      <td>Builds long-term authority and recommendation strength.</td>
    </tr>
    <tr>
      <td><strong>Low impact distractions (usually)</strong></td>
      <td>
        <ul>
          <li>Publishing 30 thin blogs</li>
          <li>Chasing every new feature without measurement</li>
        </ul>
      </td>
      <td>Looks productive but rarely moves pipeline.</td>
    </tr>
  </tbody>
</table>
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

console.log('Reformatted Chart 2 section successfully');
