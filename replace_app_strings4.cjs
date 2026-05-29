const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexReplacements = [
  [/>\s*High Risk Detected\s*<\//g, '>{t("high_risk")}</'],
  [/>\s*Low Risk Situation\s*<\//g, '>{t("low_risk")}</'],
  [/>\s*What to do NOW\s*/g, '>{t("what_to_do")} '],
  [/>\s*Analyze Situation\s*<\//g, '>{t("analyze_situation")}</'],
  [/>\s*Smart Pharmacist Assistant\s*/g, '>{t("app_tagline")} '],
  [/>\s*My Account\s*/g, '>{t("my_account")} '],
  [/>\s*Upgrade to Pro\s*/g, '>{t("upgrade_to_pro")} '],
  [/>\s*My Prescriptions\s*/g, '>{t("my_prescriptions")} '],
  [/>\s*<\/span>\s*Sign Out\s*/g, '></span> {t("sign_out")} '],
  [/>\s*Analysis History\s*/g, '>{t("analysis_history")} '],
  [/>\s*Clear History\s*/g, '>{t("clear_history")} '],
  [/>\s*Warning found\s*/g, '>{t("warning_found")} '],
  [/>\s*No interactions\s*/g, '>{t("no_interactions_badge")} '],
  [/>\s*Choose from Gallery\s*/g, '>{t("choose_gallery")} '],
  [/>\s*Immediate Action Required\s*/g, '>{t("immediate_action")} '],
  [/>\s*Action Required\s*/g, '>{t("action_required")} '],
  [/>\s*Why\?\s*/g, '>{t("why_q")} '],
  [/>\s*Exact same active ingredient\.\s*/g, '>{t("exact_same")} '],
  [/>\s*Verify on Drugs\.com\s*/g, '>{t("verify_drugs")} '],
  [/>\s*Search FDA\s*/g, '>{t("search_fda")} ']
];

for (const [regex, replace] of regexReplacements) {
    content = content.replace(regex, replace);
}

fs.writeFileSync('src/App.tsx', content);
