# Environment map

| Item | Current value |
| --- | --- |
| Project name | Practice Management System |
| Local absolute path | `/Users/test/Dev/aiprojects-builds/Practice Management System` |
| Git repository root | `/Users/test/Dev/aiprojects-builds` |
| GitHub repository/remote | `origin` — `https://github.com/chaparroa293-source/aiprojects-builds.git` |
| Current branch | `main` |
| Frontend/framework | React + Vite |
| Package manager | npm |
| Database provider | Supabase Postgres |
| Database project | AI Builds (shared; local application connection verified) |
| Authentication provider | Not selected |
| Deployment provider | Not selected |
| Environments | Not selected |
| Migration location | `database/migrations/` |
| Local environment-variable location | `.env.local` (ignored by Git) |
| Production environment-variable location | Not selected |

Required local variable names are documented in `.env.example`: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Their real values are not present in this repository.

The AI Builds Supabase project is shared by multiple applications. Practice Management System owns only the `practice_management` database namespace; its code and migrations must not assume ownership of the entire project or modify another application's objects.

`practice_management` is exposed through the Supabase Data API. Automatic Data API exposure for new tables is off; only `practice_management.clients` and `practice_management.sessions` are exposed. The browser-facing `anon` role has `USAGE` on the schema and `SELECT`, `INSERT`, and `UPDATE` on both tables for development testing; it has no `DELETE` grant.

Private values such as passwords, API keys, private keys, service-role keys, and database credentials must never be committed. When environment variables are introduced, document their names and locations without recording their values.
