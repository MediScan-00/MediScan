const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<div className="edit-area"[^>]+>/, '<div className="edit-area" style={{ background: "#F0FAF9", border: "1.5px solid rgba(74,124,111,.2)", borderRadius: 16, padding: "16px", margin: "0 20px 20px" }}>');

fs.writeFileSync('src/App.tsx', code);
