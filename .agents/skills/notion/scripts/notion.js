import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Load .env file manually if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const NOTION_API_KEY = process.env.NOTION_API_KEY;

function notionRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    if (!NOTION_API_KEY || NOTION_API_KEY.includes('your_notion_api_key')) {
      reject(new Error('NOTION_API_KEY is not configured in .env. Please add your secret_... key to .env'));
      return;
    }

    const url = new URL(`https://api.notion.com/v1${endpoint}`);
    const payload = data ? JSON.stringify(data) : null;

    const req = https.request(url, {
      method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`Notion API Error (${res.statusCode}): ${parsed.message || body}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function extractPageId(input) {
  if (!input) return null;
  // Match 32 char hex or dashed UUID
  const clean = input.replace(/-/g, '');
  const match = clean.match(/([a-f0-9]{32})/i);
  if (match) {
    const hex = match[1];
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return input;
}

function blockToMarkdown(block) {
  const type = block.type;
  const value = block[type];
  if (!value) return '';

  const getPlainText = (richTexts) => {
    if (!richTexts || !Array.isArray(richTexts)) return '';
    return richTexts.map(t => {
      let text = t.plain_text || '';
      if (t.annotations?.bold) text = `**${text}**`;
      if (t.annotations?.italic) text = `*${text}*`;
      if (t.annotations?.code) text = `\`${text}\``;
      return text;
    }).join('');
  };

  const text = getPlainText(value.rich_text);

  switch (type) {
    case 'heading_1':
      return `# ${text}\n`;
    case 'heading_2':
      return `## ${text}\n`;
    case 'heading_3':
      return `### ${text}\n`;
    case 'paragraph':
      return `${text}\n`;
    case 'bulleted_list_item':
      return `- ${text}`;
    case 'numbered_list_item':
      return `1. ${text}`;
    case 'to_do':
      return `- [${value.checked ? 'x' : ' '}] ${text}`;
    case 'code':
      return `\`\`\`${value.language || ''}\n${text}\n\`\`\`\n`;
    case 'callout':
      return `> 💡 ${text}\n`;
    case 'quote':
      return `> ${text}\n`;
    case 'divider':
      return `---\n`;
    default:
      return text ? `${text}\n` : '';
  }
}

async function fetchPageMarkdown(pageIdOrUrl) {
  const pageId = extractPageId(pageIdOrUrl);
  if (!pageId) {
    throw new Error('Invalid Notion Page ID or URL');
  }

  // Fetch page info
  const page = await notionRequest(`/pages/${pageId}`);
  const titleProp = Object.values(page.properties || {}).find(p => p.type === 'title');
  const title = titleProp?.title?.[0]?.plain_text || 'Untitled Page';

  let markdown = `# ${title}\n\n`;

  // Fetch page blocks
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const endpoint = `/blocks/${pageId}/children?page_size=100${startCursor ? `&start_cursor=${startCursor}` : ''}`;
    const blocksData = await notionRequest(endpoint);

    for (const block of blocksData.results) {
      markdown += blockToMarkdown(block) + '\n';
    }

    hasMore = blocksData.has_more;
    startCursor = blocksData.next_cursor;
  }

  return markdown;
}

async function searchNotion(query) {
  const results = await notionRequest('/search', 'POST', {
    query,
    page_size: 10
  });

  return results.results.map(r => ({
    id: r.id,
    url: r.url,
    object: r.object,
    title: r.properties?.title?.title?.[0]?.plain_text || r.properties?.Name?.title?.[0]?.plain_text || 'Untitled'
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage: node notion.js <fetch|search> <arg>');
    process.exit(1);
  }

  try {
    if (command === 'fetch') {
      const markdown = await fetchPageMarkdown(args[1]);
      console.log('=== NOTION PAGE MARKDOWN ===');
      console.log(markdown);
    } else if (command === 'search') {
      const list = await searchNotion(args[1] || '');
      console.log(JSON.stringify(list, null, 2));
    } else {
      console.error(`Unknown command: ${command}`);
    }
  } catch (err) {
    console.error('Notion Error:', err.message);
    process.exit(1);
  }
}

main();
