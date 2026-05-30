const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
          <div className="flex items-center justify-around w-full px-2 py-2">
            <button
              onClick={() => setActiveTab('text')}
              className={\`flex-1 flex flex-col items-center justify-center gap-[4px] py-2 rounded-xl transition-all duration-300 \${activeTab === 'text' ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}\`}
              style={{ minWidth: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={\`p-1.5 rounded-full transition-colors \${activeTab === 'text' ? 'bg-teal-50' : 'bg-transparent'}\`}>
                <ScanSearch width={20} height={20} strokeWidth={activeTab === 'text' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{t("tab_scan")}</span>
            </button>
            <button
              id="tab-history"
              onClick={() => {
                if (checkPaywall('history')) setActiveTab('history');
              }}
              className={\`flex-1 flex flex-col items-center justify-center gap-[4px] py-2 rounded-xl transition-all duration-300 \${activeTab === 'history' ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}\`}
              style={{ minWidth: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={\`p-1.5 rounded-full transition-colors \${activeTab === 'history' ? 'bg-teal-50' : 'bg-transparent'}\`}>
                <HistoryIcon width={20} height={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{t("tab_history")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('profile')) setActiveTab('profile');
              }}
              className={\`flex-1 flex flex-col items-center justify-center gap-[4px] py-2 rounded-xl transition-all duration-300 \${activeTab === 'profile' ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}\`}
              style={{ minWidth: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={\`p-1.5 rounded-full transition-colors \${activeTab === 'profile' ? 'bg-rose-50' : 'bg-transparent'}\`}>
                <HeartPulse width={20} height={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{t("tab_profile")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('compare')) setActiveTab('compare');
              }}
              className={\`flex-1 flex flex-col items-center justify-center gap-[4px] py-2 rounded-xl transition-all duration-300 \${activeTab === 'compare' ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}\`}
              style={{ minWidth: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={\`p-1.5 rounded-full transition-colors \${activeTab === 'compare' ? 'bg-amber-50' : 'bg-transparent'}\`}>
                <AlertCircle width={20} height={20} strokeWidth={activeTab === 'compare' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{t("tab_compare")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('reminders')) setActiveTab('reminders');
              }}
              className={\`flex-1 flex flex-col items-center justify-center gap-[4px] py-2 rounded-xl transition-all duration-300 \${activeTab === 'reminders' ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}\`}
              style={{ minWidth: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={\`p-1.5 rounded-full transition-colors \${activeTab === 'reminders' ? 'bg-teal-50' : 'bg-transparent'}\`}>
                <ICONS.Bell width={20} height={20} strokeWidth={activeTab === 'reminders' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{t("tab_reminders")}</span>
            </button>
          </div>
        </div>`;

const replacement = `        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-10 px-4">
          <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto pb-4 max-w-full snap-x px-4 w-full no-scrollbar">
            <button
              onClick={() => setActiveTab('text')}
              className={\`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group \${activeTab === 'text' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}\`}
              style={{ minWidth: '80px' }}
            >
              <span className={\`flex justify-center items-center \${activeTab === 'text' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}\`}>
                <ScanSearch width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_scan")}</span>
            </button>
            <button
              id="tab-history"
              onClick={() => {
                if (checkPaywall('history')) setActiveTab('history');
              }}
              className={\`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group \${activeTab === 'history' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}\`}
              style={{ minWidth: '80px' }}
            >
              <span className={\`flex justify-center items-center \${activeTab === 'history' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}\`}>
                <HistoryIcon width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_history")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('profile')) setActiveTab('profile');
              }}
              className={\`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group \${activeTab === 'profile' ? 'bg-rose-500 shadow-[0_8px_20px_rgb(244,63,94,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}\`}
              style={{ minWidth: '80px' }}
            >
              <span className={\`flex justify-center items-center \${activeTab === 'profile' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}\`}>
                <HeartPulse width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_profile")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('compare')) setActiveTab('compare');
              }}
              className={\`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group \${activeTab === 'compare' ? 'bg-amber-500 shadow-[0_8px_20px_rgb(245,158,11,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}\`}
              style={{ minWidth: '80px' }}
            >
              <span className={\`flex justify-center items-center \${activeTab === 'compare' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}\`}>
                <AlertCircle width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_compare")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('reminders')) setActiveTab('reminders');
              }}
              className={\`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group \${activeTab === 'reminders' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}\`}
              style={{ minWidth: '80px' }}
            >
              <span className={\`flex justify-center items-center \${activeTab === 'reminders' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}\`}>
                <ICONS.Bell width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_reminders")}</span>
            </button>
          </div>
        </motion.div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Reverted tabs successfully.');
} else {
  console.log('Target not found.');
}
