# Movie Discovery

## Category
Entertainment & Media

## Description
Search and discover movies using The Movie Database (TMDB). This use case lets users find movies by title, browse trending films, filter by genre or rating, and retrieve detailed information about any movie. Ideal for anyone building a recommendation assistant, watchlist manager, or general movie exploration tool.

## API

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Name**         | The Movie Database (TMDB) API                                          |
| **Base URL**     | `https://api.themoviedb.org/3`                                         |
| **Auth**         | API Key                                                                |
| **Free Tier**    | No request caps; rate limited to ~40–50 req/sec; no credit card needed |
| **Docs**         | https://developer.themoviedb.org/reference/intro/getting-started       |

## MCP Server Tools

These are the tools an MCP server built on this API could expose:

| Tool Name             | Description                                              | Key Parameters                        |
|-----------------------|----------------------------------------------------------|---------------------------------------|
| `search_movies`       | Search for movies by title                               | `query`, `year`, `language`, `page`   |
| `get_movie_details`   | Get full details for a specific movie                    | `movie_id`, `language`                |
| `get_trending_movies` | Get trending movies over a day or week                   | `time_window` (day/week), `language`  |
| `discover_movies`     | Filter movies by genre, rating, release date, and more   | `with_genres`, `vote_average.gte`, `primary_release_year`, `sort_by` |
| `get_movie_genres`    | List all genre IDs and their names                       | `language`                            |

## Example Interactions

Natural language queries a user might send to an MCP server built on this API:

- "Find me action movies released in 2023 with a rating above 7"
- "What are the top trending movies this week?"
- "Show me details about Inception, including its runtime and budget"
- "What genres does TMDB support?"
- "Search for movies with 'robot' in the title"

## Notes

- TMDB requires attribution: display their logo and a link to themoviedb.org when showing their data.
- Genre IDs are integers in search/discover results — use `get_movie_genres` to resolve them to names.
- Images (posters, backdrops) are served from a separate CDN: `https://image.tmdb.org/t/p/{size}/{file_path}`.
- Register at https://www.themoviedb.org/settings/api — get an **API Key** 

## curl Examples

> Replace `YOUR_BEARER_TOKEN` with a free Read Access Token from https://www.themoviedb.org/settings/api

### Search for movies by title
```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.themoviedb.org/3/search/movie?query=inception&language=en-US"
```

### Get trending movies this week
```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.themoviedb.org/3/trending/movie/week"
```

### Get full details for a specific movie (Inception = 27205)
```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.themoviedb.org/3/movie/27205?language=en-US"
```

### List available genres
```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.themoviedb.org/3/genre/movie/list?language=en"
```
