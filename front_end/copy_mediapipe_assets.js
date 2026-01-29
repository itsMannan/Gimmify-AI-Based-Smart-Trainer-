const fs = require('fs');
const path = require('path');

// destination path relative to project root
const destPath = 'public/mediapipe/pose';
const srcPath = 'node_modules/@mediapipe/pose';

const absSrc = path.resolve(srcPath);
const absDest = path.resolve(destPath);

console.log(`Source: ${absSrc}`);
console.log(`Destination: ${absDest}`);

if (!fs.existsSync(absSrc)) {
    console.error(`ERROR: Source directory not found at ${absSrc}`);
    console.error('Make sure you have run "npm install"');
    process.exit(1);
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${entry.name}`);
        }
    }
}

try {
    copyRecursive(absSrc, absDest);
    console.log('SUCCESS: All MediaPipe assets copied successfully.');
} catch (err) {
    console.error('FAILED to copy assets:', err);
    process.exit(1);
}
