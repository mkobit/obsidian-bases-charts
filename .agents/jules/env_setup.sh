#!/bin/bash
# Jules environment setup for Bases Views and ECharts implementation

set -euo pipefail

echo "Setting up environment..."

# 1. Install missing system tools
# Standard tools that might be useful
TOOLS="curl jq"
MISSING=""
for tool in $TOOLS; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING="$MISSING $tool"
    fi
done

if [ -n "$MISSING" ]; then
    echo "Installing missing tools:$MISSING..."
    # Attempt sudo if available, otherwise warn
    if command -v sudo &> /dev/null; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq $MISSING
    else
        echo "Warning: sudo not found, skipping system package installation for:$MISSING"
    fi
fi

# 2. Setup environment with mise
if ! command -v mise &> /dev/null; then
    echo "Error: 'mise' is not installed or not in the PATH."
    echo "Please install mise (https://mise.jdx.dev) to manage this project's environment."
    exit 1
fi

echo "mise found. Installing tools..."
mise install

# 3. Install dependencies
echo "Installing dependencies with bun..."
if ! command -v bun &> /dev/null; then
    echo "Error: 'bun' was not found after 'mise install'."
    exit 1
fi
bun install

# 4. Diagnostic Info
echo "User: $(whoami)"
echo "Git Commit: $(git rev-parse --short HEAD) ($(git log -1 --format=%cI))"
echo "Bun Version: $(bun --version)"

echo "Environment ready"
