const fs = require('fs');

const css = `
@keyframes accountModalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Base override to ensure wrapper is perfectly fitting */
#account-modal {
  /* wrapper styles inline cover this */
}

/* Dark mode specific styling for the modal */
body.dark-mode #account-modal .account-white-body {
  background: #132825 !important;
}

body.dark-mode #account-modal .stat-card {
  background: rgba(255,255,255,.04) !important;
  border-color: rgba(255,255,255,.07) !important;
}

body.dark-mode #account-modal .stat-value {
  color: #E8F5F3 !important;
}

body.dark-mode #account-modal .stat-label {
  color: rgba(255,255,255,.4) !important;
}

body.dark-mode #account-modal .edit-email-btn {
  background: rgba(255,255,255,.05) !important;
  border-color: rgba(74,124,111,.3) !important;
  color: #E8F5F3 !important;
}

body.dark-mode #account-modal .edit-area {
  background: rgba(74,124,111,.08) !important;
  border-color: rgba(74,124,111,.2) !important;
}

body.dark-mode #account-modal .edit-input {
  background: #0D1F1E !important;
  border-color: rgba(255,255,255,.1) !important;
  color: #E8F5F3 !important;
}

@keyframes spin {
  to { transform: rotate(360deg) }
}
`;

fs.appendFileSync('src/index.css', '\n' + css);
console.log('CSS appended to index.css');
