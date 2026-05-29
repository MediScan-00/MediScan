const fs = require('fs');
const replacements = {
  '} /> High Risk Detected</>': '} /> {t("high_risk")}</>',
  '} /> Low Risk Situation</>': '} /> {t("low_risk")}</>',
  '} /> What to do NOW': '} /> {t("what_to_do")}',
  '} /> Analyze Situation</>': '} /> {t("analyze_situation")}</>',
  '} /> Smart Pharmacist Assistant': '} /> {t("app_tagline")}',
  '} /> My Account': '} /> {t("my_account")}',
  '} /> Upgrade to Pro': '} /> {t("upgrade_to_pro")}',
  '} /> My Prescriptions': '} /> {t("my_prescriptions")}',
  '}</span> Sign Out': '}</span> {t("sign_out")}',
  '} /> Save Profile': '} /> {t("save_profile")}',
  '} /> Profile saved successfully!': '} /> {t("profile_saved")}',
  '} /> Add Pill Reminder': '} /> {t("add_reminder_btn")}',
  '>Start Date: {formatDateSafe(r.startDate)}<': '>{t("start_date")}: {formatDateSafe(r.startDate)}<',
  '} /> Analysis History': '} /> {t("analysis_history")}',
  '} /> Clear History': '} /> {t("clear_history")}',
  '} /> Warning found': '} /> {t("warning_found")}',
  '} /> No interactions': '} /> {t("no_interactions_badge")}',
  '} /> View': '} /> {t("view_btn")}',
  '} /> Choose from Gallery': '} /> {t("choose_gallery")}',
  '>Medication {idx + 1}<': '>{t("med_table_med")} {idx + 1}<',
  '} /> Immediate Action Required': '} /> {t("immediate_action")}',
  '} /> Action Required': '} /> {t("action_required")}',
  '} /> Why?': '} /> {t("why_q")}',
  '} /> Exact same active ingredient.': '} /> {t("exact_same")}',
  '} /> Verify on Drugs.com': '} /> {t("verify_drugs")}',
  '} /> Search FDA': '} /> {t("search_fda")}',
  '>Action Required<': '>{t("action_required")}<',
  '>Advice<': '>{t("advice")}<' // I need to add this to i18n
};

let content = fs.readFileSync('src/App.tsx', 'utf8');

for (const [find, replace] of Object.entries(replacements)) {
    content = content.split(find).join(replace);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Replaced more strings');
