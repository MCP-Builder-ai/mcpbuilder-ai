# Recipe Finder — TypeScript

An interactive recipe exploration CLI powered by the `mcpbuilder-ai` SDK. Ask questions in natural language and get recipe suggestions, full ingredient lists, cuisine filters, and more — all via TheMealDB.

## Prerequisites

- Node.js 18+
- A `DEPLOYMENT_NAME` and `PROJECT_TOKEN` from your mcpbuilder-ai project

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and fill in your credentials:

   ```env
   DEPLOYMENT_NAME=your_deployment_name_here
   PROJECT_TOKEN=your_project_token_here
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Or build and run for production:

   ```bash
   npm run build && npm start
   ```

## Usage

```
🍽️  > Find me a chicken recipe
🍽️  > What Italian meals are available?
🍽️  > Show me the full recipe for Spaghetti Carbonara, ingredients and steps
🍽️  > Surprise me with a random meal
🍽️  > quit
```

Type `quit` or `exit` to leave.

---

Data provided by TheMealDB — themealdb.com
