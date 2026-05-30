const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/ p-6 /g, ' p-4 md:p-6 ');
code = code.replace(/ p-6"/g, ' p-4 md:p-6"');
code = code.replace(/px-6 /g, 'px-4 md:px-6 ');
code = code.replace(/px-6"/g, 'px-4 md:px-6"');
code = code.replace(/p-6\b/g, 'p-4 md:p-6');

// Header Fix
code = code.replace('max-w-4xl mx-auto px-4 md:px-4 md:px-6 py-4 flex', 'w-full max-w-full px-4 py-3 flex');
code = code.replace('max-w-4xl mx-auto px-4 md:px-6 py-3', 'w-full max-w-full px-4 py-3');


fs.writeFileSync('src/App.tsx', code);
