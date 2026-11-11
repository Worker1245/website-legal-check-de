# Update checks (monthly report, quarterly self-update)

Run when the status date at the top of `references/sources.md` is more than one month old (workflow step 0). Laws, case law and authority guidance change. During a website check this is **report only** (decision 10a): the skill files are never changed, because the installed skill is a copy of the repository and development happens elsewhere. Tell the user in German that the check runs and roughly how long it takes (about 10–20 minutes).

## A. During a website check (report only)

1. **Re-fetch every source** in `references/sources.md` (time limit 30 seconds each; skip and report what exceeds it). For each: reachable? still the same act/version (look for "Stand", "zuletzt geändert", consolidated version date, new guidance version)?
2. **Look for changes** since the status date, official sources first:
   - German acts in the checklist: gesetze-im-internet.de ("Stand" line), recht.bund.de (Bundesgesetzblatt) for amending acts.
   - EU acts: EUR-Lex (consolidated versions, corrigenda, amending acts).
   - Guidance: DSK, EDPB, Bundesfachstelle Barrierefreiheit, Bundesnetzagentur.
   - Case law named in the checklist: BGH, CJEU (curia), as far as officially published.
3. **Upcoming rules** (`references/upcoming.md`): note changed status or dates, rules that now apply, new proposals affecting websites, withdrawn ones.
4. **Use the result in this check**: where a change affects a finding of the current website, apply the current legal state in the report (law, wording, priority, sources) and say so in the finding; do not edit checklist, sources, drafts or code.
5. **Record it** in `report.json` under `sourceUpdate` (see `references/report-json.md`): checked date, every change with its effect, what could not be verified, and the concrete to-dos for the skill (which file and entry to change). The long report shows this in the chapter "Prüfumfang und Prüfgrundlagen", section "Aktualität der Prüfgrundlagen".
6. **Tell the user** in German in one short paragraph that the skill files are out of date and that the to-dos are in the long report (and in `daten/report.json`), to be applied in the development copy.

Because the files stay unchanged, this check repeats on every run until an updated version of the skill is installed.

## B. Applying the changes (maintenance session in the development copy, only on request)

1. Work through the to-dos from section A (or redo A first): update the affected entries in `references/checklist.md` (including priority rules and the "common reason for a warning letter" property), `references/sources.md` rows with the new retrieval date, `references/upcoming.md` (move rules that now apply into the checklist), text drafts in `templates/texte/`, and if needed the automatic checks in `scripts/lib/checks/` with a test.
2. Set the status date at the top of `references/sources.md`, `references/checklist.md` and `references/upcoming.md` to today, even when nothing changed.
3. Run `npm test`; it must pass.
4. Report in German what changed and what could not be verified. Commit and push only after the user agrees (decision 7a); afterwards the installed copy is updated from GitHub.

## Rules

- Only sources that were fetched successfully count; never add a URL that was not fetched. Mark anything uncertain as UNVERIFIED.
- Do not change behaviour beyond what the legal change requires.
- No personal data or local paths in committed files.

## C. Quarterly self-update (scheduled, decisions 61a–63a)

A scheduled task on the maintainer's computer runs this section at the end of every quarter in the development copy. It replaces the "only on request" condition of section B and the consent step of decision 7a for this run; the gates in step 6 take their place. The website-check behaviour of section A stays unchanged.

1. **New laws and guidance:** Search official sources (as in A.2) for acts, amendments, case law and authority guidance since the status date that affect website duties in `references/checklist.md` scope; check `references/upcoming.md` for rules that now apply, changed dates and new proposals.
2. **Currency of the recorded sources:** Re-fetch every row of `references/sources.md` (time limit 30 seconds each; skip and report what exceeds it); compare act versions, "Stand" lines and guidance versions; check the `provider.source` pages of `data/third-parties.json` the same way (entity or country changed, page gone).
3. **Improvements:** Collect improvement potential from the run's own findings, `skill-erkenntnisse` notes of recent website checks (if present outside the repository) and open GitHub issues. Apply automatically only: legal changes (section B.1), source updates, corrections of wrong or outdated content, provider data, and bug fixes (decision 62a). Everything else (new checks, new report parts, new questions, changed behaviour beyond what a legal change requires) goes into the report as numbered proposal questions with options; it is built only after the maintainer agrees.
4. **Bug hunt:** Run `npm test`, `npm audit`, the consistency tests, and a review of the code changed since the last quarterly run; fix confirmed bugs with a test that fails without the fix.
5. **Housekeeping:** Set the status dates (B.2), bump the patch or minor version in `package.json` and `package-lock.json`, update README, GitHub description and, if the scope changed, topics as for every release.
6. **Publish only if every gate passes (decision 63a):** `npm test` exit 0; `npm audit` with 0 vulnerabilities; SkillSpector (`--no-llm`) on a git archive of the new commit with no finding beyond the last installed version; no personal data, e-mail addresses or local paths in the diff or commit metadata (noreply address). Then commit, push, and update the installed copy (`git pull`, `npm ci --ignore-scripts`, `npm test`, `npm audit`) and its entry in the maintainer's skills-installed list. If any gate fails: publish nothing, leave the changes uncommitted in the development copy and report the failing output.
7. **Report:** Write a German report as `.txt` next to the repository (never inside it), named `JJJJMMTT_v<Version>_website-legal-check-de_Quartalsupdate.txt`: what changed and why (with sources), what could not be verified, gate results, open proposal questions. Check that no own processes are left running.
