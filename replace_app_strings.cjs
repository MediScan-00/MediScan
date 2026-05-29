const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ['>Scan & Search<', '>{t("tab_scan_search")}<'],
  ['>Patient Profile<', '>{t("profile_title")}<'],
  ['>Save your current medications and conditions so we can check for interactions when analyzing new prescriptions.<', '>{t("profile_desc")}<'],
  ['>My Chronic Medications<', '>{t("profile_meds")}<'],
  ['>List any medications you currently take. Separate by commas (e.g. Lisinopril, Metformin, Aspirin).<', '>{t("profile_meds_desc")}<'],
  ['>My Medical Conditions<', '>{t("profile_conds")}<'],
  ['>List any ongoing medical conditions (e.g. High Blood Pressure, Diabetes).<', '>{t("profile_conds_desc")}<'],
  ['>My Allergies<', '>{t("profile_allergies")}<'],
  ['>List any allergies to medications or foods.<', '>{t("profile_allergies_desc")}<'],
  ['>This information is only saved locally in your browser to help provide context when analyzing your medicines.<', '>{t("profile_info")}<'],
  ['>Compare Medications<', '>{t("compare_title")}<'],
  ['>Find out the differences, side effects, drowsiness, and cost comparisons between two medications.<', '>{t("compare_desc")}<'],
  ['>Medication A<', '>{t("drug_a")}<'],
  ['>Medication B<', '>{t("drug_b")}<'],
  ['Comparing...', '{t("comparing")}'],
  ['>Compare<', '>{t("compare_btn")}<'],
  ['>Emergency Assessment<', '>{t("emergency_title")}<'],
  ['>Please provide details so we can assess the risk immediately.<', '>{t("emergency_desc")}<'],
  ['>Age<', '>{t("emergency_age")}<'],
  ['>Weight (approx)<', '>{t("emergency_weight")}<'],
  ['>Medication Name & Dose<', '>{t("emergency_med")}<'],
  ['>When was it taken?<', '>{t("emergency_time")}<'],
  ['>What happened? (optional)<', '>{t("emergency_desc_opt")}<'],
  ['>Analyze Situation<', '>{t("emergency_analyze")}<'],
  ['Analyzing Danger...', '{t("emergency_analyzing")}'],
  ['>High Risk Detected<', '>{t("emergency_high_risk")}<'],
  ['>Low Risk Situation<', '>{t("emergency_low_risk")}<'],
  ['>What to do NOW<', '>{t("emergency_what_to_do")}<'],
  ['>Call Emergency Services<', '>{t("emergency_call")}<'],
  ['>Close Emergency Mode<', '>{t("emergency_close")}<'],
  ['>My Account<', '>{t("my_account")}<'],
  ['>My Prescriptions<', '>{t("my_prescriptions")}<'],
  ['>Sign Out<', '>{t("sign_out")}<']
];

for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
}

fs.writeFileSync('src/App.tsx', content);
