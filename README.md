# Vistula Task Manager

**Student ID:** 79726

A simple Task Manager web app built with plain HTML/CSS/JavaScript, using Supabase (PostgreSQL + auto-generated REST API) as the backend, and deployed via GitHub Pages.

## Links

- **Live app:** https://79726-rida.github.io/vistula-task-manager/
- **Repository:** https://github.com/79726-rida/vistula-task-manager
- **Contribution page:** https://79726-rida.github.io/vistula-task-manager/contribution.html
- **Contribution JSON:** https://79726-rida.github.io/vistula-task-manager/contribution.json

## Pull Requests (team collaboration)

- PR I opened in my partner's repository: _TODO: add link once opened_
- PR my partner opened in this repository: _TODO: add link once merged_

## Tech stack

- Frontend: HTML, CSS, JavaScript (no framework)
- Database/API: Supabase (PostgreSQL + auto-generated REST API)
- Hosting: GitHub Pages

## Database schema

Table `tasks`:

| Column      | Type    | Notes                        |
| ----------- | ------- | ----------------------------- |
| id          | bigint  | primary key, auto-generated   |
| title       | text    | required                      |
| description | text    | optional                      |
| completed   | boolean | default `false`                |
| created_at  | timestamptz | default `now()`            |

Row Level Security is enabled with public policies allowing select/insert/update/delete for this demonstration project (no authentication required).

## Running locally

This is a static site with no build step. Serve the folder with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
