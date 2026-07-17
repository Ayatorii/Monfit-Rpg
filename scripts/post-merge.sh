#!/bin/bash
set -e

# Runs automatically after every task-agent merge and on fresh imports.
# Keep this fast — it has a 60 s budget.

pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
