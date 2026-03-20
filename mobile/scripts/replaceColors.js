const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');
const appPath = path.join(__dirname, '../app');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace nearly black backgrounds with medical blue
    if (content.includes(`backgroundColor: '#111827'`)) {
        content = content.replace(/backgroundColor:\s*'#111827'/g, `backgroundColor: '#0284c7'`);
        changed = true;
    }

    // Replace dark navy with medical blue
    if (content.includes(`'#1E3A5F'`)) {
        content = content.replace(/'#1E3A5F'/g, `'#0284c7'`);
        changed = true;
    }

    // Replace expo default blue pattern
    if (content.includes(`'#0a7ea4'`)) {
        content = content.replace(/'#0a7ea4'/g, `'#0284c7'`);
        changed = true;
    }

    // Replace any remaining #111827 icons/active tints if needed (checking tintColor)
    if (content.includes(`tintColor: '#111827'`)) {
        content = content.replace(/tintColor:\s*'#111827'/g, `tintColor: '#0284c7'`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
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

console.log('Color replacement completed.');
