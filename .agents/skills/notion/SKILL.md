---
name: notion
description: Access, search, read, and convert Notion pages or PRDs into Markdown for development and planning context. Triggered when the user mentions Notion, Notion pages, Notion PRD, or requests to fetch Notion content.
---

# Notion Agent Skill

This skill allows the agent to interact with Notion to fetch PRD documents, search workspace pages, and convert Notion block structures into markdown format.

## When to use
Use this skill when the user asks to:
- "Read Notion page [URL or Page ID]"
- "Fetch PRD from Notion"
- "Search Notion for [query]"
- "Use Notion doc [Title/Link] for development"

## How to execute

### 1. Check API Key
Ensure `NOTION_API_KEY` is set in `.env` or process environment.

### 2. Run Notion CLI script
Use the project helper script `node .agents/skills/notion/scripts/notion.js <command> [args]`

Available commands:
- **Fetch page content as Markdown**:
  ```bash
  node .agents/skills/notion/scripts/notion.js fetch <page_id_or_url>
  ```
- **Search workspace pages**:
  ```bash
  node .agents/skills/notion/scripts/notion.js search "<search_query>"
  ```

### 3. Apply fetched Markdown
Incorporate the returned Markdown into the current development task, PRDView editor, or project documentation as requested by the user.
