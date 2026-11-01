#!/usr/bin/env bash
# v2.6: after a push, check that every shipped file on GitHub Pages matches the local commit (md5), with a fresh
# cache-buster on each try. Usage: tests/live-md5.sh [tries=8] [wait=20]. Exit 0 = all match.
BASE="https://eleveneff.github.io/american-beginnings-rpg/"; TRIES=${1:-8}; WAIT=${2:-20}
cd "$(dirname "$0")/.." || exit 2
FILES=$(git ls-files 'index.html' 'app.js' 'world.js' 'style.css' 'world/*.js' 'world/*.css' 'content/*.js')
for t in $(seq 1 "$TRIES"); do
  bad=0
  for f in $FILES; do
    l=$(md5sum < "$f" | cut -d' ' -f1); r=$(curl -s "${BASE}${f}?x=$RANDOM$RANDOM" | md5sum | cut -d' ' -f1)
    [ "$l" = "$r" ] || { bad=$((bad+1)); [ "$t" = "$TRIES" ] && echo "MISMATCH $f"; }
  done
  [ "$bad" = 0 ] && { echo "LIVE OK: $(echo $FILES | wc -w) files match (try $t)"; exit 0; }
  echo "try $t: $bad files differ, waiting ${WAIT}s"; sleep "$WAIT"
done
exit 1
