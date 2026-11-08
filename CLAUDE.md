# website-legal-check-de – project rules

- CI command (Definition of Done): `npm test` in this folder, exit code 0.
- Skill files are written in English; user-facing output (reports, PDFs, text drafts, mock-ups) is German. README.md and the GitHub repository description are German, because the skill targets websites in Germany (user decision 2026-11-07).
- Legal content comes only from sources that were actually fetched; record them with retrieval date in `references/sources.md`. Mark unverified points.
- Tests never contact the internet: fixture sites in `tests/fixtures/`, third-party hosts are mapped to the local test server.
- Reports and evidence of checked websites (`JJJJMMTT_<website>/` folders, `*.pdf`) never go into the repository.
- Commits use the GitHub noreply address; no personal data or local paths in committed files.
- With every push of a new version, update README.md, the GitHub repository description (`gh repo edit --description`) and, if the scope changed, the topics so they match the new features – without asking (user decision 2026-11-08). No personal data or project data in these texts.
