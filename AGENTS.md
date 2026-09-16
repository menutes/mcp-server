# Project instructions

Read the existing README, package manifests, and relevant documentation to establish this project's actual setup and verification commands before editing. Do not invent build or deployment procedures.

## Working across Claude Code and Codex

- These project instructions apply to both tools. Read applicable nested `AGENTS.md` and `CLAUDE.md` files before changing that part of the project; treat Claude `@path` references as files to read, not as Codex import syntax.
- Preserve existing local changes. Use one active writer per checkout; simultaneous implementation uses separate Git worktrees and coordinated ports/services.
- At a meaningful checkpoint or before switching tools, update the existing active plan/session note. If none exists, use `HANDOFF.md`. Record objective and acceptance criteria, branch/commit and uncommitted work, decisions, checks actually run and results, blockers, and next steps. Never record secrets.
- On resuming, compare that note with current files, `git status`, and the relevant diff. A stale handoff is context, not proof. Do not overwrite unrelated work.
- Compatible skills are shared from `.claude/skills` through `.agents/skills`; edit the original source, not a second copy. Codex command adapters read the original `.claude/commands` procedure. Missing integrations must be reported, not simulated.
- Preserve original product names, course names, paths, and tool-specific facts. A skill about Claude products remains about Claude products when Codex uses it.
- Cross-review is optional and explicitly requested: use the user-level `claude-review` skill when Codex should consult Claude. The reviewer does not edit files or delegate.
