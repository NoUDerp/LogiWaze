import { readFileSync, existsSync } from 'fs';
import { lookup } from 'mime-types';
import { fileURLToPath } from 'url';

// Check if file path is provided as an argument
if (process.argv.length < 3) {
    console.error('Error: Please provide a file path');
    console.error('Usage: node data-url.js <file-path>');
    process.exit(1);
}

// Get the file path from command-line arguments
const filePath = process.argv[2];

// Check if the file exists
if (!existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
}

try {
    // Read the file
    const fileData = readFileSync(filePath);

    // Determine the MIME type
    const mimeType = lookup(filePath) || 'application/octet-stream';

    // Convert to base64 and create the data URL
    const base64Data = fileData.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Output the data URL to console
    console.log(dataUrl);
} catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
}