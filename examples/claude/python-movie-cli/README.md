# CineGuide — Movie Discovery CLI

A terminal-based movie assistant powered by the `mcpbuilder-ai` SDK. Ask questions in natural language and get movie suggestions, trending films, genre filters, and more.

## Prerequisites

- Python 3.11+
- A `DEPLOYMENT_NAME` and `PROJECT_TOKEN` from your mcpbuilder-ai project

## Setup

1. **Create and activate a virtual environment**

   ```bash
   python -m venv .venv
   ```

   - **Windows (PowerShell):** `.venv\Scripts\activate`
   - **Mac / Linux:** `source .venv/bin/activate`

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and fill in your credentials:

   ```env
   DEPLOYMENT_NAME=your_deployment_name_here
   PROJECT_TOKEN=your_project_token_here
   ```

4. **Run**

   ```bash
   python main.py
   ```

## Usage

```
🎬 > What are the top trending movies this week?
🎬 > Find sci-fi movies from 2023 with a rating above 7.5
🎬 > Tell me more about Dune: Part Two
🎬 > Show me some horror movies
🎬 > quit
```

Type `quit` or `exit` (or press `Ctrl+C`) to leave.

---

Data provided by TMDB — themoviedb.org
