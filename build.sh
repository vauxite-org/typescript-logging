#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "Doing full build of all projects."

# Currently initialize does a full clean and build, so we just use that.
./initialize.sh
