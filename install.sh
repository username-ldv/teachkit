#!/usr/bin/env bash
#
# Install the teachkit skills into every agent home found on this machine.
#
# Copies skills/teach and skills/teach-adapt into each target agent's skills
# directory, replacing any previous copy. Nothing outside those two folders is
# touched.
#
#   ./install.sh                          # every agent home that exists
#   ./install.sh --targets claude,codex   # only these
#   ./install.sh --list                   # show where things would go
#
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="$repo/skills"
skills=(teach teach-adapt)

home_root() {
  case "$1" in
    claude) echo "$HOME/.claude" ;;
    codex)  echo "$HOME/.codex" ;;
    agents) echo "$HOME/.agents" ;;
    *) return 1 ;;
  esac
}

targets=()
list_only=0

while [ $# -gt 0 ]; do
  case "$1" in
    --targets) IFS=, read -r -a targets <<< "$2"; shift 2 ;;
    --targets=*) IFS=, read -r -a targets <<< "${1#*=}"; shift ;;
    --list) list_only=1; shift ;;
    -h|--help) sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ ${#targets[@]} -eq 0 ]; then
  for name in claude codex agents; do
    [ -d "$(home_root "$name")" ] && targets+=("$name")
  done
  if [ ${#targets[@]} -eq 0 ]; then
    echo "No agent home found under $HOME. Pass --targets explicitly." >&2
    exit 1
  fi
fi

for name in "${targets[@]}"; do
  root="$(home_root "$name")" || { echo "unknown target: $name" >&2; exit 2; }
  dest="$root/skills"
  if [ "$list_only" -eq 1 ]; then
    echo "$name -> $dest"
    continue
  fi
  mkdir -p "$dest"
  for skill in "${skills[@]}"; do
    rm -rf "${dest:?}/$skill"
    cp -r "$source_dir/$skill" "$dest/$skill"
    # node_modules and build output can exist if the scaffold was run in place.
    rm -rf "$dest/$skill/scaffold/node_modules" \
           "$dest/$skill/scaffold/.svelte-kit" \
           "$dest/$skill/scaffold/dist"
    echo "installed $skill -> $dest/$skill"
  done
done

if [ "$list_only" -eq 0 ]; then
  echo
  echo "Done. Restart the agent so it picks up the new skills."
fi
