#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Apeksha AI — Build .dmg for macOS distribution
# Run after install.sh to create a distributable disk image
# ═══════════════════════════════════════════════════════════════

echo ""
echo "  Building Apeksha AI.dmg..."
echo ""

APP_NAME="Apeksha AI"
DMG_NAME="Apeksha-AI-Installer"
DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$DIR/release-builds/Apeksha AI-darwin-arm64/Apeksha AI.app"
DMG_DIR="/tmp/dmg_build"
DMG_OUTPUT="$HOME/Desktop/$DMG_NAME.dmg"

# Check app exists
if [ ! -d "$APP_PATH" ]; then
    echo "  Error: Run python3 build-distribution.py first to compile the app."
    exit 1
fi

# Clean previous build
rm -rf "$DMG_DIR"
mkdir -p "$DMG_DIR"

# Copy app to staging
cp -R "$APP_PATH" "$DMG_DIR/"

# Create Applications symlink (for drag-to-install)
ln -s /Applications "$DMG_DIR/Applications"

# Create DMG
rm -f "$DMG_OUTPUT"
hdiutil create -volname "$APP_NAME" \
    -srcfolder "$DMG_DIR" \
    -ov -format UDZO \
    "$DMG_OUTPUT"

# Clean up
rm -rf "$DMG_DIR"

echo ""
echo "  ✅ DMG created: $DMG_OUTPUT"
echo "  Users drag Apeksha AI to Applications folder."
echo ""
