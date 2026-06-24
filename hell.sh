#!/bin/bash

set -e  # Exit on any error

# Always resolve paths relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# SCRIPT_DIR = /Users/pavan/SDKs/example/react_projects/videosdk-rtc-react-sdk-example

SDKS_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
# SDKS_DIR  = /Users/pavan/SDKs

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting VideoSDK dev build sync...${NC}"

# ── Step 1: Copy videosdk-dev.js to both locations ─────────────────────────
echo -e "${GREEN}Step 1: Copying videosdk-dev.js...${NC}"

JS_SDK_SRC="$SDKS_DIR/zujo-cloud-meetings-sdk/dist/videosdk-dev.js"
JS_SDK_DEST_1="$SDKS_DIR/zn-react-sdk/node_modules/@videosdk.live/js-sdk/videosdk.js"
JS_SDK_DEST_2="$SCRIPT_DIR/node_modules/@videosdk.live/js-sdk/videosdk.js"

cp "$JS_SDK_SRC" "$JS_SDK_DEST_1"
echo "  ✅ Copied to $JS_SDK_DEST_1"

cp "$JS_SDK_SRC" "$JS_SDK_DEST_2"
echo "  ✅ Copied to $JS_SDK_DEST_2"

# ── Step 2: Remove .cache from zn-react-sdk and local node_modules ─────────
echo -e "${GREEN}Step 2: Removing .cache directories...${NC}"
rm -rf "$SDKS_DIR/zn-react-sdk/.cache"
echo "  ✅ .cache removed from zn-react-sdk"
rm -rf "$SCRIPT_DIR/node_modules/.cache"
echo "  ✅ .cache removed from node_modules"

# ── Step 3: Build zn-react-sdk ─────────────────────────────────────────────
echo -e "${GREEN}Step 3: Building zn-react-sdk...${NC}"
cd "$SDKS_DIR/zn-react-sdk"
yarn build
cd "$SCRIPT_DIR"
echo "  ✅ Build complete"

# ── Step 4: Replace dist in MyApp node_modules with the fresh build ────────
echo -e "${GREEN}Step 4: Replacing dist in node_modules...${NC}"
rm -rf "$SCRIPT_DIR/node_modules/@videosdk.live/react-sdk/dist"
cp -r "$SDKS_DIR/zn-react-sdk/dist" "$SCRIPT_DIR/node_modules/@videosdk.live/react-sdk/dist"
echo "  ✅ dist replaced at $SCRIPT_DIR/node_modules/@videosdk.live/react-sdk/dist"

echo -e "${YELLOW}Done! VideoSDK dev build sync complete.${NC}"
