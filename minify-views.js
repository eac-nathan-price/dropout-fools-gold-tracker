#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the views.json file
const inputFile = path.join(__dirname, 'src', 'views.json');
const outputFile = path.join(__dirname, 'src', 'views.min.json');

try {
    console.log('Reading views.json...');
    
    // Read the JSON file
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    
    // Parse the JSON to validate it and remove any formatting
    const parsedData = JSON.parse(jsonContent);
    
    console.log('Minifying JSON...');
    
    // Stringify with no formatting (minified)
    const minifiedJson = JSON.stringify(parsedData);
    
    // Write the minified JSON to a new file
    fs.writeFileSync(outputFile, minifiedJson);
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(inputFile).size;
    const minifiedSize = fs.statSync(outputFile).size;
    const savings = originalSize - minifiedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(2);
    
    console.log('✅ Minification complete!');
    console.log(`📁 Original file: ${inputFile}`);
    console.log(`📁 Minified file: ${outputFile}`);
    console.log(`📊 Original size: ${originalSize.toLocaleString()} bytes`);
    console.log(`📊 Minified size: ${minifiedSize.toLocaleString()} bytes`);
    console.log(`💾 Space saved: ${savings.toLocaleString()} bytes (${savingsPercent}%)`);
    
} catch (error) {
    console.error('❌ Error during minification:', error.message);
    process.exit(1);
} 