const fs = require('fs');

const replacement = `      {showAccountModal && (
        <div id="account-modal" className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(10px)', padding: '20px 16px' }}>
          <div className="absolute inset-0" onClick={account_closeModal} />
          
          <div 
            className="account-card relative bg-white w-full max-w-[360px] rounded-[28px] overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 40px 100px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.08)',
              animation: 'accountModalIn 0.38s cubic-bezier(0.34, 1.2, 0.64, 1) forwards'
            }}
          >
            {/* HERO HEADER */}
            <div className="shrink-0 account-hero" style={{
              background: 'linear-gradient(160deg, #0B2926 0%, #1A3D38 40%, #2D5550 100%)',
              padding: '36px 24px 32px',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center'
            }}>
              {/* Decorative Elements */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(107,175,158,.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(19,181,166,.06)' }} />
              
              {/* Close Button */}
              <button 
                onClick={account_closeModal} 
                className="modal-close-btn"
                style={{
                  position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', zIndex: 10
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {/* Avatar Group */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <div style={{
                  position: 'absolute', inset: -6, borderRadius: '50%', border: '1.5px dashed rgba(107,175,158,.5)',
                  animation: 'spin 10s linear infinite'
                }} />
                
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3D6B61 0%, #13B5A6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 3px rgba(255,255,255,.15), 0 8px 24px rgba(0,0,0,.3)',
                  position: 'relative', zIndex: 1
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                
                <div style={{
                  position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
                  whiteSpace: 'nowrap', border: '2px solid rgba(255,255,255,.2)', borderRadius: 50, padding: '3px 12px',
                  fontSize: 9, fontWeight: 900, letterSpacing: '.1em',
                  background: user?.plan === 'lifetime' ? 'linear-gradient(135deg, #D97706, #F59E0B)' :
                              user?.plan?.startsWith('pro') ? 'linear-gradient(135deg, #4A7C6F, #13B5A6)' : 'rgba(255,255,255,.15)',
                  color: user?.plan === 'lifetime' || user?.plan?.startsWith('pro') ? 'white' : 'rgba(255,255,255,.8)',
                  boxShadow: user?.plan === 'lifetime' ? '0 3px 10px rgba(217,119,6,.4)' :
                             user?.plan?.startsWith('pro') ? '0 3px 10px rgba(19,181,166,.4)' : 'none'
                }}>
                  {user?.plan === 'lifetime' ? 'LIFETIME' : user?.plan?.startsWith('pro') ? 'PRO' : 'FREE'}
                </div>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: 4, textShadow: '0 2px 6px rgba(0,0,0,.2)', letterSpacing: '-.01em', position: 'relative', zIndex: 2 }}>{user?.name}</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '.01em', marginBottom: 0, position: 'relative', zIndex: 2 }}>{user?.email}</p>
            </div>

            {/* WHITE CARD BODY */}
            <div className="account-white-body bg-white" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* STATS */}
              <div className="account-stats-grid" style={{ padding: '20px 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {/* Stat 1 */}
                <div className="stat-card" style={{ background: '#F7FFFE', border: '1.5px solid rgba(74,124,111,.1)', borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.25)'; e.currentTarget.style.background = '#EDF7F5'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(74,124,111,.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.1)'; e.currentTarget.style.background = '#F7FFFE'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(74,124,111,.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4A7C6F" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <path d="M8 14h.01M12 14h.01M16 14h.01"/>
                    </svg>
                  </div>
                  <div className="stat-value" style={{ fontWeight: 700, fontSize: 12, color: '#1a3330', lineHeight: 1.2, marginBottom: 3 }}>
                    {user?.joinedAt ? formatDateSafe(user.joinedAt) : 'May 2026'}
                  </div>
                  <div className="stat-label" style={{ fontSize: 9, fontWeight: 600, color: '#6b9490', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {t("member_since")}
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="stat-card" style={{ background: '#F7FFFE', border: '1.5px solid rgba(74,124,111,.1)', borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.25)'; e.currentTarget.style.background = '#EDF7F5'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(74,124,111,.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.1)'; e.currentTarget.style.background = '#F7FFFE'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(19,181,166,.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#13B5A6" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div id="account-total-analyses" className="stat-value" style={{ fontWeight: 900, fontSize: 22, color: '#1a3330', marginBottom: 3 }}>0</div>
                  <div className="stat-label" style={{ fontSize: 9, fontWeight: 600, color: '#6b9490', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {t("total_analyses")}
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="stat-card" style={{ background: '#F7FFFE', border: '1.5px solid rgba(74,124,111,.1)', borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.25)'; e.currentTarget.style.background = '#EDF7F5'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(74,124,111,.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(74,124,111,.1)'; e.currentTarget.style.background = '#F7FFFE'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(217,119,6,.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                      <path d="M3 7V5a2 2 0 012-2h2"/>
                      <path d="M17 3h2a2 2 0 012 2v2"/>
                      <path d="M21 17v2a2 2 0 01-2 2h-2"/>
                      <path d="M7 21H5a2 2 0 01-2-2v-2"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                    </svg>
                  </div>
                  <div id="account-month-scans" className="stat-value" style={{ fontWeight: 900, fontSize: 22, color: '#1a3330', marginBottom: 3 }}>0</div>
                  <div className="stat-label" style={{ fontSize: 9, fontWeight: 600, color: '#6b9490', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {t("this_month")}
                  </div>
                </div>
              </div>

              {/* UPGRADE BANNER */}
              {user?.plan === 'free' && (
                <div style={{
                  margin: '0 20px 16px', background: 'linear-gradient(135deg, rgba(74,124,111,.06), rgba(19,181,166,.06))',
                  border: '1px solid rgba(74,124,111,.15)', borderRadius: 16, padding: '13px 14px',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(74,124,111,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4A7C6F" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="stat-value" style={{ fontWeight: 700, fontSize: 13, color: '#1a3330' }}>{t("upgrade_to_pro")}</div>
                    <div style={{ fontSize: 11, color: '#6b9490' }}>Unlock all features</div>
                  </div>
                  <button onClick={() => { account_closeModal(); setShowPaywall('monthly'); }} style={{
                    width: 28, height: 28, background: '#4A7C6F', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ width: 10, height: 10 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* ACTION BUTTONS (Last Section) */}
              <div style={{ padding: '0 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => { setEditingName(!editingName); setEditingEmail(false); }} 
                    style={{
                      height: 50, background: '#4A7C6F', color: 'white', border: 'none', borderRadius: 14,
                      fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, 
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,124,111,.3)', transition: 'all 0.2s',
                      transform: editingName ? 'scale(0.98)' : 'none'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#3D6B61'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,124,111,.4)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#4A7C6F'; e.currentTarget.style.transform = editingName ? 'scale(0.98)' : 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(74,124,111,.3)'; }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" style={{ width: 14, height: 14 }}>
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Name
                  </button>
                  <button className="edit-email-btn" onClick={() => { setEditingEmail(!editingEmail); setEditingName(false); }} 
                    style={{
                      height: 50, background: 'white', color: '#4A7C6F', border: '1.5px solid rgba(74,124,111,.25)', borderRadius: 14,
                      fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, 
                      cursor: 'pointer', transition: 'all 0.2s',
                      transform: editingEmail ? 'scale(0.98)' : 'none'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#f0faf9'; e.currentTarget.style.borderColor = '#4A7C6F'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(74,124,111,.25)'; e.currentTarget.style.transform = editingEmail ? 'scale(0.98)' : 'none'; }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 14, height: 14 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Edit Email
                  </button>
                </div>

                <div style={{ overflow: 'hidden', transition: 'all 0.3s ease', maxHeight: (editingName || editingEmail) ? 140 : 0, opacity: (editingName || editingEmail) ? 1 : 0 }}>
                  <div className="edit-area" style={{ background: '#F0FAF9', border: '1.5px solid rgba(74,124,111,.2)', borderRadius: 16, padding: 16, marginTop: 10 }}>
                    <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, fontWeight: 700, color: '#4A7C6F' }}>
                      {editingName ? 'New Name:' : 'New Email:'}
                    </div>
                    {editingName ? (
                      <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="edit-input w-full h-11 px-3.5 border-1.5 border-slate-200 rounded-[10px] text-[16px] text-[#1a3330] outline-none bg-white font-inherit focus:border-[#4A7C6F]" style={{ boxShadow: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = '#4A7C6F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,124,111,.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }} />
                    ) : (
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="edit-input w-full h-11 px-3.5 border-1.5 border-slate-200 rounded-[10px] text-[16px] text-[#1a3330] outline-none bg-white font-inherit focus:border-[#4A7C6F]" style={{ boxShadow: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = '#4A7C6F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,124,111,.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }} />
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={() => {
                        if (editingName) account_saveName();
                        if (editingEmail) account_saveEmail();
                      }} style={{ flex: 1, height: 40, background: '#4A7C6F', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                         onMouseOver={e => e.currentTarget.style.background = '#3D6B61'}
                         onMouseOut={e => e.currentTarget.style.background = '#4A7C6F'}>
                        Save
                      </button>
                      <button onClick={() => { setEditingName(false); setEditingEmail(false); }} className="stat-label" style={{ width: 72, height: 40, background: 'white', color: '#6b9490', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
`;

let content = fs.readFileSync('src/App.tsx', 'utf8');

const sIdx = content.indexOf('{showAccountModal && (');
if (sIdx !== -1) {
  const nextP = content.indexOf('</AnimatePresence>', sIdx);
  if (nextP !== -1) {
    const before = content.substring(0, sIdx);
    const after = content.substring(nextP);
    fs.writeFileSync('src/App.tsx', before + replacement + after);
    console.log('App.tsx Updated');
  } else {
    console.log('Could not find end of modal block');
  }
} else {
  console.log('Could not find start of modal block');
}
