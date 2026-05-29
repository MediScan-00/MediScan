const fs = require('fs');

let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// 1. Remove the incorrectly injected translations out of the LANGUAGES object
// Find the first block of `en: {` and `ar: {` inside LANGUAGES and keep only name, native, flag, dir.

const cleanBlock = (str) => {
    return str.split('\n')
      .filter(line => !line.includes('advice: "Advice",') && !line.includes('advice: "نصيحة",') && !line.match(/^[a-z_]+:\s*".*",$/))
      .join('\n');
};

let topPart = content.split('export const TRANSLATIONS')[0];
let restPart = 'export const TRANSLATIONS' + content.split('export const TRANSLATIONS')[1];

let updatedTopPart = topPart.replace(/en: \{[\s\S]*?\}/, 'en: { name: "English", native: "English", flag: "US", dir: "ltr" }')
                            .replace(/ar: \{[\s\S]*?\}/, 'ar: { name: "Arabic", native: "العربية", flag: "SA", dir: "rtl" }');

// 2. Add 'advice' to TRANSLATIONS block instead
restPart = restPart.replace(/en:\s*\{/, 'en: {\n  advice: "Advice",');
restPart = restPart.replace(/ar:\s*\{/, 'ar: {\n  advice: "نصيحة",');

fs.writeFileSync('src/lib/i18n.ts', updatedTopPart + restPart);
