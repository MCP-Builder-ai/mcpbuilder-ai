# TypeScript Recipe Finder — CLAUDE.md

## Project overview

An interactive recipe exploration tool (Node.js CLI or simple HTTP server) that lets
users search and browse meal recipes through natural language. All MCP communication
and agent orchestration is handled by the `mcpbuilder-ai` npm package — this project
only owns the interface layer.

**SDK docs:** https://www.npmjs.com/package/mcpbuilder-ai

---

## Folder structure

```
typescript-recipe-finder/
├── CLAUDE.md
├── .claude/
│   └── agents/
│       └── recipe-agent.md     ← sub-agent definition (see below)
├── src/
│   └── index.ts                ← entry point / CLI loop
├── package.json
├── tsconfig.json
└── .env.example                ← (no auth needed — left for parity)
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Language | TypeScript (Node.js 18+) |
| MCP / agent SDK | `mcpbuilder-ai` (npm) |
| API | TheMealDB v1 (`https://www.themealdb.com/api/json/v1/1`) |
| Auth | None — test key `1` is embedded in the base URL path |
| Runtime | `tsx` for local dev; `tsc` + `node dist/index.js` for prod |

---

## MCP server & available tools

The MCP server is the **TheMealDB Meal Recipe Finder** server. Six tools are exposed:

| Tool | MealDB endpoint | Purpose |
|---|---|---|
| `search_meals` | `search.php?s=` | Search recipes by name |
| `get_meal_details` | `lookup.php?i=` | Full recipe (ingredients + steps) |
| `list_categories` | `categories.php` | All categories with descriptions |
| `filter_by_category` | `filter.php?c=` | Meals in a category (summary only) |
| `filter_by_cuisine` | `filter.php?a=` | Meals by cuisine/area (summary only) |
| `get_random_meal` | `random.php` | Random recipe of the day |

Key notes:
- `filter_by_category` and `filter_by_cuisine` return **summary** objects (name, thumb,
  ID only). Always follow up with `get_meal_details` when the user wants full
  instructions or ingredients.
- Ingredients are stored as up to 20 numbered fields (`strIngredient1`…`strIngredient20`
  / `strMeasure1`…`strMeasure20`). Zip them to build a clean ingredients list.
- Thumbnail images are in `strMealThumb` — print the URL for reference.
- No API key or auth header needed.

---

## What `src/index.ts` must do

1. Initialise the `mcpbuilder-ai` agent, loading the sub-agent definition from
   `.claude/agents/recipe-agent.md`.
2. Run an interactive REPL:
   - Print a welcome banner.
   - Read natural-language input from `readline`.
   - Pass it to the agent; let the SDK call tools as needed.
   - Print the agent's response to stdout.
   - Loop until the user types `quit` or `exit`.

The CLI must **not** make any direct HTTP calls to TheMealDB — the agent handles that.

---

## Setup instructions (for Claude Code / developers)

```bash
cd typescript-recipe-finder
npm install
npm run dev          # uses tsx src/index.ts
# or
npm run build && npm start
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

`package.json` dependencies must include at minimum:
```json
{
  "dependencies": {
    "mcpbuilder-ai": "1.0.1"
  },
  "devDependencies": {
    "typescript": "^5",
    "tsx": "^4",
    "@types/node": "^20"
  }
}
```

`tsconfig.json` must target ES2022 with `moduleResolution: "bundler"` (or `node16`).

---

## Example interactions

```
🍽️  > Find me a chicken recipe
🍽️  > What Italian meals are available?
🍽️  > Show me the full recipe for Spaghetti Carbonara, ingredients and steps
🍽️  > Surprise me with a random meal
🍽️  > What seafood categories exist?
🍽️  > quit
```

---

## Sub-agent

See `.claude/agents/recipe-agent.md` for the agent's system prompt and tool bindings.
Claude Code should **not** modify the agent file unless explicitly asked; treat it as
the authoritative behaviour spec for the assistant persona.
