# Python Movie CLI — CLAUDE.md

## Project overview

A terminal-based movie suggestion assistant that lets users discover films through
natural language. All MCP communication and agent orchestration is handled by the
`mcpbuilder-ai` Python package — this project only owns the CLI layer (prompting the
user, printing results).

**SDK docs:** https://pypi.org/project/mcpbuilder-ai/

---

## Folder structure

```
python-movie-cli/
├── CLAUDE.md
├── .claude/
│   └── agents/
│       └── movie-agent.md      ← sub-agent definition (see below)
├── main.py                     ← entry point / CLI loop
├── requirements.txt
└── .env.example                ← TMDB_API_KEY=your_key_here
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Language | Python 3.11+ |
| MCP / agent SDK | `mcpbuilder-ai` (PyPI) |
| API | TMDB v3 (`https://api.themoviedb.org/3`) |
| Auth | `api_key` query param (free, no credit card) |
| Key env var | `TMDB_API_KEY` |

---

## MCP server & available tools

The MCP server is the **TMDB Movie Discovery** server. The agent has access to five
tools. You must pass `api_key=<TMDB_API_KEY>` as a query parameter on every call.

| Tool | TMDB endpoint | Purpose |
|---|---|---|
| `search_movies` | `GET /search/movie` | Full-text search by title |
| `get_movie_details` | `GET /movie/{movie_id}` | Full details for one movie |
| `get_trending_movies` | `GET /trending/movie/{time_window}` | Trending (day / week) |
| `discover_movies` | `GET /discover/movie` | Filter by genre, rating, year, sort |
| `get_movie_genres` | `GET /genre/movie/list` | Resolve genre IDs → names |

Key notes:
- Genre IDs in search/discover results are integers; call `get_movie_genres` first when
  the user specifies a genre by name.
- Images: `https://image.tmdb.org/t/p/w342{poster_path}` (display in terminal with a
  URL or skip for pure text output).
- Attribution: show "Data provided by TMDB — themoviedb.org" somewhere in the UI.

---

## What `main.py` must do

1. Load `TMDB_API_KEY` from the environment (fail fast with a clear message if absent).
2. Initialise the `mcpbuilder-ai` agent, pointing it at the TMDB MCP server and the
   sub-agent definition in `.claude/agents/movie-agent.md`.
3. Run an interactive REPL:
   - Print a welcome banner.
   - Read a line of natural-language input from the user (`input("🎬 > ")`).
   - Pass it to the agent; let the SDK call tools as needed.
   - Pretty-print the agent's answer (title, year, rating, short overview — one movie
     per line for lists).
   - Loop until the user types `quit` or `exit`.

The CLI must **not** hard-code any TMDB HTTP calls — the agent handles everything.

---

## Setup instructions (for Claude Code / developers)

```bash
cd python-movie-cli
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then fill in your TMDB_API_KEY
python main.py
```

`requirements.txt` must include at minimum:
```
mcpbuilder-ai==1.0.1
python-dotenv
```

---

## Example interactions

```
🎬 > What are the top trending movies this week?
🎬 > Find sci-fi movies from 2023 with a rating above 7.5
🎬 > Tell me more about Dune: Part Two
🎬 > Show me some horror movies
🎬 > quit
```

---

## Sub-agent

See `.claude/agents/movie-agent.md` for the agent's system prompt and tool bindings.
Claude Code should **not** modify the agent file unless explicitly asked; treat it as
the authoritative behaviour spec for the assistant persona.
