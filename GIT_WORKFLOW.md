# Git Workflow Spec — Mindscaping

Two long-lived branches, one deploy target each. Feature branches flow through `develop` for
QA before they are allowed near production. GitHub is the host (Mindscaping/Mindscaping);
commands are written for `git` + GitHub.

## Branches

| Branch    | Deploys to        | Rule |
|-----------|-------------------|------|
| `main`    | Production (mindscaping.in) | Only QA-approved work. Every push deploys to prod. |
| `develop` | Development/testing env      | Disposable integration branch. Every push deploys to the test env. |

Both are **protected** (see Protection settings). No one pushes to either directly; both only
move by merging a feature branch.

## Environments

- Push to `develop` → automatic deploy to the development/testing env.
- Push to `main` → automatic deploy to production.
- The test env must use its own `.env`: separate `DATABASE_URL` (a different SQLite file/volume
  or a separate container), separate `AUTH_SECRET`, and Razorpay **test-mode** keys. Never point
  the test env at the production database.

## Feature branch lifecycle

1. **Branch from `main`.** Always. Never branch from `develop` — `develop` can contain features
   that failed QA, and those would ride into production with your branch later.
   Name it `feature/<short-name>` (or `fix/<short-name>`).
2. Work, commit, push. Open a pull request **into `develop`**.
3. **Merge PR → `develop`.** Merge with a merge commit ("Create a merge commit"). Do **not**
   squash and do **not** rebase-merge: history of what was tested must be preserved, and the
   feature branch must **not** be deleted (turn off "Automatically delete head branches" in
   repo settings).
4. The test env now deploys your branch's code. QA tests it there — the full flow, not a
   skim: register, login, book, pay (test mode), notes, messages.
5. **QA gate.** Only when QA says the feature is completely functional, open a second PR
   **from the same feature branch into `main`**. `develop` is **never** merged back into a
   feature branch — if your branch needs newer production code, merge `main` into it.
   Feature branches only ever absorb work that is already QA'd in `main`, or your own.
6. **Merge PR → `main`.** Merge commit again, keep the branch. Production deploys.
7. The feature branch stays until you delete it yourself, after you are sure production is
   stable. Nothing depends on it existing, but nothing is lost if it does.

Note: because branches start at `main` and never absorb `develop`, merging your feature
branch into `main` brings exactly your changes and nothing un-QA'd. If two features must be
integrated before QA (rare), merge one feature branch into the other explicitly — never via
`develop` — and QA the combination in the test env.

## Recreating `develop` (the reset procedure)

When `develop` is broken beyond fixing — bad merges piled up, poisoned by a bad config, or
diverged in a way nobody wants:

```bash
git push origin --delete develop          # delete on the remote
git branch -d develop                     # and locally
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop                # test env redeploys from the new base
```

This is safe **by design**: everything in `develop` is either already in `main` (QA-approved)
or still lives on its own feature branch. Nothing is lost. Open feature branches are
unaffected — they branch from `main`, so a fresh `develop` never invalidates them.

Never reset or delete `main`.

## Rules that must not break

1. Feature branches start at `main`, never at `develop`.
2. Nothing reaches `main` except via a feature branch that QA approved in the test env.
3. Merges are always merge commits — no squash, no rebase-merge, no force-push to shared
   branches.
4. Head branches are not auto-deleted on merge.
5. `main` and `develop` are protected; only the flow above moves them.
6. The test env never touches production data or production keys.

## Protection settings (applied — GitHub rulesets)

- **main** — active ruleset: pull requests required (0 approvals, so a solo maintainer can
  self-merge after QA), no force-pushes, no deletion.
- **develop** — active ruleset: pull requests required, no force-pushes. Deletion is
  deliberately **allowed**: the reset procedure above deletes and recreates `develop`.
- Repo Settings → General → "Automatically delete head branches": **off**.

## Minimal CI gate (recommended)

One workflow, both PRs: on every PR, run `npm ci && npm test && npm run lint`. The QA gate
stays human — CI only stops the obvious breakage from even reaching the test env.
