#!/bin/bash

# Path to the views.json file
INPUT_FILE="src/views.json"
OUTPUT_FILE="src/views.min.json"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install jq to use this script."
    echo "   On Ubuntu/Debian: sudo apt install jq"
    echo "   On macOS: brew install jq"
    echo "   On CentOS/RHEL: sudo yum install jq"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: $INPUT_FILE not found!"
    exit 1
fi

echo "Reading $INPUT_FILE..."

# Get original file size
ORIGINAL_SIZE=$(stat -c%s "$INPUT_FILE" 2>/dev/null || stat -f%z "$INPUT_FILE" 2>/dev/null)

# Minify the JSON using jq
if jq -c . "$INPUT_FILE" > "$OUTPUT_FILE"; then
    # Get minified file size
    MINIFIED_SIZE=$(stat -c%s "$OUTPUT_FILE" 2>/dev/null || stat -f%z "$OUTPUT_FILE" 2>/dev/null)
    
    # Calculate savings
    SAVINGS=$((ORIGINAL_SIZE - MINIFIED_SIZE))
    SAVINGS_PERCENT=$(echo "scale=2; $SAVINGS * 100 / $ORIGINAL_SIZE" | bc -l 2>/dev/null || echo "scale=2; $SAVINGS * 100 / $ORIGINAL_SIZE" | awk '{printf "%.2f", $1}')
    
    echo "✅ Minification complete!"
    echo "📁 Original file: $INPUT_FILE"
    echo "📁 Minified file: $OUTPUT_FILE"
    echo "📊 Original size: $(numfmt --to=iec $ORIGINAL_SIZE) ($ORIGINAL_SIZE bytes)"
    echo "📊 Minified size: $(numfmt --to=iec $MINIFIED_SIZE) ($MINIFIED_SIZE bytes)"
    echo "💾 Space saved: $(numfmt --to=iec $SAVINGS) ($SAVINGS bytes, ${SAVINGS_PERCENT}%)"
else
    echo "❌ Error during minification!"
    exit 1
fi 