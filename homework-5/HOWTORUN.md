# HOWTORUN — Homework 5: MCP Servers

This guide explains how to **install dependencies**, **run the custom MCP server**, **connect the MCP
configuration**, and **use / test** each of the four servers.

> **MCP concepts used here**
> - **Resources** are *URIs Claude can read from* (files, APIs, query results). They are passive — Claude pulls
>   content from them. Example: `lorem://words/30`.
> - **Tools** are *actions Claude can call* to perform an operation (read a file, run a command, create an issue).
>   They are active — Claude invokes them with arguments. Example: the `read` tool below.

---

## 1. Prerequisites

| Tool | Used by | Check |
|------|---------|-------|
| Python 3.10+ | custom MCP server | `python --version` |
| Node.js + `npx` | Filesystem & Notion MCP | `npx --version` |
| GitHub Personal Access Token | GitHub MCP | scopes: `repo`, `read:org` |
| Notion integration token *(local option)* | Notion MCP | from notion.so/my-integrations |

---

## 2. Install dependencies (custom server)

```bash
cd homework-5
python -m pip install -r custom-mcp-server/requirements.txt
```

`requirements.txt` pins **`fastmcp>=2.0`** (verified working on `fastmcp 3.4.2`).

---

## 3. Run the custom MCP server

```bash
# from homework-5/
python custom-mcp-server/server.py
# or, equivalently, via the FastMCP CLI:
fastmcp run custom-mcp-server/server.py
```

The server starts on the default **stdio** transport and registers:
- Resource `lorem://words` — first 30 words of `lorem-ipsum.md` (default).
- Resource template `lorem://words/{word_count}` — first `word_count` words.
- Tool `read(word_count=30)` — returns the first `word_count` words.

---

## 4. Connect the MCP configuration

The repo ships `homework-5/.mcp.json` with all four servers. Claude Code auto-loads `.mcp.json` from the
project root. **Set secrets as environment variables before launching** — they are referenced as `${VAR}` and
are never committed:

```bash
# PowerShell
$env:GITHUB_PAT      = "ghp_xxx"   # GitHub PAT (repo, read:org)
$env:NOTION_TOKEN    = "ntn_xxx"   # only for the local npx Notion option
$env:FILESYSTEM_PATH = "homework-5"   # dir the Filesystem MCP may access

# bash
export GITHUB_PAT=ghp_xxx
export NOTION_TOKEN=ntn_xxx
export FILESYSTEM_PATH=/path/to/homework-5
```

> No absolute machine paths are committed — the Filesystem server's allowed directory is supplied via
> `${FILESYSTEM_PATH}`. Point it at your own checkout of `homework-5` (or any directory you want to expose).

Then in Claude Code run **`/mcp`** to see the servers and approve them.

### Per-server notes

- **github** — remote hosted server `https://api.githubcopilot.com/mcp/`, authenticated with the `Bearer`
  token from `${GITHUB_PAT}`. No Docker required.
- **filesystem** — `npx @modelcontextprotocol/server-filesystem` scoped to the directory in
  `${FILESYSTEM_PATH}` (point it at your `homework-5` checkout).
- **notion** — two options:
  - *Local (in `.mcp.json`)*: `npx @notionhq/notion-mcp-server` with `${NOTION_TOKEN}`.
  - *Hosted / claude.ai connector*: run `/mcp` in Claude Code and authenticate **"claude.ai Notion"** (OAuth,
    endpoint `https://mcp.notion.com/mcp`) — no token needed.
- **lorem-ipsum** — the custom server above, launched as `python custom-mcp-server/server.py`.

---

## 5. Use / test each server

### Custom `read` tool
In Claude Code, after `/mcp` lists `lorem-ipsum`, prompt:
> "Use the lorem-ipsum **read** tool with word_count 10."

Expected: exactly 10 words — `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do`.
Calling `read` with no argument returns 30 words; reading the resource `lorem://words/5` returns 5.

### GitHub MCP
> "List the 5 most recent pull requests in my repository." (or summarize commits / create an issue)

### Filesystem MCP
> "List the files in the homework-5 directory and read TASKS.md."

### Notion MCP
> "Give me the pages of the last 5 bugs on my project." — report page IDs/titles only, no sensitive content.

---

## 6. Quick self-test of the custom server (no client needed)

```bash
cd homework-5
python -c "import sys; sys.path.insert(0,'custom-mcp-server'); import server; print(server._read_words(7))"
# -> Lorem ipsum dolor sit amet, consectetur adipiscing
```
