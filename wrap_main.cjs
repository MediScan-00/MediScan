const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetOpen = '<main className="max-w-4xl mx-auto px-6 py-12">';
const targetClose = '</main>';

const parts = content.split(targetOpen);
if (parts.length === 2) {
  const subParts = parts[1].split(targetClose);
  if (subParts.length === 2) {
    const mainContent = subParts[0];
    
    // Wrap main content
    const wrappedContent = `
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLang}
            initial={{ opacity: 0, filter: 'blur(4px)', y: 5 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', y: -5 }}
            transition={{ duration: 0.3 }}
          >
${mainContent}
          </motion.div>
        </AnimatePresence>
`;
    content = parts[0] + targetOpen + wrappedContent + targetClose + subParts[1];
    fs.writeFileSync('src/App.tsx', content);
  }
}
