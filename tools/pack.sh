#!/usr/bin/env bash
#
# Build the zip to upload to the Chrome Web Store.
#
# Only the files the extension actually loads go in: the store rejects
# packages containing a package.json or a test directory is harmless but adds
# review surface, so both are left out.

set -euo pipefail
cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
out="dist/stanza-clock-${version}.zip"

mkdir -p dist
rm -f "$out"

zip -r -X "$out" manifest.json icons src _locales \
  -x '*.DS_Store' -x '__MACOSX*' >/dev/null

echo "$out"
unzip -l "$out" | tail -n 3
