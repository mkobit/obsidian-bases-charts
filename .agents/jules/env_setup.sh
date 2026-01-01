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

# 2. Setup Node.js and pnpm
# Priority: use mise if available (as per mise.toml), otherwise check for nvm or manual node
if command -v mise &> /dev/null; then
    echo "mise found, installing tools from mise.toml..."
    mise install
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "nvm found, using .nvmrc..."
    source "$HOME/.nvm/nvm.sh"
    nvm install
    nvm use
else
    echo "mise and nvm not found. Checking Node.js..."
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js not found. Please install Node.js 22 (via mise, nvm, or system)."
        exit 1
    fi
    NODE_VERSION=$(node -v)
    echo "Node version: $NODE_VERSION"
    # Basic check for version 22
    if [[ "$NODE_VERSION" != v22* ]]; then
        echo "Warning: Node version $NODE_VERSION differs from expected v22.x"
    fi
fi

# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    # Fallback to npm install -g pnpm if npm is available
    if command -v npm &> /dev/null; then
        npm install -g pnpm@9
    else
        echo "Error: npm not found, cannot install pnpm."
        exit 1
    fi
fi

# 3. Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# 4. Diagnostic Info
echo "User: $(whoami)"
echo "Git Commit: $(git rev-parse --short HEAD) ($(git log -1 --format=%cI))"

echo "Environment ready"
