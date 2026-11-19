#!/usr/bin/env sh
# Downloads the development avatar model: "brunette.glb" from met4citizen/TalkingHead.
# Made with Ready Player Me, licensed CC BY-NC 4.0 (non-commercial, attribution required).
# The file is git-ignored: check the license before redistributing or using it commercially.
set -e
dir="$(dirname "$0")/../public/models"
mkdir -p "$dir"
curl -fsSL -o "$dir/avatar.glb" \
  "https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/brunette.glb"
echo "Saved $dir/avatar.glb"
