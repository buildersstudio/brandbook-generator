#!/usr/bin/env bash
# Preview the brandbook locally.
set -e
PORT="${1:-4611}"
cd "$(dirname "$0")"
echo "brandbook -> http://localhost:$PORT   (ctrl-c to stop)"
python3 -m http.server "$PORT" --bind 127.0.0.1
