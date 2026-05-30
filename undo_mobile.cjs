const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/ p-4 md:p-6 /g, ' p-6 ');
code = code.replace(/ p-4 md:p-6"/g, ' p-6"');
code = code.replace(/px-4 md:px-6 /g, 'px-6 ');
code = code.replace(/px-4 md:px-6"/g, 'px-6"');
code = code.replace(/p-4 md:p-6\b/g, 'p-6');

// Header Revert
code = code.replace('w-full max-w-full px-4 py-3 flex', 'max-w-4xl mx-auto px-6 py-4 flex');
code = code.replace('w-full max-w-full px-4 py-3', 'max-w-4xl mx-auto px-6 py-4');

// Main Content
code = code.replace('max-w-4xl mx-auto px-4 py-6 md:py-12 pb-24 md:pb-32', 'max-w-4xl mx-auto px-6 py-12');

fs.writeFileSync('src/App.tsx', code);
