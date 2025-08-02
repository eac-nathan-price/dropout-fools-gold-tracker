# JSON Minification Scripts

This directory contains scripts to minify the `src/views.json` file, which can significantly reduce file size by removing unnecessary whitespace and formatting.

## Available Scripts

### 1. Node.js Script (`minify-views.js`)
A JavaScript script that uses Node.js built-in modules to minify JSON.

**Usage:**
```bash
node minify-views.js
```

**Requirements:**
- Node.js (already available in this project)

**Features:**
- ✅ No external dependencies
- ✅ Detailed size comparison
- ✅ Error handling
- ✅ ES module compatible

### 2. Shell Script (`minify-views.sh`)
A bash script that uses `jq` to minify JSON.

**Usage:**
```bash
./minify-views.sh
```

**Requirements:**
- `jq` command-line tool
- Bash shell

**Install jq:**
- **Ubuntu/Debian:** `sudo apt install jq`
- **macOS:** `brew install jq`
- **CentOS/RHEL:** `sudo yum install jq`

**Features:**
- ✅ Human-readable file sizes
- ✅ Cross-platform compatibility
- ✅ Automatic dependency checking

## Output

Both scripts will:
1. Read `src/views.json`
2. Create `src/views.min.json` (minified version)
3. Display size comparison and savings

## Example Output

```
Reading views.json...
Minifying JSON...
✅ Minification complete!
📁 Original file: /path/to/src/views.json
📁 Minified file: /path/to/src/views.min.json
📊 Original size: 123,504 bytes
📊 Minified size: 43,131 bytes
💾 Space saved: 80,373 bytes (65.08%)
```

## File Size Reduction

The minification process typically reduces the file size by **~65%** by removing:
- Unnecessary whitespace
- Line breaks
- Indentation
- Trailing commas

## Usage in Production

You can use the minified version in production to:
- Reduce bandwidth usage
- Improve load times
- Save storage space

The minified JSON is functionally identical to the original - only the formatting is changed. 