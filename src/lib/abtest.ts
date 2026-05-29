
export function abtest_init() {
  if (typeof window === 'undefined') return 'A';
  let variant = localStorage.getItem('dt_ab_variant')
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B'
    localStorage.setItem('dt_ab_variant', variant)
  }
  (window as any).AB_VARIANT = variant;
  return variant;
}

export function abtest_track(eventName: string) {
  if (typeof window === 'undefined') return;
  const variant = (window as any).AB_VARIANT || 'A'
  
  let events = JSON.parse(
    localStorage.getItem('dt_ab_events') || '[]'
  )
  events.push({
    variant: variant,
    event: eventName,
    timestamp: new Date().toISOString()
  })
  events = events.slice(-100)
  localStorage.setItem(
    'dt_ab_events', JSON.stringify(events)
  )

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'ab_test', {
      variant:    variant,
      ab_event:   eventName,
      test_name:  'paywall_cta'
    })
  }
}

export function abtest_showResults() {
  if (typeof window === 'undefined') return;
  const events = JSON.parse(
    localStorage.getItem('dt_ab_events') || '[]'
  )
  
  const stats: any = { A: {}, B: {} }
  
  events.forEach((e: any) => {
    const v = e.variant || 'A';
    stats[v][e.event] = (stats[v][e.event] || 0) + 1
  })

  const rateA = stats.A.upgrade_completed 
    ? ((stats.A.upgrade_completed / 
       (stats.A.paywall_shown || 1)) * 100).toFixed(1) 
    : 0
  const rateB = stats.B.upgrade_completed 
    ? ((stats.B.upgrade_completed / 
       (stats.B.paywall_shown || 1)) * 100).toFixed(1) 
    : 0

  const panel = document.createElement('div')
  panel.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background:rgba(0,0,0,.85);
    display:flex; align-items:center;
    justify-content:center;
  `
  panel.innerHTML = `
    <div style="
      background:white; border-radius:24px;
      padding:32px; max-width:480px; width:90%;
      color:black;
    ">
      <h2 style="
        font-family:serif; font-size:1.4rem;
        margin-bottom:20px; text-align:center;
      ">📊 A/B Test Results</h2>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;
                       border-bottom:2px solid #e2e8f0">
              Metric
            </th>
            <th style="text-align:center;padding:8px;
                       border-bottom:2px solid #e2e8f0;
                       color:#4A7C6F">
              Variant A
            </th>
            <th style="text-align:center;padding:8px;
                       border-bottom:2px solid #e2e8f0;
                       color:#D97706">
              Variant B
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 8px">Paywall shown</td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.A.paywall_shown || 0}
            </td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.B.paywall_shown || 0}
            </td>
          </tr>
          <tr style="background:#f8fffe">
            <td style="padding:10px 8px">Upgrade clicked</td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.A.upgrade_clicked || 0}
            </td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.B.upgrade_clicked || 0}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 8px">Converted</td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.A.upgrade_completed || 0}
            </td>
            <td style="text-align:center;padding:10px 8px">
              ${stats.B.upgrade_completed || 0}
            </td>
          </tr>
          <tr style="background:#f8fffe;font-weight:700">
            <td style="padding:10px 8px">
              Conversion Rate
            </td>
            <td style="text-align:center;padding:10px 8px;
                       color:#4A7C6F">
              ${rateA}%
            </td>
            <td style="text-align:center;padding:10px 8px;
                       color:#D97706">
              ${rateB}%
            </td>
          </tr>
        </tbody>
      </table>

      <div style="
        margin-top:20px; padding:14px;
        background:#f8fffe; border-radius:12px;
        text-align:center; font-size:13px;
        color:#4A7C6F; font-weight:600;
      ">
        ${rateB > rateA 
          ? '🏆 Variant B is winning!' 
          : rateA > rateB 
            ? '🏆 Variant A is winning!'
            : '⚖️ No clear winner yet'}
      </div>

      <button 
        onclick="this.parentElement.parentElement.remove()"
        style="
          width:100%; margin-top:16px; height:44px;
          background:#4A7C6F; color:white; border:none;
          border-radius:12px; font-size:14px;
          font-weight:600; cursor:pointer;
        ">
        Close
      </button>
    </div>
  `
  document.body.appendChild(panel)
  history.replaceState(null, '', window.location.pathname)
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#ab-results') {
      abtest_showResults()
    }
  });
  if (window.location.hash === '#ab-results') {
    // delay slightly to let app mount
    setTimeout(() => {
        abtest_showResults();
    }, 500);
  }
}
