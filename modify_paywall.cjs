const fs = require('fs');

let content = fs.readFileSync('src/components/PaywallModal.tsx', 'utf8');

// 1. Replace urls
content = content.replace(
  /const LEMONSQUEEZY_URLS: Record<string, string> = {[\s\S]*?};/,
`const LEMONSQUEEZY_URLS: Record<string, string> = {
  monthly:  "https://mediscan.lemonsqueezy.com/checkout/buy/27a68793-e06e-4db4-9276-d86880281392",
  yearly:   "https://mediscan.lemonsqueezy.com/checkout/buy/236514a6-a8ad-47bf-8da3-be95986bd7d3",
  lifetime: "https://mediscan.lemonsqueezy.com/checkout/buy/8f6ffdab-7a6a-4066-a9f7-7a8c28636804"
};`
);

// 2. Add checkout event listener
const useEff1 = `  useEffect(() => {
    abtest_init();
    abtest_track('paywall_shown');
  }, []);`;
  
const newUseEff = `  useEffect(() => {
    abtest_init();
    abtest_track('paywall_shown');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
    }
  }, [selectedPlan]);

  useEffect(() => {
    const handleLSSuccess = (e: any) => {
      setLoading(false);
      const user = JSON.parse(localStorage.getItem('dt_user') || '{}');
      const planLabels: any = { monthly: 'Pro', yearly: 'Pro Yearly', lifetime: 'Lifetime' };
      const billingTypes: any = { monthly: 'monthly', yearly: 'yearly', lifetime: 'once' };
      
      user.plan = selectedPlan === 'monthly' ? 'pro_monthly' : selectedPlan === 'yearly' ? 'pro_yearly' : 'lifetime';
      user.planLabel = planLabels[selectedPlan];
      user.billingType = billingTypes[selectedPlan];
      user.scansLimit = 999999;
      user.upgradedAt = new Date().toISOString();

      localStorage.setItem('dt_user', JSON.stringify(user));
      setActivatedPlan(selectedPlan);
      setSuccess(true);
    };

    window.addEventListener('ls-checkout-success', handleLSSuccess);
    return () => window.removeEventListener('ls-checkout-success', handleLSSuccess);
  }, [selectedPlan]);`;
  
content = content.replace(useEff1, newUseEff);

// 3. update handleCheckout and add checkoutUrl calculation mapping
const handleCheckoutRegex = /const handleCheckout = \(\) => {[\s\S]*?};[\s\n]*const handleActivatePlan/m;

const userUrlCalc = `  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('dt_user') || '{}') : {};
  const checkoutUrl = LEMONSQUEEZY_URLS[selectedPlan]
    + '?embed=1&checkout[email]=' + encodeURIComponent(user.email || '')
    + '&checkout[custom][user_id]=' + encodeURIComponent(user.id || '')
    + '&checkout[custom][plan]=' + selectedPlan;

  const handleActivatePlan`;

content = content.replace(handleCheckoutRegex, userUrlCalc);


// 4. replace the button
const btnRegex = /<button[\s]*id="paywall-cta-btn"[\s]*onClick={handleCheckout}[\s]*disabled={loading}[\s]*className={`w-full h-\[52px\] rounded-\[14px\] border-none text-\[16px\] font-\[700\] text-white mt-\[16px\] cursor-pointer transition-all flex items-center justify-center (.*?)`}[\s]*>[\s\S]*?<\/button>/m;

const aTag = `              <a 
                id="paywall-cta-btn"
                href={checkoutUrl}
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).analytics_track) { 
                    (window as any).analytics_track('upgrade_clicked', { plan: selectedPlan }); 
                  }
                  abtest_track('upgrade_clicked');
                }}
                className={\`w-full h-[52px] rounded-[14px] border-none text-[16px] font-[700] text-white mt-[16px] cursor-pointer transition-all flex items-center justify-center lemonsqueezy-button no-underline $1\`}
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  selectedPlan === 'monthly' ? 'Start Monthly — $1.99/mo' :
                  selectedPlan === 'yearly' ? 'Start Yearly — $9.99/yr' :
                  'Get Lifetime Access — $4.99'
                )}
              </a>`;
              
content = content.replace(btnRegex, aTag);

fs.writeFileSync('src/components/PaywallModal.tsx', content);
console.log("Paywall updated.");
