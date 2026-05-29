const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add PillReminder interface
const interfacePillReminder = `
interface PillReminder {
  id: number;
  drug: string;
  dose: string;
  frequency: string;
  times: string[];
  startDate: string;
  notes: string;
  active: boolean;
  createdAt: string;
}
`;
if (!code.includes('interface PillReminder')) {
  code = code.replace(/interface EmergencyAssessmentResult[^{]*{[^}]*}/, match => match + "\n" + interfacePillReminder);
}

// 2. Add activeTab to include reminders
code = code.replace(/useState\<'text' \| 'voice' \| 'history' \| 'profile' \| 'compare'\>\('text'\)/g, "useState<'text' | 'voice' | 'history' | 'profile' | 'compare' | 'reminders'>('text')");

// 3. Add states and functions inside App
const reminderLogic = `
  const [reminders, setReminders] = useState<PillReminder[]>([]);
  const [reminderForm, setReminderForm] = useState({
    drug: '', dose: '', frequency: 'once', times: ['08:00'], startDate: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('dt_reminders') || '[]');
    setReminders(stored);
    stored.filter((r: PillReminder) => r.active).forEach((r: PillReminder) => reminder_schedule(r));
  }, []);

  const reminder_schedule = (reminder: PillReminder) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (!reminder.active) return;

    const now = new Date();
    
    reminder.times.forEach(time => {
      const [hours, minutes] = time.split(':');
      const next = new Date();
      next.setHours(parseInt(hours), parseInt(minutes), 0);
      
      if (next <= now) next.setDate(next.getDate() + 1);
      
      const delay = next.getTime() - now.getTime();
      
      setTimeout(() => {
        new Notification('💊 Time for your medication!', {
          body: \`Take \${reminder.dose} of \${reminder.drug}\`,
          icon: '/favicon.ico',
          tag: reminder.id + '_' + time
        });
      }, delay);
    });
  };

  const reminder_add = () => {
      if (!reminderForm.drug.trim() || !reminderForm.dose.trim()) return;
      
      const newReminder: PillReminder = {
        id: Date.now(),
        drug: reminderForm.drug,
        dose: reminderForm.dose,
        frequency: reminderForm.frequency,
        times: reminderForm.times,
        startDate: reminderForm.startDate,
        notes: reminderForm.notes,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      const updated = [...reminders, newReminder];
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
      reminder_schedule(newReminder);
      
      setReminderForm({
        drug: '', dose: '', frequency: 'once', times: ['08:00'], startDate: new Date().toISOString().split('T')[0], notes: ''
      });
  };

  const reminder_delete = (id: number) => {
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
  };

  const reminder_toggle = (id: number) => {
      const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
      const toggled = updated.find(r => r.id === id);
      if (toggled && toggled.active) {
          reminder_schedule(toggled);
      }
  };

  const reminder_getNextDose = (times: string[]) => {
      if (!times.length) return '';
      const now = new Date();
      
      let nextDate: Date | null = null;
      
      for (const time of times) {
         const [h, m] = time.split(':');
         const d = new Date();
         d.setHours(parseInt(h), parseInt(m), 0, 0);
         if (d > now) {
           if (!nextDate || d < nextDate) nextDate = d;
         }
      }
      if (!nextDate) {
         for (const time of times) {
           const [h, m] = time.split(':');
           const d = new Date();
           d.setHours(parseInt(h), parseInt(m), 0, 0);
           d.setDate(d.getDate() + 1);
           if (!nextDate || d < nextDate) nextDate = d;
         }
      }
      
      if (!nextDate) return '';
      const diffMs = nextDate.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return \`Next dose in \${diffHrs} hours \${diffMins} minutes\`;
  };
`;

if (!code.includes('const [reminders, setReminders]')) {
  code = code.replace(/const fileInputRef = useRef<HTMLInputElement>\(null\);/, match => match + "\n" + reminderLogic);
}

// 4. Update Header Dropdown string if needed or just skip it


fs.writeFileSync('src/App.tsx', code);
