#!/usr/bin/env bash
#
# Install the teachkit skills into every agent home found on this machine.
#
# Copies every skills/* directory into each target agent's skills
# directory, replacing any previous copy. Nothing outside those folders is
# touched.
#
#   ./install.sh                          # every agent home that exists
#   ./install.sh --targets claude,codex   # only these
#   ./install.sh --list                   # show where things would go
#   ./install.sh --copy                   # real copies everywhere, no symlinks
#   ./install.sh --link                   # canonical home points AT this repo
#
# Agents increasingly read the vendor-neutral ~/.agents/skills as well as their
# own home, so a real copy in each one shows up as the SAME skill twice in the
# menu. When .agents is among the targets it gets the real copy and the others
# get a symlink to it. Pass --copy if an agent turns out not to follow a
# symlinked skill directory.
#
# Working on the skills themselves? Use --link: the canonical home becomes a
# symlink to this checkout, so editing an installed skill edits the repo and
# the two cannot drift. They did once, for seventeen days, and putting them
# back together was a three-way merge over 38 files.
#
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="$repo/skills"
skills=(teach teach-adapt teach-remake)

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
force_copy=0
link_repo=0

while [ $# -gt 0 ]; do
  case "$1" in
    --targets) IFS=, read -r -a targets <<< "$2"; shift 2 ;;
    --targets=*) IFS=, read -r -a targets <<< "${1#*=}"; shift ;;
    --list) list_only=1; shift ;;
    --copy) force_copy=1; shift ;;
    --link) link_repo=1; shift ;;
    -h|--help) sed -n '2,25p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
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

if [ "$force_copy" -eq 1 ] && [ "$link_repo" -eq 1 ]; then
  echo "--copy and --link are opposites; pass one or neither." >&2
  exit 2
fi

# .agents gets the real copy and goes first; the rest link to it.
canonical=""
if [ "$force_copy" -eq 0 ]; then
  for name in "${targets[@]}"; do
    [ "$name" = "agents" ] && canonical="agents"
  done
fi
if [ -n "$canonical" ]; then
  ordered=("$canonical")
  for name in "${targets[@]}"; do
    [ "$name" != "$canonical" ] && ordered+=("$name")
  done
  targets=("${ordered[@]}")
fi

for name in "${targets[@]}"; do
  root="$(home_root "$name")" || { echo "unknown target: $name" >&2; exit 2; }
  dest="$root/skills"
  if [ "$list_only" -eq 1 ]; then
    how="copy"
    [ -n "$canonical" ] && [ "$name" != "$canonical" ] && how="link"
    [ "$link_repo" -eq 1 ] && [ "$name" = "$canonical" ] && how="link -> repo"
    echo "$name -> $dest ($how)"
    continue
  fi
  mkdir -p "$dest"
  for skill in "${skills[@]}"; do
    # -e is false for a broken symlink, so test for the link itself too.
    if [ -e "${dest:?}/$skill" ] || [ -L "${dest:?}/$skill" ]; then
      rm -rf "${dest:?}/$skill"
    fi

    # --link points the canonical home at the repo; every other home still
    # links to the canonical one, so all of them end up at the same files.
    if [ "$link_repo" -eq 1 ] && [ "$name" = "$canonical" ]; then
      ln -s "$source_dir/$skill" "$dest/$skill"
      echo "linked    $skill -> $dest/$skill (-> repo)"
      continue
    fi

    if [ -n "$canonical" ] && [ "$name" != "$canonical" ]; then
      ln -s "$(home_root "$canonical")/skills/$skill" "$dest/$skill"
      echo "linked    $skill -> $dest/$skill"
      continue
    fi

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
