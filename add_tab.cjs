const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `<button
              onClick={() => {
                if (checkPaywall('compare')) setActiveTab('compare');
              }}
              className={\`snap-center flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-semibold whitespace-nowrap transition-all duration-300 \${activeTab === 'compare' ? 'bg-amber-500/90 backdrop-blur-md text-white shadow-[0_8px_20px_rgb(245,158,11,0.3)] border border-amber-400/50' : 'bg-white/70 backdrop-blur-xl text-gray-500 hover:text-gray-900 border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}\`}
            >
              <AlertCircle className="w-4 h-4" />
              Compare
            </button>`;

const newTab = `
            <button
              onClick={() => {
                setActiveTab('reminders');
              }}
              className={\`snap-center flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-semibold whitespace-nowrap transition-all duration-300 \${activeTab === 'reminders' ? 'bg-teal-600/90 backdrop-blur-md text-white shadow-[0_8px_20px_rgb(13,148,136,0.3)] border border-teal-500/50' : 'bg-white/70 backdrop-blur-xl text-gray-500 hover:text-gray-900 border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}\`}
            >
              <span className="w-4 h-4 flex items-center justify-center">⏰</span>
              Reminders
            </button>`;

if (code.includes(anchor)) {
    code = code.replace(anchor, anchor + "\n" + newTab);
} else {
    // try to find just the compare tab
    console.log("Could not find the anchor perfectly. Trying regex.");
    const regex = /<button[^>]*>\s*<AlertCircle[^>]*>\s*Compare\s*<\/button>/g;
    code = code.replace(regex, match => match + "\n" + newTab);
}

fs.writeFileSync('src/App.tsx', code);
