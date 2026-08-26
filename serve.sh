#!/usr/bin/env bash
# Preview the brandbook locally.
#
#   ./serve.sh          pick a free high port, remembered in .dev-port
#   ./serve.sh 4611     use a specific port
#
# Binds 127.0.0.1 so an unpublished brand is never exposed to the local network.
set -e
cd "$(dirname "$0")"

PORT_FILE=".dev-port"
port_free() { ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

PORT="${1:-}"
if [ -n "$PORT" ]; then
  if ! port_free "$PORT"; then
    echo "Port $PORT is already in use. Pick another, or run with no argument."
    exit 1
  fi
else
  if [ -f "$PORT_FILE" ]; then
    REMEMBERED=$(tr -dc '0-9' < "$PORT_FILE")
    if [ -n "$REMEMBERED" ] && port_free "$REMEMBERED"; then PORT="$REMEMBERED"; fi
  fi
  if [ -z "$PORT" ]; then
    # $RANDOM is 0-32767, so this lands between 20000 and 52767.
    for _ in $(seq 1 50); do
      CANDIDATE=$(( 20000 + RANDOM ))
      if port_free "$CANDIDATE"; then PORT="$CANDIDATE"; break; fi
    done
    [ -z "$PORT" ] && { echo "Could not find a free port."; exit 1; }
    echo "$PORT" > "$PORT_FILE"
  fi
fi

echo "brandbook -> http://localhost:$PORT   (ctrl-c to stop)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
