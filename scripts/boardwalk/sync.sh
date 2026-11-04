#!/usr/bin/env bash
# Puts the Boardwalk park at the front of this site (https://me.infinityopus.com/). Its built site is
# ~/boardwalk/dist, made by the crawl in that repo's tools/deploy.sh (run the crawl part there first
# when the park changes). Its index.html and folders are copied into public/ as they are, since every
# path in them is relative; its Explore button is pointed at the gallery, /work.
#
#   bash scripts/boardwalk/sync.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
SRC=${BOARDWALK_DIST:-/home/ran/boardwalk/dist}
LIST=scripts/boardwalk/owned.txt
[ -f "$SRC/index.html" ] || { echo "no built park at $SRC"; exit 1; }

# What the last sync put in public/ comes out first, so files the park no longer uses go too.
if [ -f "$LIST" ]; then while read -r p; do [ -n "$p" ] && rm -rf "public/$p"; done < "$LIST"; fi
entries=$(cd "$SRC" && ls -A | grep -vE '^\.(vercel|vercelignore|env.*)$')
for p in $entries; do
  if [ -e "public/$p" ]; then echo "public/$p exists and isn't the park's: rename one of them"; exit 1; fi
  cp -r "$SRC/$p" public/
done
printf '%s\n' $entries > "$LIST"

sed -i 's#params.get("explore") ?? "https://astro-blog-lemon.vercel.app"#params.get("explore") ?? "/work"#' public/index.html
grep -q 'params.get("explore") ?? "/work"' public/index.html || { echo "couldn't point Explore at /work: check public/index.html"; exit 1; }
# The park has no icon of its own; give it the site's (the Ran Studio seal).
sed -i 's#<link rel="icon" href="data:,">#<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">#' public/index.html
grep -q 'href="/favicon.svg"' public/index.html || { echo "couldn't set the park's icon: check public/index.html"; exit 1; }
echo "park copied: $(printf '%s ' $entries)"
