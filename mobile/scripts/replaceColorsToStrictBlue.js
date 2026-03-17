const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');
const appPath = path.join(__dirname, '../app');

// Color mapping: Tailwind Grays -> Tailwind Blues (Strictly Blue & White)
const colorMap = {
    // TEXT & DARK SHADES (Replace Blacks/Dark Grays with Dark Blues)
    "'#111827'": "'#1e3a8a'", // blue-900 (Main headings, dark text)
    "'#1F2937'": "'#1e40af'", // blue-800
    "'#374151'": "'#1d4ed8'", // blue-700 (Secondary text)
    "'#4B5563'": "'#2563eb'", // blue-600
    "'#4b5563'": "'#2563eb'",

    // MUTED/SECONDARY TEXT (Replace Medium Grays with Medium Blues)
    "'#6B7280'": "'#3b82f6'", // blue-500 (Subtitles, icons)
    "'#9CA3AF'": "'#60a5fa'", // blue-400 (Placeholders)

    // BORDERS & DIVIDERS (Replace Light Grays with Light Blues)
    "'#D1D5DB'": "'#93c5fd'", // blue-300
    "'#E5E7EB'": "'#bfdbfe'", // blue-200
    "'#F3F4F6'": "'#dbeafe'", // blue-100
    "'#F9FAFB'": "'#eff6ff'", // blue-50 (App background)

    // PRIMARY BUTTONS/BRAND (Ensure it's a solid blue)
    "'#0284c7'": "'#2563eb'", // Standardize to solid blue-600
};

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [oldColor, newColor] of Object.entries(colorMap)) {
        // Replace exact hex string matches (case insensitive for the hex part if needed, but we wrote them uppercase mostly)
        // We'll use a global regex to catch both uppercase and lowercase
        const hexVal = oldColor.replace(/'/g, '');
        const regex = new RegExp(`'${hexVal}'`, 'gi');
        content = content.replace(regex, newColor);
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated colors in: ${filePath}`);
    }
};

const walkSync = (dir) => {
    let files = fs.readdirSync(dir);
    files.forEach((file) => {
        let filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath);
        } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
            replaceInFile(filepath);
        }
    });
};

walkSync(directoryPath);
walkSync(appPath);

console.log('Strict Blue/White color mapping completed.');
