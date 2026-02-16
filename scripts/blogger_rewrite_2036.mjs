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

// 1) Make 2036 row clearer in the top table
content = content.replace(
  /<td><strong>2036\*<\/strong><\/td>[\s\S]*?<\/tr>/,
  `<td><strong>2036*</strong></td>
<td>Act like a personal advisor that recommends what to do next.</td>
<td>Become the most trusted answer in your niche (not just “ranked”).</td>
<td>Answer engines, assistants, marketplaces and paid placements.</td>
<td>Brands with verified proof, strong reputation, and easy buying paths.</td>
</tr>`
);

// 2) Replace the old 2036 satire section with a clearer one
content = content.replace(
  /<h3>2036 \(for fun\): [\s\S]*?<hr\s*\/>/,
  `<h3>2036 (speculative, but useful): “Search becomes guidance” era</h3>
<p>By 2036, people may not “search” in the old way. They’ll ask systems for guidance and get one recommended path.</p>
<p>That means visibility will depend less on a single page rank and more on whether your business is trusted enough to be selected.</p>
<p>The practical implication today:</p>
<ul>
  <li>Build proof that can be verified (case studies, outcomes, reviews).</li>
  <li>Keep your service and location signals consistent everywhere.</li>
  <li>Make it easy for users to take action once you are recommended.</li>
</ul>
<p>So yes, 2036 is a guess — but the direction is clear: trust and proof become the ranking layer above content.</p>
<hr />`
);

// 3) Clarify the 2036 line in Chart 1
content = content.replace(
  /2036\* \| Answer layers: ██████████ \(100%\)/,
  '2036* | Assisted answers: ██████████ (dominant)'
);

await blogger.posts.update({
  blogId: BLOG_ID,
  postId: POST_ID,
  requestBody: {
    ...post,
    content,
  },
});

console.log('Rewrote 2036 sections successfully');
