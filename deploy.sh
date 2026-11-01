#!/bin/sh
# Builds the app and publishes it to the gh-pages branch (GitHub Pages).
set -e
npm run build
url=$(git remote get-url origin)
tmp=$(mktemp -d)
if git ls-remote --exit-code --heads "$url" gh-pages >/dev/null 2>&1; then
  git clone -q --depth 1 -b gh-pages "$url" "$tmp"
  find "$tmp" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
else
  git init -q -b gh-pages "$tmp"
fi
cp -R dist/. "$tmp"/
touch "$tmp/.nojekyll"
cd "$tmp"
git add -A
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')" || echo "Nothing changed."
git push -q "$url" gh-pages
cd - >/dev/null
rm -rf "$tmp"
echo "Deployed: https://denismaris.github.io/steps-challenge/ (live in about a minute)"
