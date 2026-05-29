const fs = require('fs');

const css = `
/* Force fix all account modal issues */

#account-modal {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px 16px !important;
}

/* Card */
#account-modal .account-card,
#account-modal > div > div {
  overflow: hidden !important;
  border-radius: 28px !important;
  max-width: 360px !important;
  width: 100% !important;
  max-height: 90dvh !important;
  overflow-y: auto !important;
}

/* Header full width, no crop */
#account-modal .account-header {
  padding: 36px 24px 28px !important;
  margin: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  text-align: center !important;
}

/* Avatar centered */
#account-modal .avatar-wrap {
  width: 80px !important;
  height: 80px !important;
  margin: 0 auto 20px !important;
  position: relative !important;
  display: block !important;
}

/* Ring aligned */
#account-modal .avatar-ring {
  position: absolute !important;
  top: -8px !important;
  left: -8px !important;
  width: calc(100% + 16px) !important;
  height: calc(100% + 16px) !important;
  border-radius: 50% !important;
}

/* Stats all inside cards */
#account-modal .stat-card {
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 90px !important;
  box-sizing: border-box !important;
  position: relative !important;
}

#account-modal .stat-value {
  position: static !important;
  display: block !important;
  width: 100% !important;
  text-align: center !important;
}

/* Edit area stacked */
#account-modal .edit-area label,
#account-modal .edit-area .edit-label {
  display: block !important;
  width: 100% !important;
}

#account-modal .edit-area input {
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

#account-modal .edit-area .btn-row {
  display: flex !important;
  gap: 8px !important;
  width: 100% !important;
}

#account-modal .edit-area .save-btn {
  flex: 1 !important;
  min-width: 0 !important;
}
`;

fs.appendFileSync('src/index.css', '\\n' + css);
console.log('CSS appended to index.css');
