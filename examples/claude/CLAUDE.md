# mcpbuilder-ai Examples — Monorepo

This repo contains two standalone example projects demonstrating the `mcpbuilder-ai` SDK.
Each lives in its own subdirectory with its own `CLAUDE.md`.

```
/
├── CLAUDE.md                  ← you are here (overview only)
├── python-movie-cli/          ← Python · TMDB Movie Discovery CLI
│   ├── CLAUDE.md
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── typescript-recipe-finder/  ← TypeScript · MealDB Recipe Finder
    ├── CLAUDE.md
    ├── src/
    │   └── index.ts
    ├── package.json
    ├── tsconfig.json
    └── .env.example
```

## Which project do you want to work on?

- **Movie suggestions CLI (Python)** → `cd python-movie-cli` and read its `CLAUDE.md`.
- **Recipe finder (TypeScript)** → `cd typescript-recipe-finder` and read its `CLAUDE.md`.

Both projects use the [`mcpbuilder-ai`](https://pypi.org/project/mcpbuilder-ai/) SDK
(Python) / [`mcpbuilder-ai`](https://www.npmjs.com/package/mcpbuilder-ai) npm package
(TypeScript) to delegate all MCP communication and agent orchestration to the library —
your code only handles user I/O.
