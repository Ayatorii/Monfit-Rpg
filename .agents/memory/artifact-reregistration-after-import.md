---
name: Re-registering artifacts after GitHub import
description: What to do when a pnpm-workspace project imported from GitHub has artifacts/*/.replit-artifact/artifact.toml files on disk but the artifact/workflow system doesn't know about them.
---

## Symptom
A project imported from a GitHub repo (previously a Replit pnpm-workspace project) has `artifacts/<slug>/.replit-artifact/artifact.toml` files checked into git, but:
- `listArtifacts()` returns `[]`
- `listWorkflows()` returns `[]`
- `WorkflowsRestart({ name: "artifacts/<slug>: <service>" })` errors with "doesn't exist in config"
- `createArtifact()` fails with `ARTIFACT_DIR_EXISTS` since the folder is already present

## Why
Artifact/workflow registration lives in repl-instance state, not in git. A repo pushed to GitHub and re-imported into a fresh repl brings the `artifact.toml` files but loses that instance-level registration.

## How to apply
Do NOT hand-roll `configureWorkflow` calls that duplicate the artifact's dev command — they bypass the artifact's PORT/BASE_PATH/routing injection and the public dev-domain proxy will 502 even though `localhost:<port>` works inside the container.

Instead, force a re-sync: read the existing `artifact.toml`, write an unchanged (or lightly edited) copy to a sibling `artifact.edit.toml`, then call `verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })`. Even with no real content change, this triggers the platform to register the artifact, add its managed workflow(s), and wire up proxy routing. After that, `WorkflowsRestart` with the exact managed workflow name works normally. Do this once per artifact in the project (each `artifact.toml` needs its own re-sync call).
