# 🔌 Homework 5: MCP Server Configuration

> **Student Name**: Dmitry Upatov
> **Date Submitted**: 2026-06-21
> **AI Tools Used**: Claude Code (Opus 4.8)

## 📋 Project Overview

This homework configures **four Model Context Protocol (MCP) servers** for the development environment
(Claude Code) and builds one **custom MCP server** with [FastMCP](https://gofastmcp.com):

| # | Server | Type | Purpose |
|---|--------|------|---------|
| 1 | **GitHub** | Remote hosted (`https://api.githubcopilot.com/mcp/`) | Query repositories, PRs, commits, issues |
| 2 | **Filesystem** | `npx @modelcontextprotocol/server-filesystem` | Read/list files in the `homework-5` folder |
| 3 | **Notion** | claude.ai connector / `npx @notionhq/notion-mcp-server` | Query project pages (e.g. last 5 bugs) |
| 4 | **lorem-ipsum** | Custom FastMCP `server.py` | Read word-limited text from `lorem-ipsum.md` |

All four are registered in [`.mcp.json`](./.mcp.json). Run instructions are in [`HOWTORUN.md`](./HOWTORUN.md).

---

## 🧠 MCP concepts: Resources vs Tools

- **Resources** are **URIs Claude can read from** (files, APIs, query outputs). They are *passive* — Claude pulls
  their content. The custom server exposes `lorem://words` and `lorem://words/{word_count}`.
- **Tools** are **actions Claude can call** to perform an operation (read a file, run a command, create an issue).
  They are *active* — Claude invokes them with arguments. The custom server exposes the `read` tool.

---

## 🛠 The custom MCP server

`custom-mcp-server/server.py` (FastMCP) reads `custom-mcp-server/lorem-ipsum.md` and returns a word-limited slice:

- **Resource** `lorem://words` → first **30** words (default).
- **Resource template** `lorem://words/{word_count}` → first `word_count` words.
- **Tool** `read(word_count=30)` → first `word_count` words; Claude can call it directly.

```python
@mcp.tool
def read(word_count: int = 30) -> str:
    """Read text from lorem-ipsum.md, limited to word_count words."""
    return _read_words(word_count)
```

**Verified locally** (FastMCP in-memory client, `fastmcp 3.4.2`):
- `read(7)` → `Lorem ipsum dolor sit amet, consectetur adipiscing` (7 words ✅)
- `read()` → 30 words ✅
- resource `lorem://words/10` → 10 words ✅

---

## 📁 Structure

```
homework-5/
├── README.md                       # this file
├── HOWTORUN.md                     # install, run, connect, test
├── .mcp.json                       # all 4 servers registered
├── custom-mcp-server/
│   ├── server.py                   # FastMCP server (resource + read tool)
│   ├── lorem-ipsum.md              # source text
│   └── requirements.txt            # fastmcp>=2.0
└── docs/screenshots/               # MCP call evidence (see below)
```

---

## 📸 Screenshots

Located in [`docs/screenshots/`](./docs/screenshots/):

| File | Demonstrates |
|------|--------------|
| `github-mcp-result.png` | GitHub MCP call + result |
| `filesystem-mcp-result.png` | Filesystem MCP call + result |
| `notion-mcp-result.png` | Notion "last 5 bugs" request + response (IDs/titles only) |
| `custom-mcp-read-tool-result.png` | Custom `read` tool call + word-limited output |

---

## 🔐 Security

No secrets are committed. `.mcp.json` references `${GITHUB_PAT}` and `${NOTION_TOKEN}`, which are supplied as
environment variables at runtime. The Filesystem server is scoped to a single directory.

---

## ▶️ How to run

See [`HOWTORUN.md`](./HOWTORUN.md) — install dependencies, start the custom server, set env vars, run `/mcp`
in Claude Code, and test the `read` tool.
