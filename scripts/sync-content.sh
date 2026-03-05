#!/bin/bash
set -euo pipefail

# Clone the private vault (sparse checkout — only publish/)
TEMP_DIR=$(mktemp -d)
echo "Cloning vault content..."

git clone --depth 1 --filter=blob:none --sparse \
  "https://x-access-token:${VAULT_TOKEN}@github.com/${VAULT_REPO}.git" \
  "$TEMP_DIR"

cd "$TEMP_DIR"
git sparse-checkout set publish

# Copy content into Astro's content directory
CONTENT_DIR="${GITHUB_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}/src/content"
rm -rf "$CONTENT_DIR"/*

for section in "$TEMP_DIR"/publish/*/; do
  if [ -d "$section" ]; then
    section_name=$(basename "$section")
    echo "Syncing section: $section_name"
    cp -r "$section" "$CONTENT_DIR/$section_name"
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"
echo "Content sync complete."
