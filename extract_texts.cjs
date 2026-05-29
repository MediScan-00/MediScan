const fs = require('fs');

const missingEn = {
  tab_scan_search: "Scan & Search",
  profile_title: "Patient Profile",
  profile_desc: "Save your current medications and conditions so we can check for interactions when analyzing new prescriptions.",
  profile_meds: "My Chronic Medications",
  profile_meds_desc: "List any medications you currently take. Separate by commas (e.g. Lisinopril, Metformin, Aspirin).",
  profile_conds: "My Medical Conditions",
  profile_conds_desc: "List any ongoing medical conditions (e.g. High Blood Pressure, Diabetes).",
  profile_allergies: "My Allergies",
  profile_allergies_desc: "List any allergies to medications or foods.",
  profile_info: "This information is only saved locally in your browser to help provide context when analyzing your medicines.",
  compare_title: "Compare Medications",
  compare_desc: "Find out the differences, side effects, drowsiness, and cost comparisons between two medications.",
  drug_a: "Medication A",
  drug_b: "Medication B",
  compare_btn: "Compare",
  comparing: "Comparing...",
  emergency_title: "Emergency Assessment",
  emergency_desc: "Please provide details so we can assess the risk immediately.",
  emergency_age: "Age",
  emergency_weight: "Weight (approx)",
  emergency_med: "Medication Name & Dose",
  emergency_time: "When was it taken?",
  emergency_desc_opt: "What happened? (optional)",
  emergency_analyze: "Analyze Situation",
  emergency_analyzing: "Analyzing Danger...",
  emergency_high_risk: "High Risk Detected",
  emergency_low_risk: "Low Risk Situation",
  emergency_what_to_do: "What to do NOW",
  emergency_call: "Call Emergency Services",
  emergency_close: "Close Emergency Mode",
  my_account: "My Account",
  my_prescriptions: "My Prescriptions",
  sign_out: "Sign Out",
  dark_mode: "Dark Mode",
  light_mode: "Light Mode",
};

const missingAr = {
  tab_scan_search: "مسح وبحث",
  profile_title: "الملف الطبي",
  profile_desc: "احفظ أدويتك وحالاتك الحالية للتحقق من التفاعلات عند تحليل وصفات طبية جديدة.",
  profile_meds: "أدويتي المزمنة",
  profile_meds_desc: "اذكر أي أدوية تتناولها حالياً. افصل بينها بفواصل (مثال: أسبرين، ميتفورمين).",
  profile_conds: "حالاتي الطبية",
  profile_conds_desc: "اذكر أي حالات طبية مستمرة (مثال: ضغط الدم المرتفع، السكري).",
  profile_allergies: "الحساسية",
  profile_allergies_desc: "اذكر أي حساسية تجاه أدوية أو أطعمة.",
  profile_info: "يتم حفظ هذه المعلومات محلياً فقط في متصفحك للمساعدة في توفير سياق عند تحليل أدويتك.",
  compare_title: "مقارنة الأدوية",
  compare_desc: "اكتشف الفروق، الأعراض الجانبية، والنعاس، وتكلفة الأدوية بين دوائين.",
  drug_a: "الدواء الأول",
  drug_b: "الدواء الثاني",
  compare_btn: "قارن",
  comparing: "جاري المقارنة...",
  emergency_title: "تقييم الطوارئ",
  emergency_desc: "يرجى تقديم التفاصيل لنتمكن من تقييم الخطر فوراً.",
  emergency_age: "العمر",
  emergency_weight: "الوزن (تقريباً)",
  emergency_med: "اسم الدواء والجرعة",
  emergency_time: "متى تم تناوله؟",
  emergency_desc_opt: "ماذا حدث؟ (اختياري)",
  emergency_analyze: "تحليل الموقف",
  emergency_analyzing: "جاري تحليل الخطر...",
  emergency_high_risk: "تم اكتشاف خطر عالٍ",
  emergency_low_risk: "موقف منخفض الخطر",
  emergency_what_to_do: "ماذا تفعل الآن",
  emergency_call: "اتصل بخدمات الطوارئ",
  emergency_close: "إغلاق وضع الطوارئ",
  my_account: "حسابي",
  my_prescriptions: "وصفاتي",
  sign_out: "تسجيل الخروج",
  dark_mode: "الوضع الداكن",
  light_mode: "الوضع المضيء",
};

let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

for (const [key, val] of Object.entries(missingEn)) {
  content = content.replace(
    /app_name:\s*"Drug Translator",/,
    `app_name:        "Drug Translator",\n    ${key}: ${JSON.stringify(val)},`
  );
}

for (const [key, val] of Object.entries(missingAr)) {
  content = content.replace(
    /app_name:\s*"مترجم الدواء",/,
    `app_name:        "مترجم الدواء",\n    ${key}: ${JSON.stringify(val)},`
  );
}

fs.writeFileSync('src/lib/i18n.ts', content);
