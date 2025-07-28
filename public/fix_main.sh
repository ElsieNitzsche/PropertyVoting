#!/bin/bash
# Add const CONFIG = window.CONFIG || {...} after imports
sed -i '/import.*ethers/a\n// Get CONFIG from window (loaded by config.js)' main.js
