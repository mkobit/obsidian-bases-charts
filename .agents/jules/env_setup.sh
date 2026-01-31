#!/bin/bash
# Jules environment setup for Bases Views and ECharts implementation

set -euo pipefail

echo "Setting up environment..."

# 1. Install missing system tools
# Standard tools that might be useful
TOOLS="curl jq xvfb herbstluftwm"
MISSING=""
for tool in $TOOLS; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING="$MISSING $tool"
    fi
done

# Electron/Headless dependencies
# We check for standard names and t64 variants (Ubuntu 24.04+)
LIBS_TO_CHECK="libnss3 libgtk-3-0 libasound2 libatk-bridge2.0-0 libdrm2 libgbm1"
LIBS_TO_INSTALL=""

if command -v apt-get &> /dev/null; then
    for lib in $LIBS_TO_CHECK; do
        # Use simulation (-s) to check if the package can be installed/is found
        if apt-get -s install "$lib" &> /dev/null; then
            LIBS_TO_INSTALL="$LIBS_TO_INSTALL $lib"
        elif apt-get -s install "${lib}t64" &> /dev/null; then
            LIBS_TO_INSTALL="$LIBS_TO_INSTALL ${lib}t64"
        else
            echo "Warning: Could not find candidate for library $lib"
        fi
    done
else
    echo "Warning: apt-get not found, assuming standard library names."
    LIBS_TO_INSTALL="$LIBS_TO_CHECK"
fi

if [ -n "$MISSING" ] || [ -n "$LIBS_TO_INSTALL" ]; then
    echo "Installing missing tools and libraries..."
    # Attempt sudo if available, otherwise warn
    if command -v sudo &> /dev/null; then
        sudo apt-get update -qq
        TO_INSTALL="$MISSING $LIBS_TO_INSTALL"
        sudo apt-get install -y -qq $TO_INSTALL
    else
        echo "Warning: sudo not found, skipping system package installation for: $MISSING $LIBS_TO_INSTALL"
    fi
fi

# 2. Setup environment with mise
if ! command -v mise &> /dev/null; then
    echo "'mise' is not installed. Installing mise..."
    curl https://mise.run | sh
    export PATH="$HOME/.local/bin:$PATH"

    if ! command -v mise &> /dev/null; then
        echo "Error: 'mise' failed to install or is not in the PATH."
        exit 1
    fi
fi

echo "mise found. Installing tools..."
mise trust
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
