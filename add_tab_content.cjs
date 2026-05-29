const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newTabContent = `
        ) : activeTab === 'reminders' ? (
          <motion.div key="reminders" id="panel-reminders" initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -15}} className="max-w-3xl mx-auto space-y-8">
            
            <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2"><span className="text-3xl">⏰</span> Add Pill Reminder</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">Medication Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Metformin 500mg"
                    value={reminderForm.drug}
                    onChange={(e) => setReminderForm({ ...reminderForm, drug: e.target.value })}
                    className="w-full bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-800">Dose</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tablet"
                      value={reminderForm.dose}
                      onChange={(e) => setReminderForm({ ...reminderForm, dose: e.target.value })}
                      className="w-full bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-teal-800">Start Date</label>
                     <input
                        type="date"
                        value={reminderForm.startDate}
                        onChange={(e) => setReminderForm({ ...reminderForm, startDate: e.target.value })}
                        className="w-full bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">Frequency</label>
                  <div className="flex flex-wrap gap-2">
                    {['once', 'twice', 'thrice', 'as_needed'].map(freq => (
                      <button
                        key={freq}
                        onClick={() => {
                          let newTimes = [...reminderForm.times];
                          if (freq === 'once') newTimes = [newTimes[0] || '08:00'];
                          else if (freq === 'twice') newTimes = [newTimes[0] || '08:00', newTimes[1] || '20:00'];
                          else if (freq === 'thrice') newTimes = [newTimes[0] || '08:00', newTimes[1] || '13:00', newTimes[2] || '20:00'];
                          else newTimes = [];
                          setReminderForm({ ...reminderForm, frequency: freq, times: newTimes });
                        }}
                        className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${reminderForm.frequency === freq ? 'bg-teal-600 text-white shadow-md border border-teal-600' : 'bg-white text-teal-700 border border-teal-200'}\`}
                      >
                        {freq === 'once' ? 'Once daily' : freq === 'twice' ? 'Twice daily' : freq === 'thrice' ? '3x daily' : 'As needed'}
                      </button>
                    ))}
                  </div>
                </div>

                {reminderForm.times.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-800">Times</label>
                    <div className="flex gap-4 flex-wrap">
                      {reminderForm.times.map((time, idx) => (
                        <div key={idx} className="flex flex-col gap-1 w-full sm:w-auto">
                           <span className="text-xs text-teal-600">{idx === 0 ? "Morning" : idx === 1 ? "Afternoon" : "Evening"}</span>
                           <input
                             type="time"
                             value={time}
                             onChange={(e) => {
                               const newTimes = [...reminderForm.times];
                               newTimes[idx] = e.target.value;
                               setReminderForm({ ...reminderForm, times: newTimes });
                             }}
                             className="bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors w-full sm:w-32"
                           />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Take with food"
                    value={reminderForm.notes}
                    onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                    className="w-full bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={reminder_add}
                  className="w-full h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50"
                  disabled={!reminderForm.drug.trim() || !reminderForm.dose.trim()}
                >
                  Add Reminder
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <h2 className="text-xl font-bold text-teal-900 mb-6">Your Reminders <span className="ml-2 bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm">{reminders.length}</span></h2>
              
              {reminders.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                   <div className="text-6xl mb-4">💊</div>
                   <h3 className="text-lg font-bold text-teal-900">No reminders yet</h3>
                   <p className="text-sm text-teal-700">Add your first medication reminder above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(r => (
                    <div key={r.id} className="bg-white rounded-[14px] border border-teal-200/50 p-4 shadow-sm">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                           <div className={\`w-2.5 h-2.5 rounded-full \${r.active ? 'bg-teal-500' : 'bg-gray-300'}\`}></div>
                           <div>
                             <h4 className="font-bold text-teal-900">{r.drug}</h4>
                             <p className="text-sm text-teal-700">{r.dose}</p>
                           </div>
                         </div>
                         
                         <div className="flex gap-2">
                           {r.times.map((t, i) => (
                             <span key={i} className="text-sm bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100 flex items-center gap-1">
                               {i === 0 ? '🕗' : i === 1 ? '🕐' : '🕡'} {t}
                             </span>
                           ))}
                           {r.times.length === 0 && <span className="text-sm bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">As needed</span>}
                         </div>

                         <div className="flex items-center gap-3 justify-end">
                           <button 
                             onClick={() => reminder_toggle(r.id)}
                             className={\`w-12 h-6 rounded-full transition-colors flex items-center px-1 \${r.active ? 'bg-teal-500' : 'bg-gray-300'}\`}
                           >
                             <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${r.active ? 'translate-x-6' : 'translate-x-0'}\`}></div>
                           </button>
                           <button onClick={() => reminder_delete(r.id)} className="w-8 h-8 flex justify-center items-center text-rose-500 hover:bg-rose-50 rounded-full transition-colors font-bold text-lg">×</button>
                         </div>
                       </div>
                       
                       {r.active && r.times.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-teal-50">
                           <p className="text-xs text-teal-600 font-medium">{reminder_getNextDose(r.times)}</p>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
`;

const anchor = `) : activeTab === 'compare' ? (`;

if (code.includes(anchor)) {
    code = code.replace(anchor, newTabContent + "\n" + anchor);
} else {
    console.log("Could not find the anchor");
}

fs.writeFileSync('src/App.tsx', code);
