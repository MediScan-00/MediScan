const fs = require('fs');

const en = {
  auth_title: "Drug Translator",
  auth_tagline: "Smart Pharmacist Assistant",
  auth_signin_tab: "Sign In",
  auth_signup_tab: "Sign Up",
  auth_fullname_ph: "John Smith",
  auth_email_ph: "you@example.com",
  auth_social_or: "Or continue with",
  auth_social_google: "Continue with Google",
  auth_social_apple: "Continue with Apple",
  auth_no_account: "Don\\'t have an account? Sign up →",
  auth_yes_account: "Already have an account? Sign in →",
  auth_privacy_notice: "Your data stays on your device. We never store or share your medical information."
};

const ar = {
  auth_title: "مترجم الدواء",
  auth_tagline: "مساعدك الصيدلاني الذكي",
  auth_signin_tab: "تسجيل الدخول",
  auth_signup_tab: "إنشاء حساب",
  auth_fullname_ph: "محمد أحمد",
  auth_email_ph: "you@example.com",
  auth_social_or: "أو المتابعة باستخدام",
  auth_social_google: "المتابعة باستخدام Google",
  auth_social_apple: "المتابعة باستخدام Apple",
  auth_no_account: "ليس لديك حساب؟ إنشاء حساب →",
  auth_yes_account: "لديك حساب بالفعل؟ تسجيل الدخول →",
  auth_privacy_notice: "بياناتك تبقى على جهازك. نحن لا نخزن أو نشارك معلوماتك الطبية أبداً."
};

let i18nContent = fs.readFileSync('src/lib/i18n.ts', 'utf8');

for (const [key, val] of Object.entries(en)) {
  i18nContent = i18nContent.replace(/app_name:\s*"Drug Translator",/, `app_name:        "Drug Translator",\n    ${key}: ${JSON.stringify(val)},`);
}
for (const [key, val] of Object.entries(ar)) {
  i18nContent = i18nContent.replace(/app_name:\s*"مترجم الدواء",/, `app_name:        "مترجم الدواء",\n    ${key}: ${JSON.stringify(val)},`);
}
fs.writeFileSync('src/lib/i18n.ts', i18nContent);

let content = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

const replacements = [
  ['>Drug Translator<', '>{t("auth_title")}<'],
  ['>Smart Pharmacist Assistant<', '>{t("auth_tagline")}<'],
  ['>Sign In<', '>{t("auth_signin_tab")}<'],
  ['>Sign Up<', '>{t("auth_signup_tab")}<'],
  ['placeholder="John Smith"', 'placeholder={t("auth_fullname_ph")}'],
  ['placeholder="you@example.com"', 'placeholder={t("auth_email_ph")}'],
  ['>Or continue with<', '>{t("auth_social_or")}<'],
  ['>Continue with Google<', '>{t("auth_social_google")}<'],
  ['>Continue with Apple<', '>{t("auth_social_apple")}<'],
  ["Don't have an account? Sign up →", '{t("auth_no_account")}'],
  ['Already have an account? Sign in →', '{t("auth_yes_account")}'],
  ['>Your data stays on your device. We never store or share your medical information.<', '>{t("auth_privacy_notice")}<']
];

for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
}

fs.writeFileSync('src/components/AuthScreen.tsx', content);
