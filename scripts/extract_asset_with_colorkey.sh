#!/bin/sh
set -eu

if [ "$#" -lt 8 ] || [ "$#" -gt 10 ]; then
  echo "Usage: $0 input x y width height RRGGBB output.png similarity [blend]" >&2
  echo "Example: $0 poster.jpg 100 20 120 90 4EB4FC whale.png 0.18 0.06" >&2
  exit 2
fi

input_path=$1
crop_x=$2
crop_y=$3
crop_width=$4
crop_height=$5
background_hex=$6
output_path=$7
similarity=$8
blend=${9:-0.05}

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required." >&2
  exit 1
fi

case "$background_hex" in
  \#*) background_hex=${background_hex#\#} ;;
esac

ffmpeg -y -v error -i "$input_path" \
  -vf "crop=${crop_width}:${crop_height}:${crop_x}:${crop_y},colorkey=0x${background_hex}:${similarity}:${blend},format=rgba" \
  -frames:v 1 "$output_path"

echo "$output_path"

