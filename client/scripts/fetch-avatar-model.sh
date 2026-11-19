#!/usr/bin/env sh
# Downloads the development avatar model (Face Cap, from the three.js examples).
# The file is git-ignored: check its license before redistributing it.
set -e
dir="$(dirname "$0")/../public/models"
mkdir -p "$dir"
curl -fsSL -o "$dir/avatar.glb" \
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/facecap.glb"
echo "Saved $dir/avatar.glb"
