const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldFuncStart = code.indexOf('const account_openModal = () => {');
if (oldFuncStart === -1) {
    console.log("Could not find account_openModal");
    process.exit(1);
}

const oldFuncEnd = code.indexOf('const account_closeModal = () => {');

const newFunc = `const account_openModal = () => {
    setShowDropdown(false);
    setEditingName(false);
    setEditingEmail(false);
    setNewName(user?.name || '');
    setNewEmail(user?.email || '');
    setShowAccountModal(true);
    
    setTimeout(() => {
      const totalEl = document.getElementById('account-total-count') || document.getElementById('account-total-analyses');
      const monthEl = document.getElementById('account-month-count') || document.getElementById('account-month-scans');
      
      const history = JSON.parse(localStorage.getItem('dt_history') || '[]');
      const storedUser = JSON.parse(localStorage.getItem('dt_user') || '{}');
      
      function account_animateCount(el: any, target: number) {
        if (!el) return;
        let current = 0;
        const duration = 600;
        const startTime = performance.now();
        
        function step(now: number) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(eased * target);
          if (el) el.textContent = current;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      account_animateCount(totalEl, history.length);
      account_animateCount(monthEl, storedUser.scansUsed || 0);
    }, 300);
  };
  
  `;

code = code.substring(0, oldFuncStart) + newFunc + code.substring(oldFuncEnd);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx Updated');
