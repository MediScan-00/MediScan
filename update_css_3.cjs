const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');
code = code.replace(/min-height: 90px !important;/, 'min-height: 90px !important; max-height: 110px !important;');
fs.writeFileSync('src/index.css', code);
