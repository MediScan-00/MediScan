/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { abtest_init } from './lib/abtest';
import { LANGUAGES, TRANSLATIONS, getTranslation } from './lib/i18n';
import { Pill, Bell, Upload, AlertCircle, Info, Activity, Clock, ShieldAlert, Sparkles, X, Image as ImageIcon, Plus, FileText, History as HistoryIcon, Calendar, Baby, Moon, Utensils, HeartPulse, Coffee, Skull, TriangleAlert, CheckCircle2, User, Camera, ShieldCheck, Link2, PhoneCall, AlertTriangle, TrendingDown, ScanSearch, MessageCircleQuestion, AlertOctagon, Lightbulb, HelpCircle, Download, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { analyzePrescription, transcribePrescription, compareMedications, assessEmergencyMistake, explainSymptom, DrugAnalysisResult, TranscriptionResult, PatientProfile, MedicationComparisonResult, EmergencyMistakeData, EmergencyAssessmentResult, SymptomExplanationResult } from './lib/gemini';
import AuthScreen from './components/AuthScreen';
import { auth, db } from './lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Logo } from './components/Logo';
import { TermsModal, PrivacyModal } from './components/LegalModals';

import PaywallModal from './components/PaywallModal';
import OnboardingModal from './components/OnboardingModal';

export const ICONS = {
  Eye: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Trash: (props: any) => (
    <svg width={props.width || 14} height={props.height || 14} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
  Save: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Bell: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Clock: (props: any) => (
    <svg width={props.width || 14} height={props.height || 14} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Download: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Warning: (props: any) => (
    <svg width={props.width || 13} height={props.height || 13} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Check: (props: any) => (
    <svg width={props.width || 13} height={props.height || 13} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Calendar: (props: any) => (
    <svg width={props.width || 12} height={props.height || 12} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Pill: (props: any) => (
    <svg width={props.width || 32} height={props.height || 32} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  ),
  User: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Search: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Close: (props: any) => (
    <svg width={props.width || 16} height={props.height || 16} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ExternalLink: (props: any) => (
    <svg width={props.width || 11} height={props.height || 11} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  ChevronRight: (props: any) => (
    <svg width={props.width || 14} height={props.height || 14} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Refresh: (props: any) => (
    <svg width={props.width || 14} height={props.height || 14} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  ),
  History: (props: any) => (
    <svg width={props.width || 15} height={props.height || 15} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4H1"/><polyline points="1 3 1 7 5 7"/>
    </svg>
  ),
  Compare: (props: any) => (
    <svg width={props.width || 15} height={props.height || 15} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Scan: (props: any) => (
    <svg width={props.width || 15} height={props.height || 15} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  ),
  Heart: (props: any) => (
    <svg width={props.width || 15} height={props.height || 15} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
};

export interface HistoryItem extends DrugAnalysisResult {
  id: string;
  timestamp: string | number;
  query?: string;
  drugNames?: string[];
  summary?: string;
  interactionCount?: number;
  urgentWarning?: any;
  data?: any;
  formattedDate?: string;
}

export function formatDateSafe(dateInput: any) {
  let date;
  
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string') {
    if (dateInput.includes('-')) {
      const parts = dateInput.split('-');
      date = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2].split('T')[0]) // In case it has a time part
      );
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  
  const months = [
    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December'
  ];
  
  return months[date.getMonth()] + ' ' +
         date.getDate() + ', ' +
         date.getFullYear();
}

export function getTodayInputValue() {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd;
}

const formatDate = (dateStr: string | number) => {
  return formatDateSafe(dateStr);
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);
  return date.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export interface PillReminder {
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

declare global {
  interface Window {
    _reminderTimeouts: any;
    _swRegistration: any;
  }
}

window._reminderTimeouts = window._reminderTimeouts || {};

export function reminder_requestNotifPermission() {
  return new Promise<boolean>((resolve) => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      resolve(false);
      return;
    }
    if (Notification.permission === 'granted') {
      resolve(true);
      return;
    }
    if (Notification.permission === 'denied') {
      reminder_showPermissionDeniedUI();
      resolve(false);
      return;
    }
    Notification.requestPermission().then(permission => {
      resolve(permission === 'granted');
    });
  });
}

export function reminder_scheduleAll() {
  Object.values(window._reminderTimeouts).forEach((id: any) => clearTimeout(id));
  window._reminderTimeouts = {};
  
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  
  const reminders = JSON.parse(localStorage.getItem('dt_reminders') || '[]');
  reminders.filter((r: any) => r.active).forEach((r: any) => reminder_scheduleOne(r));
}

export function reminder_scheduleOne(reminder: any) {
  if (!reminder.times || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  
  reminder.times.forEach((timeStr: string, index: number) => {
    const msUntilNext = reminder_msUntilNextDose(timeStr);
    if (msUntilNext < 0) return;
    
    const key = `${reminder.id}_${index}`;
    if (window._reminderTimeouts[key]) {
      clearTimeout(window._reminderTimeouts[key]);
    }
    
    window._reminderTimeouts[key] = setTimeout(() => {
      reminder_fireNotification(reminder, timeStr);
      window._reminderTimeouts[key] = setTimeout(() => reminder_scheduleOne(reminder), 100);
    }, msUntilNext);
    
    console.log(`Scheduled "${reminder.drug}" in ${Math.round(msUntilNext/60000)} minutes`);
  });
}

export function reminder_msUntilNextDose(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.getTime() - now.getTime();
}

export function reminder_fireNotification(reminder: any, timeStr: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  
  const formattedDate = new Date(); // Need formatTime from inside or just recreate it
  const [h, m] = timeStr.split(':').map(Number);
  formattedDate.setHours(h, m, 0);
  const formattedTime = formattedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const times = reminder.times || [];
  const doseNumber = times.indexOf(timeStr) + 1;
  const totalDoses = times.length;
  const doseLabel = totalDoses > 1 ? `Dose ${doseNumber} of ${totalDoses}` : 'Time for your medication';
  
  try {
    const notif = new Notification(`💊 ${reminder.drug}`, {
      body: `${doseLabel}\n${reminder.dose} — ${formattedTime}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `mediscan_${reminder.id}_${timeStr}`,
      requireInteraction: false,
      silent: false
    });
    
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    
    setTimeout(() => notif.close(), 8000);
  } catch (err) {
    console.error('Notification failed:', err);
  }
}

export function reminder_showPermissionDeniedUI() {
  const existing = document.getElementById('notif-denied-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'notif-denied-banner';
  banner.style.cssText = `
    background: #FFF8F0;
    border: 1px solid #F5C842;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  `;
  banner.innerHTML = `
    <span style="font-size:1.2rem">⚠️</span>
    <div>
      <div style="font-weight:700; font-size:13px; color:#92600A; margin-bottom:4px;">{t("notif_blocked")}</div>
      <div style="font-size:12px; color:#6b9490; line-height:1.6;">
        To receive pill reminders, enable notifications in your browser settings:<br/>
        <strong>{t("notif_blocked_sub")}</strong>
      </div>
    </div>
  `;
  const panel = document.getElementById('panel-reminders');
  if (panel) {
    panel.insertBefore(banner, panel.firstChild);
  }
}

export function reminder_sendScheduleToSW() {
  if (typeof window === 'undefined' || !window._swRegistration?.active) return;
  const reminders = JSON.parse(localStorage.getItem('dt_reminders') || '[]');
  
  reminders.filter((r: any) => r.active).forEach((reminder: any) => {
    reminder.times?.forEach((timeStr: string) => {
      const delay = reminder_msUntilNextDose(timeStr);
      if (delay > 0) {
        window._swRegistration.active.postMessage({
          type: 'SCHEDULE_NOTIF',
          reminder: reminder,
          timeStr: timeStr,
          delay: delay
        });
      }
    });
  });
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  const SW_CODE = `
    self.addEventListener('message', (event) => {
      if (event.data.type === 'SCHEDULE_NOTIF') {
        const { reminder, timeStr, delay } = event.data;
        setTimeout(() => {
          self.registration.showNotification('💊 ' + reminder.drug, {
            body: reminder.dose + ' — Time for your medication',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'mediscan_' + reminder.id,
            requireInteraction: false
          });
        }, delay);
      }
    });
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      event.waitUntil(clients.openWindow('/'));
    });
  `;
  const blob = new Blob([SW_CODE], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  
  navigator.serviceWorker.register(swUrl).then(registration => {
    window._swRegistration = registration;
    console.log('SW registered for notifications');
    reminder_sendScheduleToSW();
  }).catch(err => {
    console.log('SW registration failed:', err);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reminder_scheduleAll();
    }
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    reminder_scheduleAll();
  });
  setInterval(() => {
    reminder_scheduleAll();
  }, 60 * 60 * 1000);
}

export function reminder_getNextDoseText(times: string[]) {
  if (!times || times.length === 0) return 'No times set';
  
  let minMs = Infinity;
  let nextTime = '';
  
  times.forEach(t => {
    const ms = reminder_msUntilNextDose(t);
    if (ms < minMs) {
      minMs = ms;
      nextTime = t;
    }
  });
  
  if (minMs === Infinity) return '';
  
  const totalMins = Math.floor(minMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  
  if (hours === 0 && mins === 0) {
    return '🔔 Take your medication NOW!';
  } else if (hours === 0) {
    return `Next dose in ${mins} minute${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `Next dose in ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `Next dose in ${hours}h ${mins}m`;
  }
}



async function pdf_export() {
  const results = document.getElementById('results-area');
  if (!results) return;

  const btn = document.getElementById('pdf-export-btn');
  if (btn) btn.style.display = 'none';

  const printDiv = document.createElement('div');
  printDiv.id = 'print-container';
  printDiv.style.position = 'absolute';
  printDiv.style.top = '-9999px';
  printDiv.style.left = '0';
  printDiv.style.width = '800px';
  printDiv.style.backgroundColor = '#ffffff';
  printDiv.style.fontFamily = "'Segoe UI', sans-serif";
  printDiv.style.color = '#1a3330';
  printDiv.style.padding = '40px';
  
  printDiv.innerHTML = `
    <div style="text-align: center; border-bottom: 2px solid #4A7C6F; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="font-size: 2.5rem; margin-bottom: 8px; font-family: sans-serif;">💊</div>
      <div style="font-size: 1.8rem; font-weight: 700; color: #4A7C6F;">MediScan</div>
      <div>{t("report_title")}</div>
      <div style="font-size: 13px; color: #6b9490; margin-top: 6px;">
        Generated: \${formatDateSafe(new Date())}
      </div>
    </div>
    <div id="pdf-content-wrapper" style="font-size: 14px;">
      \${results.innerHTML}
    </div>
    <div style="text-align: center; font-size: 11px; color: #6b9490; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px;">
      Generated by MediScan App<br/>
      ⚕️ This report is for educational purposes only.
      Always consult your doctor or pharmacist.
    </div>
  `;
  document.body.appendChild(printDiv);
  
  // hide annoying things inside the cloned HTML
  const innerBtn = printDiv.querySelector('.print\\:hidden') as HTMLElement;
  if (innerBtn) innerBtn.style.display = 'none';
  const innerBtns = printDiv.querySelectorAll('button');
  innerBtns.forEach((b: HTMLElement) => b.style.display = 'none');

  try {
    const canvas = await html2canvas(printDiv, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions: 210 x 297 mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    
    // Add subsequent pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('prescription_report.pdf');
    if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('pdf_exported'); }
  } catch (err) {
    console.error("PDF generation failed", err);
  } finally {
    document.body.removeChild(printDiv);
    if (btn) btn.style.display = '';
  }
}


export function ratelimit_check() {
  const user = JSON.parse(
    localStorage.getItem('dt_user') || '{}'
  )
  const plan = user.plan || 'free'
  
  let rl = JSON.parse(
    localStorage.getItem('dt_ratelimit') || '{}'
  )
  
  const today = new Date().toISOString().split('T')[0]
  const month = new Date().getMonth()
  
  // Reset daily count if new day
  if (rl.last_day !== today) {
    rl.daily_count = 0
    rl.last_day = today
  }
  
  // Reset monthly count if new month
  if (rl.last_month !== month) {
    rl.monthly_count = 0
    rl.last_month = month
  }
  
  const dailyLimit   = plan === 'free' ? 5  : 100
  const monthlyLimit = plan === 'free' ? 20 : 9999
  
  if (rl.daily_count >= dailyLimit) {
    ratelimit_showError('daily', dailyLimit)
    return false
  }
  
  if (rl.monthly_count >= monthlyLimit) {
    ratelimit_showError('monthly', monthlyLimit)
    return false
  }
  
  // Increment counters
  rl.daily_count   = (rl.daily_count   || 0) + 1
  rl.monthly_count = (rl.monthly_count || 0) + 1
  localStorage.setItem('dt_ratelimit', JSON.stringify(rl))
  
  return true
}

function ratelimit_showError(type: string, limit: number) {
  const msg = type === 'daily'
    ? `Daily limit of ${limit} analyses reached. Resets tomorrow.`
    : `Monthly limit reached. Upgrade for more.`
  
  ratelimit_toast(msg)
}

function ratelimit_toast(message: string) {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position:fixed; bottom:80px; left:50%;
    transform:translateX(-50%);
    background:#1a3330; color:white;
    padding:12px 20px; border-radius:50px;
    font-size:13px; z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.2);
    animation:slideUpNotif .3s ease;
    max-width:320px; text-align:center;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3500)
}


const FeedbackWidget = ({ drugName, currentLang = 'en' }: { drugName: string, currentLang?: string }) => {
  const t = (key: string) => getTranslation(currentLang, key);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isPositive, setIsPositive] = useState(false);
  const [hidden, setHidden] = useState(false);

  
  const feedback_rate = (val: number) => {
    setRating(val);
    let feedbacks = JSON.parse(
      localStorage.getItem('dt_feedbacks') || '[]'
    );
    feedbacks.push({
      rating: val,
      drug: drugName,
      timestamp: new Date().toISOString()
    });
    feedbacks = feedbacks.slice(-50);
    localStorage.setItem(
      'dt_feedbacks', JSON.stringify(feedbacks)
    );

    if (val >= 4) {
      feedback_showThankYou(true);
    } else {
      feedback_showCommentBox();
    }
  };

  const feedback_showCommentBox = () => {
    setStep(2);
  };

  const feedback_submit = (commentVal: string) => {
    let feedbacks = JSON.parse(
      localStorage.getItem('dt_feedbacks') || '[]'
    );
    if (feedbacks.length > 0) {
      feedbacks[feedbacks.length - 1].comment = commentVal;
      localStorage.setItem(
        'dt_feedbacks', JSON.stringify(feedbacks)
      );
    }
    feedback_showThankYou(false);
  };

  const feedback_showThankYou = (isPositiveVal: boolean) => {
    setIsPositive(isPositiveVal);
    setStep(3);
    if (isPositiveVal) {
      setTimeout(() => setHidden(true), 3000);
    }
  };

  const feedback_show = () => {
    // Component handles rendering
  };


  if (hidden) return null;

  return (
    <div id="feedback-card" className="bg-white border border-[#e2e8f0] rounded-[20px] p-[20px_24px] mt-4 text-center transition-all duration-400 ease-out animate-in slide-in-from-bottom-2 fade-in" style={{ opacity: 1, transform: 'translateY(0)' }}>
      {step === 1 && (
        <div className="animate-in fade-in">
          <h3 style={{ fontFamily: 'serif' }} className="text-[1rem] text-[#1a3330] mb-4">{t("feedback_question")}</h3>
          <div className="flex justify-center gap-2">
            {[
              { emoji: '😞', val: 1 },
              { emoji: '😕', val: 2 },
              { emoji: '😐', val: 3 },
              { emoji: '😊', val: 4 },
              { emoji: '😄', val: 5 }
            ].map(item => (
              <button
                key={item.val}
                className="feedback-emoji w-[52px] h-[52px] rounded-full bg-[#f8fffe] border-2 border-transparent text-[1.6rem] cursor-pointer transition-all duration-200 hover:scale-120 hover:border-[#4A7C6F] hover:bg-[#f0faf9] active:scale-115 active:border-[#4A7C6F] active:bg-[#e8f5f2] active:shadow-[0_4px_12px_rgba(74,124,111,.2)]"
                style={{
                  transform: rating === item.val ? 'scale(1.15)' : rating ? 'scale(0.9)' : 'scale(1)',
                  opacity: rating === item.val ? '1' : rating ? '0.4' : '1',
                  borderColor: rating === item.val ? '#4A7C6F' : 'transparent',
                  backgroundColor: rating === item.val ? '#e8f5f2' : '#f8fffe'
                }}
                onClick={() => feedback_rate(item.val)}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div id="feedback-comment-box" className="animate-in fade-in duration-300 ease-in mt-2 text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("feedback_better")}</label>
          <textarea
            rows={3}
            placeholder="Tell us how to improve..."
            className="w-full rounded-xl border-[1.5px] border-[#e2e8f0] text-[14px] p-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 mb-3"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button
            onClick={() => feedback_submit(comment)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-[44px] rounded-xl font-semibold text-[14px] transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-4 animate-in fade-in duration-400 ease">
          <div className="text-[1.8rem] mb-2">{isPositive ? '🎉' : '💙'}</div>
          <p className="font-semibold text-[15px]" style={{ color: isPositive ? '#166534' : '#4A7C6F' }}>
            {isPositive ? 'Glad it was helpful!' : 'Thank you for your feedback!'}
          </p>
          <p className="text-[12px] text-[#6b9490] mt-1">{t("feedback_improve")}</p>
        </div>
      )}
    </div>
  );
};

export default function App() {

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    abtest_init();
    const handleOnline = () => {
      setIsOffline(false);
      offline_toast('✅ Back online!');
      offline_hideBanner();
    };
    const handleOffline = () => {
      setIsOffline(true);
      offline_showBanner();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (!navigator.onLine) {
      offline_showBanner();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const offline_showBanner = () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block';
  };

  const offline_hideBanner = () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none';
  };

  const offline_toast = (message: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:80px; left:50%;
      transform:translateX(-50%);
      background:#166534; color:white;
      padding:10px 20px; border-radius:50px;
      font-size:13px; z-index:9999;
      box-shadow:0 4px 20px rgba(0,0,0,.2);
      max-width:300px; text-align:center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const offline_cacheResult = (query: string, resultData: any, type: string) => {
    let cache = JSON.parse(
      localStorage.getItem('dt_offline_cache') || '[]'
    );
    
    cache.unshift({
      id: Date.now(),
      query: query,
      data: resultData,
      timestamp: new Date().toISOString(),
      type: type
    });
    
    cache = cache.slice(0, 10);
    
    localStorage.setItem(
      'dt_offline_cache', 
      JSON.stringify(cache)
    );
  };

  const offline_loadCached = (id: number) => {
    const cache = JSON.parse(
      localStorage.getItem('dt_offline_cache') || '[]'
    );
    const item = cache.find((c: any) => c.id === id);
    if (item) {
      if (item.type === 'interaction') {
        setComparisonResult(item.data);
        setActiveTab('compare');
      } else {
        setResult(item.data);
        setActiveTab('text');
      }
      setTimeout(() => {
        document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const [currentLang, setCurrentLang] = useState<string>('en');

  const changeLanguage = (code: string) => {
    if (code === currentLang) return;
    document.body.classList.add('animating-lang');
    setTimeout(() => {
      setCurrentLang(code);
      localStorage.setItem('dt_language', code);
      if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('language_changed', { language: code }); }
      setShowLangDropdown(false);
      setLangSearch('');
      setTimeout(() => {
        document.body.classList.remove('animating-lang');
      }, 300);
    }, 300);
  };
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dt_language');
    const browser = navigator.language ? navigator.language.slice(0, 2).toLowerCase() : 'en';
    const code = saved || (TRANSLATIONS[browser] ? browser : 'en');
    setCurrentLang(code);
  }, []);

  useEffect(() => {
    const langObj = LANGUAGES[currentLang] || LANGUAGES.en;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = langObj.dir;
  }, [currentLang]);

  const t = (key: string) => getTranslation(currentLang, key);
  const langObj = LANGUAGES[currentLang] || LANGUAGES.en;
    const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [showPWABanner, setShowPWABanner] = useState(false);
  const pwaDeferredPromptRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      pwaDeferredPromptRef.current = e;
      setTimeout(() => {
        setShowPWABanner(true);
      }, 30000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const pwa_install = () => {
    if (pwaDeferredPromptRef.current) {
      pwaDeferredPromptRef.current.prompt();
      pwaDeferredPromptRef.current.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setShowPWABanner(false);
        }
        pwaDeferredPromptRef.current = null;
      });
    }
  };

  const legal_openTerms = () => setShowTerms(true);
  const legal_openPrivacy = () => setShowPrivacy(true);
  const legal_closeModal = () => { setShowTerms(false); setShowPrivacy(false); };

  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPaywall, setShowPaywall] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'text' | 'history' | 'profile' | 'compare' | 'reminders'>('text');
  const [explanationMode, setExplanationMode] = useState<'quick' | 'simplified' | 'professional'>('simplified');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('dt_onboarded')) {
      setShowOnboarding(true);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('dt_onboarded', 'true');
    setShowOnboarding(false);
  };

  const [drugInputs, setDrugInputs] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [transcriptionSelections, setTranscriptionSelections] = useState<string[]>([]);
  const [result, setResult] = useState<DrugAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reminders, setReminders] = useState<PillReminder[]>([]);
  const [reminderForm, setReminderForm] = useState({
    drug: '', dose: '', frequency: 'once', times: ['08:00'], startDate: getTodayInputValue(), notes: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('dt_reminders') || '[]');
    setReminders(stored);
    reminder_scheduleAll();
  }, []);

  const reminder_checkAndRequestPermission = async () => {
    if (Notification.permission === 'default') {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position:fixed; inset:0; z-index:99999;
        background:rgba(0,0,0,.5);
        backdrop-filter:blur(4px);
        display:flex; align-items:center;
        justify-content:center; padding:20px;
      `;
      modal.innerHTML = `
        <div style="
          background:white; border-radius:20px;
          padding:28px 24px; max-width:320px;
          width:100%; text-align:center;
          box-shadow:0 20px 60px rgba(0,0,0,.15);
        ">
          <div style="font-size:2.5rem; margin-bottom:12px;">🔔</div>
          <h3 style="font-family:serif; font-size:1.1rem; color:#1a3330; margin-bottom:8px;">{t("enable_reminder")}</h3>
          <p style="font-size:13px; color:#6b9490; line-height:1.7; margin-bottom:20px;">
            MediScan needs permission to send you notifications when it's time to take your medication.
          </p>
          <button id="allow-notif-btn" style="width:100%; height:48px; background:#4A7C6F; color:white; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; margin-bottom:10px;">
            🔔 Allow Notifications
          </button>
          <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%; height:40px; background:transparent; color:#6b9490; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; cursor:pointer;">
            Maybe Later
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('allow-notif-btn')?.addEventListener('click', async () => {
        modal.remove();
        const granted = await reminder_requestNotifPermission();
        if (granted) {
          reminder_scheduleAll();
          // reminder_toast alternative since we don't have it defined right here
        }
      });
    } else if (Notification.permission === 'granted') {
      reminder_scheduleAll();
    }
  };

  const reminder_add = () => {
      if (!reminderForm.drug.trim() || !reminderForm.dose.trim()) return;
      
      const reminder_getDateValue = () => {
        const el = document.getElementById('reminder-startdate') as HTMLInputElement;
        if (el && el.value) {
          return el.value;
        }
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
      };
      
      const newReminder: PillReminder = {
        id: Date.now(),
        drug: reminderForm.drug,
        dose: reminderForm.dose,
        frequency: reminderForm.frequency,
        times: reminderForm.times,
        startDate: reminder_getDateValue(),
        notes: reminderForm.notes,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      const updated = [...reminders, newReminder];
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
      
      if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('reminder_added'); }
      
      setReminderForm({
        drug: '', dose: '', frequency: 'once', times: ['08:00'], startDate: getTodayInputValue(), notes: ''
      });
      
      reminder_checkAndRequestPermission();

      setTimeout(() => {
        const dateEl = document.getElementById('reminder-startdate') as HTMLInputElement;
        if (dateEl) {
          const d    = new Date()
          const yyyy = d.getFullYear()
          const mm   = String(d.getMonth() + 1).padStart(2, '0')
          const dd   = String(d.getDate()).padStart(2, '0')
          dateEl.value = yyyy + '-' + mm + '-' + dd
        }
      }, 50);
  };

  const reminder_delete = (id: number) => {
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
      reminder_scheduleAll();
  };

  const reminder_toggle = (id: number) => {
      const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
      setReminders(updated);
      localStorage.setItem('dt_reminders', JSON.stringify(updated));
      reminder_scheduleAll();
  };



  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    if (result && !isLoading) {
      if (!localStorage.getItem('dt_notif_asked') && ('Notification' in window) && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const timer = setTimeout(() => {
          setShowNotifPrompt(true);
          localStorage.setItem('dt_notif_asked', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [result, isLoading]);

  const notif_requestPermission = () => {
    if (!('Notification' in window)) {
      setShowNotifPrompt(false);
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        localStorage.setItem('dt_notif', 'granted');
        setNotifSuccess(true);
        setTimeout(() => {
          new Notification('MediScan 💊', {
            body: 'Notifications enabled! We will remind you to take your medications.',
            icon: '/favicon.ico'
          });
        }, 2000);
        setTimeout(() => setShowNotifPrompt(false), 2000);
      } else {
        localStorage.setItem('dt_notif', 'denied');
        setShowNotifPrompt(false);
      }
    });
  };

  const notif_hide = () => {
    setShowNotifPrompt(false);
  };

  const [compareDrugA, setCompareDrugA] = useState('');
  const [compareDrugB, setCompareDrugB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<MedicationComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dt_darkmode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'true' || (!saved && prefersDark)) {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dt_darkmode', String(isDark));
    setIsDarkMode(isDark);
  };

  const [profile, setProfile] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('dt_profile') || localStorage.getItem('patientProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          medications: parsed.medications || '',
          conditions: parsed.conditions || '',
          allergies: parsed.allergies || ''
        };
      } catch (e) {
        // ignore
      }
    }
    return { medications: '', conditions: '', allergies: '' };
  });

  const [showProfileToast, setShowProfileToast] = useState(false);

  const saveProfile = () => {
    localStorage.setItem('dt_profile', JSON.stringify({
      medications: profile.medications,
      conditions: profile.conditions,
      allergies: profile.allergies,
      savedAt: new Date().toISOString()
    }));
    setShowProfileToast(true);
    setTimeout(() => setShowProfileToast(false), 2500);
  };

  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyMistakeData>({
    age: '', weight: '', medicationName: '', timeTaken: '', description: ''
  });
  const [emergencyResult, setEmergencyResult] = useState<EmergencyAssessmentResult | null>(null);
  const [isAssessingEmergency, setIsAssessingEmergency] = useState(false);
  const [emergencyError, setEmergencyError] = useState<string|null>(null);

  const [symptomInputs, setSymptomInputs] = useState<{ [drugIndex: number]: string }>({});
  const [symptomResults, setSymptomResults] = useState<{ [drugIndex: number]: SymptomExplanationResult | null }>({});
  const [isExplainingSymptom, setIsExplainingSymptom] = useState<{ [drugIndex: number]: boolean }>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('dt_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const thisMonth = new Date().getMonth();
        if (u.lastResetMonth !== thisMonth) {
          u.scansUsed = 0;
          u.lastResetMonth = thisMonth;
          localStorage.setItem('dt_user', JSON.stringify(u));
        }
        setUser(u);
      } catch (e) { }
    }

    const hash = window.location.hash;
    if (hash.startsWith('#payment-success')) {
      const paramsStr = hash.substring(hash.indexOf('?') + 1);
      const params = new URLSearchParams(paramsStr);
      const plan = params.get('plan');
      const email = params.get('email');
      
      if (plan && email) {
        const uStr = localStorage.getItem('dt_user');
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj && uObj.email === email) {
            history.replaceState(null, '', window.location.pathname);
            setTimeout(() => {
              const planLabels: any = { monthly: 'Pro', yearly: 'Pro Yearly', lifetime: 'Lifetime' };
              const billingTypes: any = { monthly: 'monthly', yearly: 'yearly', lifetime: 'once' };
              const newUser = {
                ...uObj,
                plan: plan === 'monthly' ? 'pro_monthly' : plan === 'yearly' ? 'pro_yearly' : 'lifetime',
                planLabel: planLabels[plan] || 'Pro',
                billingType: billingTypes[plan] || 'monthly',
                scansLimit: 999999,
                upgradedAt: new Date().toISOString()
              };
              setUser(newUser);
              localStorage.setItem('dt_user', JSON.stringify(newUser));
            }, 500);
          }
        }
      }
    }
  }, []);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [confirmSignout, setConfirmSignout] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (activeTab === 'reminders') {
      setTimeout(() => {
        const el = document.getElementById('reminder-startdate') as HTMLInputElement;
        if (!el) return;
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        el.value = yyyy + '-' + mm + '-' + dd;
        el.min = yyyy + '-' + mm + '-' + dd;
      }, 50);
    }
  }, [activeTab]);

  const account_openModal = () => {
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
  
  const account_closeModal = () => {
    setShowAccountModal(false);
  };

  const account_signOut = async () => {
    document.body.style.transition = 'opacity 0.4s';
    document.body.style.opacity = '0';
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out', e);
    }
    setTimeout(() => {
      localStorage.removeItem('dt_user');
      localStorage.removeItem('dt_history');
      localStorage.removeItem('dt_profile');
      localStorage.removeItem('dt_reminders');
      localStorage.removeItem('patientProfile');
      localStorage.removeItem('drugHistory');
      
      setUser(null);
      setHistory([]);
      setProfile({ medications: '', conditions: '', allergies: '', isPregnant: false, isBreastfeeding: false });
      setReminders([]);
      
      setActiveTab('text');
      setResult(null);
      setDrugInputs(['']);
      setImageFile(null);
      setImagePreview(null);
      setConfirmSignout(false);
      setShowDropdown(false);
      
      setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'none';
      }, 50);
    }, 400);
  };

  const account_saveName = () => {
    const u = { ...user, name: newName };
    setUser(u);
    localStorage.setItem('dt_user', JSON.stringify(u));
    setEditingName(false);
    setToast({ message: '✅ Updated successfully!', color: '#4A7C6F' });
    setTimeout(() => setToast(null), 3000);
  };

  const account_saveEmail = () => {
    const u = { ...user, email: newEmail };
    setUser(u);
    localStorage.setItem('dt_user', JSON.stringify(u));
    setEditingEmail(false);
    setToast({ message: '✅ Updated successfully!', color: '#4A7C6F' });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const avatar = document.getElementById('user-avatar-btn');
      if (dropdown && avatar && !dropdown.contains(e.target as Node) && !avatar.contains(e.target as Node)) {
        setShowDropdown(false);
        setConfirmSignout(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setConfirmSignout(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    localStorage.setItem('patientProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const triggerPhrases = ['accidentally took', 'took two doses', 'overdose', 'wrong dose', 'took too much', 'mistake', 'double dose'];
    const text = drugInputs.join(' ').toLowerCase();
    if (text.trim().length > 5 && triggerPhrases.some(phrase => text.includes(phrase))) {
      setIsEmergencyMode(true);
      setEmergencyData(prev => ({...prev, description: drugInputs.join(' ')}));
      setDrugInputs(['']); // clear so it doesn't re-trigger continuously
    }
  }, [drugInputs]);

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    if (!ratelimit_check()) return;
    e.preventDefault();
    setIsAssessingEmergency(true);
    setEmergencyError(null);
    try {
        const res = await assessEmergencyMistake(emergencyData);
        setEmergencyResult(res);
    } catch (err: any) {
        setEmergencyError(err.message || 'An error occurred while assessing the emergency.');
    } finally {
        setIsAssessingEmergency(false);
    }
  };

  const closeEmergencyMode = () => {
     setIsEmergencyMode(false);
     setEmergencyResult(null);
     setEmergencyData({ age: '', weight: '', medicationName: '', timeTaken: '', description: '' });
  };

  const handleExplainSymptom = async (index: number, drugName: string) => {
    if (!ratelimit_check()) return;
    const symptom = symptomInputs[index];
    if (!symptom || !symptom.trim()) return;

    setIsExplainingSymptom(prev => ({ ...prev, [index]: true }));
    try {
      const result = await explainSymptom(drugName, symptom);
      setSymptomResults(prev => ({ ...prev, [index]: result }));
    } catch (err) {
      console.error(err);
      // maybe set a local error state, but for now just console error
    } finally {
      setIsExplainingSymptom(prev => ({ ...prev, [index]: false }));
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [toast, setToast] = useState<{ message: string, color: string } | null>(null);
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  const showToast = (message: string, color: string = '#4A7C6F') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 2500);
  };

  const confirmDelete = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    setDeleteConfirmId(null);
    showToast('🗑 Report deleted', '#DC2626');
  };

  const confirmClearAll = () => {
    setHistory([]);
    setShowClearAllModal(false);
    showToast('🗑 All history cleared', '#DC2626');
  };

  const viewReport = (item: HistoryItem) => {
    setResult(item.data || item);
    setActiveTab('text');
    setViewingReportId(item.id);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dt_history') || localStorage.getItem('drugHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('app_open'); }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
         try {
           const userRef = doc(db, 'users', firebaseUser.uid);
           const docSnap = await getDoc(userRef);
           if (docSnap.exists()) {
             const data = docSnap.data();
             if (data.user) {
                setUser(data.user);
                localStorage.setItem('dt_user', JSON.stringify(data.user));
             }
             if (data.history) {
                setHistory(data.history);
                localStorage.setItem('dt_history', JSON.stringify(data.history));
             }
             if (data.profile) {
                setProfile(data.profile);
                localStorage.setItem('dt_profile', JSON.stringify(data.profile));
             }
             if (data.reminders) {
                setReminders(data.reminders);
                localStorage.setItem('dt_reminders', JSON.stringify(data.reminders));
             }
           } else {
             // Create initial doc from localStorage
             const curUser = JSON.parse(localStorage.getItem('dt_user') || '{}');
             const curHistory = JSON.parse(localStorage.getItem('dt_history') || '[]');
             const curProfile = JSON.parse(localStorage.getItem('dt_profile') || '{"medications":"","conditions":"","allergies":"","isPregnant":false,"isBreastfeeding":false}');
             const curReminders = JSON.parse(localStorage.getItem('dt_reminders') || '[]');
             
             await setDoc(userRef, {
               user: curUser,
               history: curHistory,
               profile: Object.keys(curProfile).length > 0 ? curProfile : { medications: '', conditions: '', allergies: '', isPregnant: false, isBreastfeeding: false },
               reminders: curReminders
             }, { merge: true });
           }
         } catch (e) {
           console.error("Error fetching user data", e);
         }
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('dt_history', JSON.stringify(history));
  }, [history]);


  // FIREBASE CONTINUOUS SYNC
  useEffect(() => {
    if (!auth.currentUser || !user || !user.id) return;
    
    const saveToFirebase = async () => {
      try {
         await setDoc(doc(db, 'users', auth.currentUser!.uid), {
             user: user,
             history: history,
             profile: profile,
             reminders: reminders
         }, { merge: true });
      } catch(e) {
         console.warn("Failed to sync to firebase", e);
      }
    };
    
    const timeoutId = setTimeout(saveToFirebase, 2000); // 2 second debounce
    return () => clearTimeout(timeoutId);
  }, [user, history, profile, reminders]);

    const compressImage = async (file: File, maxWidth = 1024): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const executeAnalysis = async (fileToAnalyze?: File) => {
    if (!ratelimit_check()) return;
    if (isLoading) return;
    const file = fileToAnalyze || imageFile;
    const hasText = drugInputs.some(d => d.trim());
    if (!hasText && !file) return;

    if (!checkPaywall('scan')) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setTranscription(null);

    try {
      let base64Data: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (file) {
        mimeType = file.type;
        const reader = new FileReader();
        base64Data = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const promptText = drugInputs.filter(d => d.trim()).join('\n');
      const prompt = promptText ? `Please analyze the following drugs/medications:\n${promptText}` : '';
      const res = await analyzePrescription(prompt, base64Data, mimeType, profile);
      setResult(res);
      setHistory(prev => {
        const queryText = drugInputs.filter(d => d.trim()).join(', ') || 'Prescription Image';
        const entry: HistoryItem = {
          id: Date.now().toString(),
          query: queryText,
          drugNames: res.drugs?.map(d => d.drugName || (d as any).name) || [],
          summary: res.drugs?.[0]?.veryQuickMode || (res.drugs?.[0] as any)?.purpose || '',
          interactionCount: res.globalInteractions && res.globalInteractions !== "No known interactions" && res.globalInteractions.trim() !== "" ? 1 : 0,
          urgentWarning: res.globalWarnings && res.globalWarnings.length > 0 ? true : false,
          data: res,
          ...res,
          timestamp: new Date().toISOString(),
          formattedDate: formatDateSafe(new Date())
        };
        return [entry, ...prev].slice(0, 50);
      });
      offline_cacheResult(drugInputs.filter(d => d.trim()).join(', ') || 'Prescription Image', res, fileToAnalyze || imageFile ? 'scan' : 'text');
      
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.addBreadcrumb({
          category: 'analysis',
          message: 'Drug analysis completed',
          level: 'info'
        });
      }
      updateScansUsed();
      if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('drug_analyzed', {
        analysis_type: fileToAnalyze || imageFile ? 'scan' : 'text',
        drug_count: drugInputs.filter(d => d.trim()).length || 1
      }); }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImage(file);
      setImageFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setImagePreview(url);
      executeAnalysis(compressedFile);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setTranscription(null);
    setTranscriptionSelections([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateScansUsed = () => {
    if (user) {
      const u = { ...user, scansUsed: (user.scansUsed || 0) + 1 };
      setUser(u);
      localStorage.setItem('dt_user', JSON.stringify(u));
    }
  };

  const checkPaywall = (featureName: string) => {
    if (!user || !user.plan) return true;

    const paidPlans = ['pro_monthly', 'pro_yearly', 'lifetime', 'pro'];
    if (paidPlans.includes(user.plan.toLowerCase())) return true;

    const gatedFeatures = [
      'history', 'profile', 'compare', 'reminders', 'pdf', 'professional_mode', 'detailed_mode'
    ];
    if (gatedFeatures.includes(featureName)) {
      setShowPaywall(featureName);
      if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('paywall_shown', { trigger: featureName }); }
      return false;
    }

    if (featureName === 'scan') {
      return true;
    }
    return true;
  };

  const handleConfirmTranscription = async () => {
    // Legacy function, kept for safety but unused.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis();
  };

  const handleCompare = async (e: React.FormEvent) => {
    if (!ratelimit_check()) return;
    e.preventDefault();
    if (!compareDrugA.trim() || !compareDrugB.trim()) return;
    
    setIsComparing(true);
    setCompareError(null);
    setComparisonResult(null);

    try {
      const res = await compareMedications(compareDrugA, compareDrugB);
      setComparisonResult(res);
      offline_cacheResult(`${compareDrugA} vs ${compareDrugB}`, res, 'interaction');
      if (typeof window !== 'undefined' && (window as any).analytics_track) { (window as any).analytics_track('drug_analyzed', {
        analysis_type: 'interaction',
        drug_count: 2
      }); }
    } catch (err: any) {
      setCompareError(err.message || 'An error occurred during comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {!user && <AuthScreen onLogin={setUser} currentLang={currentLang} setCurrentLang={setCurrentLang} onOpenTerms={legal_openTerms} onOpenPrivacy={legal_openPrivacy} />}
    </AnimatePresence>

    <AnimatePresence>
            {showAccountModal && (
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
            <div className="shrink-0 account-header" style={{ background: "linear-gradient(160deg, #0B2926 0%, #1A3D38 40%, #2D5550 100%)", position: "relative", overflow: "hidden" }}>
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
              <div className="avatar-wrap">
                <div className="avatar-ring" style={{ border: "1.5px dashed rgba(107,175,158,.5)", animation: "spin 10s linear infinite" }} />
                
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
                  <div className="edit-area" style={{ background: "#F0FAF9", border: "1.5px solid rgba(74,124,111,.2)", borderRadius: 16, padding: "16px", margin: "0 20px 20px" }}>
                    <label className="edit-label">
                      {editingName ? "New Name:" : "New Email:"}</label>
                    
                    {editingName ? (

                      <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="edit-input w-full h-11 px-3.5 border-1.5 border-slate-200 rounded-[10px] text-[16px] text-[#1a3330] outline-none bg-white font-inherit focus:border-[#4A7C6F]" style={{ boxShadow: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = '#4A7C6F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,124,111,.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }} />
                    ) : (
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="edit-input w-full h-11 px-3.5 border-1.5 border-slate-200 rounded-[10px] text-[16px] text-[#1a3330] outline-none bg-white font-inherit focus:border-[#4A7C6F]" style={{ boxShadow: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = '#4A7C6F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,124,111,.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }} />
                    )}
                    <div className="btn-row">
                      <button onClick={() => {
                        if (editingName) account_saveName();
                        if (editingEmail) account_saveEmail();
                      }} className="save-btn"
                        style={{ height: 42, background: "#4A7C6F", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                         onMouseOver={e => e.currentTarget.style.background = '#3D6B61'}
                         onMouseOut={e => e.currentTarget.style.background = '#4A7C6F'}>
                        Save
                      </button>
                      <button onClick={() => { setEditingName(false); setEditingEmail(false); }} className="stat-label"
                        style={{ width: 80, flexShrink: 0, height: 42, background: "white", color: "#6b9490", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
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
</AnimatePresence>

    <AnimatePresence>
      {showPaywall && (
        <PaywallModal 
          trigger={showPaywall} 
          onClose={() => setShowPaywall(null)}
          onSuccess={(plan) => {
            const planLabels: any = { monthly: 'Pro', yearly: 'Pro Yearly', lifetime: 'Lifetime' };
            const billingTypes: any = { monthly: 'monthly', yearly: 'yearly', lifetime: 'once' };
            const u = { 
              ...user, 
              plan: plan === 'monthly' ? 'pro_monthly' : plan === 'yearly' ? 'pro_yearly' : 'lifetime',
              planLabel: planLabels[plan] || 'Pro',
              billingType: billingTypes[plan] || 'monthly',
              scansLimit: 999999,
              upgradedAt: new Date().toISOString()
            };
            if (typeof window !== 'undefined' && (window as any).Sentry) {
              (window as any).Sentry.addBreadcrumb({
                category: 'payment',
                message: 'User upgraded to ' + plan,
                level: 'info'
              });
            }
            setUser(u);
            localStorage.setItem('dt_user', JSON.stringify(u));
            setShowPaywall(null);
            if (showPaywall !== 'scan') {
              setActiveTab(showPaywall as any);
            }
          }}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </AnimatePresence>

    <AnimatePresence>
      {user && (
      <motion.div 
        key="main-app" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.4 }}
        className="pb-[36px]"
      >
        {/* Emergency Modal overlay */}
        <AnimatePresence>
      {isEmergencyMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-red-600 text-white p-6 sticky top-0 z-10 flex justify-between items-start">
              <div className="flex gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">{t("emergency_title")}</h2>
                    <p className="text-red-100 font-medium text-sm mt-1">{t("emergency_desc")}</p>
                 </div>
              </div>
              <button onClick={closeEmergencyMode} className="text-white/60 hover:text-white p-1 bg-black/10 hover:bg-black/20 rounded-xl transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {emergencyError && (
                <div className="bg-red-50 text-red-800 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100/50">
                   <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium">{emergencyError}</p>
                </div>
              )}

              {emergencyResult ? (
                <div className="space-y-6">
                   <div className={`p-5 rounded-2xl border ${emergencyResult.isDangerous ? 'bg-red-50 border-red-200 text-red-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        {emergencyResult.isDangerous ? (
                          <><AlertTriangle className="w-5 h-5" />{t("high_risk")}</>
                        ) : (
                          <><ShieldCheck className="w-5 h-5 text-emerald-600" />{t("low_risk")}</>
                        )}
                      </h3>
                      <p className="font-medium">{emergencyResult.explanation}</p>
                   </div>

                   <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
                      <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                         <Activity className="w-5 h-5" />{t("what_to_do")} </h3>
                      <p className="font-bold text-orange-800">{emergencyResult.whatToDoNow}</p>
                   </div>

                   {emergencyResult.requiresEmergencyAssistance && (
                      <div className="bg-red-600 text-white p-6 rounded-2xl shadow-inner flex flex-col items-center justify-center text-center">
                         <PhoneCall className="w-12 h-12 mb-3" />
                         <p className="text-sm font-bold uppercase tracking-widest text-red-200">{t("emergency_call")}</p>
                         <p className="text-5xl font-black tabular-nums tracking-tight mt-1">{emergencyResult.localEmergencyNumber}</p>
                      </div>
                   )}

                   <button onClick={closeEmergencyMode} className="w-full py-4 text-center font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                     Close Emergency Mode
                   </button>
                </div>
              ) : (
                <form onSubmit={handleEmergencySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("emergency_age")}</label>
                       <input type="text" required value={emergencyData.age} onChange={e => setEmergencyData({...emergencyData, age: e.target.value})} placeholder="e.g. 34" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("emergency_weight")}</label>
                       <input type="text" required value={emergencyData.weight} onChange={e => setEmergencyData({...emergencyData, weight: e.target.value})} placeholder="e.g. 70kg" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("emergency_med")}</label>
                     <input type="text" required value={emergencyData.medicationName} onChange={e => setEmergencyData({...emergencyData, medicationName: e.target.value})} placeholder="e.g. Aspirin 500mg, half a bottle..." className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("emergency_time")}</label>
                     <input type="text" required value={emergencyData.timeTaken} onChange={e => setEmergencyData({...emergencyData, timeTaken: e.target.value})} placeholder="e.g. 10 minutes ago" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("emergency_desc_opt")}</label>
                     <textarea value={emergencyData.description} onChange={e => setEmergencyData({...emergencyData, description: e.target.value})} placeholder="Describe the situation..." className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none h-20" />
                  </div>
                  
                  <button type="submit" disabled={isAssessingEmergency} className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold tracking-wide shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                     {isAssessingEmergency ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t("emergency_analyzing")}</>
                     ) : (
                        <><ShieldAlert className="w-5 h-5" />{t("analyze_situation")}</>
                     )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans selection:bg-teal-100 selection:text-teal-900 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-icon-wrap" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 7 }}>
              <Logo uniqueId="header" className="logo-svg-bg"/>
            </div>
            <div>
              <h1 className="text-xl leading-tight flex items-center">
                <span className="logo-medi">Medi</span>
                <span className="logo-scan">{t("tab_scan")}</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />{t("app_tagline")} </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <button
              id="dark-mode-btn"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`relative w-[52px] h-[28px] rounded-[50px] transition-colors duration-300 border-none cursor-pointer ${
                isDarkMode ? 'bg-[#4A7C6F]' : 'bg-[#e2e8f0]'
              }`}
            >
              <div
                className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.2)] flex items-center justify-center text-[12px] transition-all duration-300 ease-[cubic-bezier(.34,1.4,.64,1)] ${
                  isDarkMode ? 'left-[27px]' : 'left-[3px]'
                }`}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </button>
            
            <div className="relative">
              <button
                id="lang-btn"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-3 h-[28px] bg-white/80 backdrop-blur-md rounded-full shadow-sm text-xs font-bold text-gray-700 hover:bg-teal-50 transition-colors border border-gray-100"
              >
                <span>{langObj.flag}</span>
                <span>{currentLang.toUpperCase()}</span>
              </button>
              
              {showLangDropdown && (
                <div 
                  id="lang-dropdown"
                  className="absolute top-[40px] right-0 w-[240px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,.12)] border border-gray-100 p-2 z-[1000] max-h-[320px] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white pb-2 z-10">
                    <input 
                      type="text" 
                      placeholder="Search language..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {Object.entries(LANGUAGES)
                      .filter(([code, lang]) => lang.name.toLowerCase().includes(langSearch.toLowerCase()) || lang.native.toLowerCase().includes(langSearch.toLowerCase()))
                      .map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          changeLanguage(code);
                        }}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-[14px] transition-colors ${code === currentLang ? 'bg-teal-600 text-white font-bold' : 'hover:bg-teal-50 text-gray-700'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.native}</span>
                        </span>
                        {code === currentLang && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user?.plan === 'free' ? (
              <div id="user-plan-badge" className="bg-[#f1f5f4] text-[#6b9490] px-[10px] py-[3px] rounded-[50px] text-[11px] font-[600]">
                Free Plan
              </div>
            ) : (
              <div id="user-plan-badge" className={`px-[10px] py-[3px] rounded-[50px] text-[11px] font-[700] text-white ${user?.plan === 'lifetime' ? 'bg-[#D97706]' : 'bg-[#4A7C6F]'}`}>
                {user?.plan === 'lifetime' ? 'LIFETIME' : 'PRO'}
              </div>
            )}
            <button 
              id="user-avatar-btn"
              onClick={() => { setShowDropdown(!showDropdown); setConfirmSignout(false); }}
              className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-[15px] shadow-sm hover:bg-teal-700 transition-colors"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
            {showDropdown && (
              <motion.div 
                id="user-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-[48px] right-0 w-[220px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200 pb-2 z-50 overflow-hidden"
              >
                {confirmSignout ? (
                  <div className="p-4 flex flex-col gap-3">
                    <p className="text-[14px] font-bold text-gray-900 text-center">{t("sign_out_confirm")}</p>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setConfirmSignout(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-[13px] font-bold transition-colors">{t("cancel_btn")}</button>
                       <button onClick={account_signOut} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> {t("sign_out")}</button>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-[14px] font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[12px] text-teal-700/70 truncate mb-2">{user?.email}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full px-[10px] py-[3px] ${user?.plan !== 'free' ? 'bg-[#4A7C6F] text-white' : 'bg-[#f1f5f4] text-[#6b9490]'}`}>
                      {user?.planLabel || 'Free Plan'}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={account_openModal} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-gray-700 hover:bg-[#f8fffe] hover:text-teal-700 rounded-[10px] transition-colors font-medium">
                      <User className="w-4 h-4" />{t("my_account")} </button>
                    {user?.plan === 'free' && (
                      <button onClick={() => { setShowDropdown(false); setShowPaywall('scan'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-teal-600 font-semibold hover:bg-teal-50 rounded-[10px] transition-colors">
                        <Sparkles className="w-4 h-4" />{t("upgrade_to_pro")} </button>
                    )}
                    <button onClick={() => { setActiveTab('history'); setShowDropdown(false); const el = document.getElementById('tab-history'); if (el) el.click(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-gray-700 hover:bg-[#f8fffe] hover:text-teal-700 rounded-[10px] transition-colors font-medium">
                      <FileText className="w-4 h-4" />{t("my_prescriptions")} </button>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button onClick={() => setConfirmSignout(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-[10px] transition-colors font-medium group">
                      <span className="flex items-center justify-center w-4 h-4 group-hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></span> {t("sign_out")} </button>
                  </div>
                  </>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLang}
            initial={{ opacity: 0, filter: 'blur(4px)', y: 5 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', y: -5 }}
            transition={{ duration: 0.3 }}
          >

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-10 px-4">
          <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto pb-4 max-w-full snap-x px-4 w-full no-scrollbar">
            <button
              onClick={() => setActiveTab('text')}
              className={`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group ${activeTab === 'text' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}`}
              style={{ minWidth: '80px' }}
            >
              <span className={`flex justify-center items-center ${activeTab === 'text' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}`}>
                <ScanSearch width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_scan")}</span>
            </button>
            <button
              id="tab-history"
              onClick={() => {
                if (checkPaywall('history')) setActiveTab('history');
              }}
              className={`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group ${activeTab === 'history' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}`}
              style={{ minWidth: '80px' }}
            >
              <span className={`flex justify-center items-center ${activeTab === 'history' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}`}>
                <HistoryIcon width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_history")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('profile')) setActiveTab('profile');
              }}
              className={`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group ${activeTab === 'profile' ? 'bg-rose-500 shadow-[0_8px_20px_rgb(244,63,94,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}`}
              style={{ minWidth: '80px' }}
            >
              <span className={`flex justify-center items-center ${activeTab === 'profile' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}`}>
                <HeartPulse width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_profile")}</span>
            </button>
            <button
              onClick={() => {
                if (checkPaywall('compare')) setActiveTab('compare');
              }}
              className={`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group ${activeTab === 'compare' ? 'bg-amber-500 shadow-[0_8px_20px_rgb(245,158,11,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}`}
              style={{ minWidth: '80px' }}
            >
              <span className={`flex justify-center items-center ${activeTab === 'compare' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}`}>
                <AlertCircle width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_compare")}</span>
            </button>

            <button
              onClick={() => {
                if (checkPaywall('reminders')) setActiveTab('reminders');
              }}
              className={`snap-center flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 group ${activeTab === 'reminders' ? 'bg-teal-600 shadow-[0_8px_20px_rgb(13,148,136,0.3)] !text-white' : 'bg-white tracking-wide shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] !text-[#6b9490] hover:!text-[#4A7C6F]'}`}
              style={{ minWidth: '80px' }}
            >
              <span className={`flex justify-center items-center ${activeTab === 'reminders' ? 'text-white' : 'text-[#6b9490] group-hover:text-[#4A7C6F]'}`}>
                <ICONS.Bell width={15} height={15} />
              </span>
              <span className="text-xs font-semibold">{t("tab_reminders")}</span>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div key="profile" initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -15}} className="max-w-2xl mx-auto bg-white/70 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{t("profile_title")}</h2>
                   <p className="text-sm text-gray-500">{t("profile_desc")}</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("profile_meds")}</label>
                  <p className="text-xs text-gray-500 mb-2">{t("profile_meds_desc")}</p>
                  <input
                    type="text"
                    value={profile.medications}
                    onChange={(e) => setProfile({...profile, medications: e.target.value})}
                    placeholder="e.g. Aspirin, Simvastatin"
                    className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("profile_conds")}</label>
                  <p className="text-xs text-gray-500 mb-2">{t("profile_conds_desc")}</p>
                  <input
                    type="text"
                    value={profile.conditions}
                    onChange={(e) => setProfile({...profile, conditions: e.target.value})}
                    placeholder="e.g. Diabetes, Hypertension"
                    className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("profile_allergies")}</label>
                  <p className="text-xs text-gray-500 mb-2">{t("profile_allergies_desc")}</p>
                  <input
                    type="text"
                    value={profile.allergies}
                    onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={saveProfile}
                  className="w-full flex items-center justify-center gap-[6px] h-[52px] bg-[#4A7C6F] hover:bg-[#3D6B61] hover:-translate-y-[1px] shadow-[0_4px_16px_rgba(74,124,111,0.3)] rounded-[14px] font-[700] text-[16px] text-white mt-[20px] transition-all border-none"
                >
                  <ICONS.Save className="w-[16px] h-[16px]" style={{ verticalAlign: 'middle', flexShrink: 0 }} /> {t("save_profile")}
                </button>
                
                <AnimatePresence>
                  {showProfileToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-100 text-green-800 p-3 rounded-xl text-center text-sm font-bold mt-4 flex items-center justify-center gap-2"
                    >
                      <ICONS.Check width={16} height={16} /> {t("profile_saved")}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <div className="mt-8 p-4 bg-blue-50/50 backdrop-blur text-blue-800 text-sm rounded-xl border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 shrink-0" />
                <p>{t("profile_info")}</p>
             </div>
          </motion.div>
        
        ) : activeTab === 'reminders' ? (
          <motion.div key="reminders" id="panel-reminders" initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -15}} className="max-w-3xl mx-auto space-y-8">
            
            <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2">
                <ICONS.Bell width={28} height={28} /> {t("add_reminder_btn")}
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">{t("med_name")}</label>
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
                    <label className="text-sm font-semibold text-teal-800">{t("dose")}</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tablet"
                      value={reminderForm.dose}
                      onChange={(e) => setReminderForm({ ...reminderForm, dose: e.target.value })}
                      className="w-full bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                     <label style={{ display: "block", fontWeight: 600, fontSize: "13px", color: "#374151", marginBottom: "6px" }}>{t("start_date")}</label>
                     <input
                        type="date"
                        id="reminder-startdate"
                        style={{
                          width: '100%',
                          height: '52px',
                          padding: '0 16px',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          color: '#1a3330',
                          background: 'white',
                          outline: 'none',
                          cursor: 'pointer',
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          boxSizing: 'border-box'
                        }}
                     />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">{t("frequency_label")}</label>
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${reminderForm.frequency === freq ? 'bg-teal-600 text-white shadow-md border border-teal-600' : 'bg-white text-teal-700 border border-teal-200'}`}
                      >
                        {freq === 'once' ? 'Once daily' : freq === 'twice' ? 'Twice daily' : freq === 'thrice' ? '3x daily' : 'As needed'}
                      </button>
                    ))}
                  </div>
                </div>

                {reminderForm.times.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-800">{t("times_label")}</label>
                    <div className="flex gap-4 flex-wrap">
                      {reminderForm.times.map((time, idx) => (
                        <div key={idx} className="flex flex-col gap-1 w-full sm:w-auto">
                           <span className="text-xs text-teal-600">{idx === 0 ? "Morning" : idx === 1 ? "Afternoon" : "Evening"}</span>
                           <select
                             value={time}
                             onChange={(e) => {
                               const newTimes = [...reminderForm.times];
                               newTimes[idx] = e.target.value;
                               setReminderForm({ ...reminderForm, times: newTimes });
                             }}
                             className="bg-white/50 backdrop-blur-sm border-[1.5px] border-teal-100 rounded-xl px-4 py-3 text-teal-900 focus:outline-none focus:border-teal-500 transition-colors w-full sm:w-32"
                           >
                             {(() => {
                               const options = [];
                               ['AM', 'PM'].forEach(period => {
                                 const startHour = period === 'AM' ? 0 : 12;
                                 const endHour   = period === 'AM' ? 12 : 24;
                                 for (let h = startHour; h < endHour; h++) {
                                   for (let m of [0, 30]) {
                                     const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                     const hh = String(h).padStart(2, '0');
                                     const mm = String(m).padStart(2, '0');
                                     const value = `${hh}:${mm}`;
                                     const label = `${hour12}:${mm} ${period}`;
                                     options.push(<option key={value} value={value}>{label}</option>);
                                   }
                                 }
                               });
                               return options;
                             })()}
                           </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-teal-800">{t("notes_optional")}</label>
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
                  style={{ opacity: reminderForm.drug.trim() ? 1 : 0.6, cursor: reminderForm.drug.trim() ? 'pointer' : 'not-allowed' }}
                  className="w-full h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all"
                  disabled={!reminderForm.drug.trim()}
                >
                  Add Reminder
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <h2 className="text-xl font-bold text-teal-900 mb-6">{t("your_reminders")} <span className="ml-2 bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm">{reminders.length}</span></h2>
              
              {reminders.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                   <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                     <ICONS.Pill width={48} height={48} stroke="#c8e6e2" strokeWidth={1} />
                   </div>
                   <h3 className="text-lg font-bold text-teal-900">{t("no_reminders")}</h3>
                   <p className="text-sm text-teal-700">{t("no_reminders_sub")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(r => (
                    <div key={r.id} className="bg-white rounded-[14px] border border-teal-200/50 p-4 shadow-sm">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${r.active ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                           <div>
                             <h4 className="font-bold text-teal-900">{r.drug}</h4>
                             <p className="text-sm text-teal-700">{r.dose}</p>
                             <span className="text-xs text-teal-600 block mt-1">{t("start_date")}: {formatDateSafe(r.startDate)}</span>
                           </div>
                         </div>
                         
                         <div className="flex gap-2">
                           {r.times.map((t, i) => (
                             <span key={i} className="text-sm bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100 flex items-center gap-1">
                               <ICONS.Clock width={14} height={14} /> {formatTime(t)}
                             </span>
                           ))}
                           {r.times.length === 0 && <span className="text-sm bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{t("freq_needed")}</span>}
                         </div>

                         <div className="flex items-center gap-3 justify-end">
                           <button 
                             onClick={() => reminder_toggle(r.id)}
                             className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${r.active ? 'bg-teal-500' : 'bg-gray-300'}`}
                           >
                             <div className={`w-4 h-4 bg-white rounded-full transition-transform ${r.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </button>
                           <button onClick={() => reminder_delete(r.id)} className="w-8 h-8 flex justify-center items-center text-rose-500 hover:bg-rose-50 rounded-full transition-colors font-bold text-lg">×</button>
                         </div>
                       </div>
                       
                       {r.active && r.times.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-teal-50">
                           <p className="text-xs text-teal-600 font-medium reminder-countdown" data-reminder-id={r.id}>{reminder_getNextDoseText(r.times)}</p>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

) : activeTab === 'compare' ? (
          <motion.div key="compare" initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -15}} className="max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{t("compare_title")}</h2>
                   <p className="text-sm text-gray-500">{t("compare_desc")}</p>
                </div>
              </div>
              
              <form onSubmit={handleCompare}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t("drug_a")}</label>
                    <input
                      id="med-a-input"
                      type="text"
                      value={compareDrugA}
                      onChange={(e) => {
                        setCompareDrugA(e.target.value);
                        const a = document.getElementById('med-a-input') as HTMLInputElement;
                        const b = document.getElementById('med-b-input') as HTMLInputElement;
                        const btn = document.getElementById('compare-btn') as HTMLButtonElement;
                        if(a && b && btn) {
                          if (e.target.value.trim() && b.value.trim()) {
                            btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.disabled = false;
                          } else {
                            btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; btn.disabled = true;
                          }
                        }
                      }}
                      placeholder="e.g. Tylenol"
                      className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t("drug_b")}</label>
                    <input
                      id="med-b-input"
                      type="text"
                      value={compareDrugB}
                      onChange={(e) => {
                        setCompareDrugB(e.target.value);
                        const a = document.getElementById('med-a-input') as HTMLInputElement;
                        const b = document.getElementById('med-b-input') as HTMLInputElement;
                        const btn = document.getElementById('compare-btn') as HTMLButtonElement;
                        if(a && b && btn) {
                          if (a.value.trim() && e.target.value.trim()) {
                            btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.disabled = false;
                          } else {
                            btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; btn.disabled = true;
                          }
                        }
                      }}
                      placeholder="e.g. Advil"
                      className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                
                <button
                  id="compare-btn"
                  type="submit"
                  disabled={isComparing || !compareDrugA.trim() || !compareDrugB.trim() || isOffline}
                  style={{ opacity: (isComparing || !compareDrugA.trim() || !compareDrugB.trim() || isOffline) ? 0.5 : 1, cursor: (isComparing || !compareDrugA.trim() || !compareDrugB.trim() || isOffline) ? 'not-allowed' : 'pointer' }}
                  className="btn-analyze w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold tracking-wide shadow-[0_8px_20px_rgb(217,119,6,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  {isComparing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("comparing")}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      Compare
                    </>
                  )}
                </button>
              </form>

              {compareError && (
                <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-xl flex gap-3 text-sm border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{compareError}</p>
                </div>
              )}
            </div>

            {comparisonResult && !isComparing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                   <h3 className="text-xl font-bold text-gray-900 mb-4">{comparisonResult.drugAName} vs {comparisonResult.drugBName}</h3>
                   <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-amber-600"/> {t("gen_diff")}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{comparisonResult.generalDifference}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50/50 backdrop-blur-sm p-5 rounded-2xl border border-blue-100/50">
                          <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2"><Moon className="w-4 h-4"/> {t("drowsiness")}</h4>
                          <p className="text-blue-900/80 leading-relaxed text-sm">{comparisonResult.drowsinessComparison}</p>
                        </div>
                        <div className="bg-emerald-50/50 backdrop-blur-sm p-5 rounded-2xl border border-emerald-100/50">
                          <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> {t("cost_value")}</h4>
                          <p className="text-emerald-900/80 leading-relaxed text-sm">{comparisonResult.costComparison}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600"/> {t("side_effects_comp")}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{comparisonResult.sideEffectsComparison}</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 bg-gray-100/50 backdrop-blur-sm text-gray-500 text-xs rounded-xl flex gap-3 italic">
                  <Info className="w-4 h-4 shrink-0" />
                  <p>{comparisonResult.disclaimer}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : activeTab === 'history' ? (
          <motion.div key="history" initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -15}} className="max-w-3xl mx-auto">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <HistoryIcon className="w-6 h-6 text-teal-600" />{t("analysis_history")} </h2>
                {history.length > 0 && (
                   <button 
                     onClick={() => setShowClearAllModal(true)}
                     className="text-sm text-red-500 hover:text-red-700 transition-colors font-semibold flex items-center gap-1"
                   >
                     <ICONS.Trash />{t("clear_history")} </button>
                )}
             </div>

             {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b9490' }}>
                   <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                     <HistoryIcon width={48} height={48} stroke="#c8e6e2" strokeWidth={1} />
                   </div>
                   <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3330', marginBottom: '6px' }}>{t("no_history_title")}</div>
                   <div style={{ fontSize: '13px', lineHeight: 1.7 }}>
                     Your analyzed prescriptions will<br/>appear here for easy reference.
                   </div>
                   <button
                     onClick={() => setActiveTab('text')}
                     style={{
                       marginTop: '20px', padding: '10px 24px', background: '#4A7C6F', color: 'white',
                       border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                     }}>
                     Analyze a Prescription →
                   </button>
                </div>
             ) : (
                <div className="space-y-0">
                  <AnimatePresence>
                  {history.map(item => {
                    const drugs = [item.drugName, ...((item as any).drugs?.map((d: any) => d.drugName) || [])].filter(Boolean);
                    const hasDrugs = drugs.length > 0;
                    const summaryMatches = item.summary || item.veryQuickMode || (item as any).purpose || ((item as any).drugs?.[0]?.veryQuickMode || (item as any).drugs?.[0]?.purpose);
                    
                    return (
                    <motion.div 
                      key={item.id}
                      data-history-id={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, overflow: 'hidden' }}
                      className="bg-white border border-[#e2e8f0] rounded-[16px] px-[16px] py-[14px] mb-[10px] shadow-[0_2px_8px_rgba(74,124,111,0.06)] hover:shadow-[0_6px_20px_rgba(74,124,111,0.12)] hover:-translate-y-[1px] transition-all cursor-pointer flex flex-col"
                      onClick={() => viewReport(item)}
                    >
                      <div className="flex justify-between items-start mb-[6px]">
                         <h3 className="text-[14px] font-[600] max-w-[65%] overflow-hidden text-ellipsis whitespace-nowrap">
                            {!hasDrugs ? (
                              <span className="text-[#6b9490] italic font-normal">{t("med_analysis")}</span>
                            ) : (
                              <span className="text-[#4A7C6F]">
                                {drugs.length === 1 ? drugs[0] : <>{drugs[0]} <span className="text-gray-400 font-normal text-xs bg-gray-100 px-1.5 py-0.5 rounded-full ml-1">+{drugs.length - 1} more</span></>}
                              </span>
                            )}
                         </h3>
                         <div className="text-[12px] text-[#6b9490] whitespace-nowrap flex items-center gap-1 shrink-0">
                           <ICONS.Calendar className="w-3 h-3" /> {formatDate(item.timestamp)}
                         </div>
                      </div>
                      
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} className={`text-[13px] leading-[1.6] overflow-hidden mb-[10px] flex-1 ${!summaryMatches ? 'text-gray-400 italic' : 'text-[#5a7269]'}`}>
                        {summaryMatches || "Tap View to see the full analysis"}
                      </div>
                      
                      <div className="flex items-center justify-between gap-[8px] mt-auto">
                        <div className="flex-1 flex items-center">
                          {((item.globalInteractions && item.globalInteractions !== "No known interactions" && item.globalInteractions.trim() !== "") || item.interactionCount! > 0) ? (
                            <span className="bg-[#FEF9C3] text-[#92600A] border border-[#F5C842] rounded-[50px] text-[11px] font-[700] px-[10px] py-[3px] inline-flex items-center gap-1">
                              <ICONS.Warning className="w-[12px] h-[12px]" /> {item.interactionCount || 1} interaction(s)
                            </span>
                          ) : (item.globalWarnings && item.globalWarnings.length > 0) ? (
                            <span className="bg-[#FEF9C3] text-[#92600A] border border-[#F5C842] rounded-[50px] text-[11px] font-[700] px-[10px] py-[3px] inline-flex items-center gap-1">
                              <ICONS.Warning className="w-[12px] h-[12px]" />{t("warning_found")} </span>
                          ) : (
                            <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-[50px] text-[11px] font-[700] px-[10px] py-[3px] inline-flex items-center gap-1">
                              <ICONS.Check className="w-[12px] h-[12px]" />{t("no_interactions_badge")} </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-[8px] shrink-0">
                          <button 
                            className="view-btn h-[32px] px-[12px] bg-[#f0faf9] text-[#4A7C6F] border-[1.5px] border-[#c8e6e2] rounded-[8px] text-[12px] font-[600] flex items-center gap-[5px] justify-center cursor-pointer transition-all hover:bg-[#4A7C6F] hover:text-white hover:border-[#4A7C6F] whitespace-nowrap"
                            onClick={(e) => { e.stopPropagation(); viewReport(item); }}
                          >
                            <ICONS.Eye className="w-[15px] h-[15px]" style={{ stroke: 'currentColor', transition: 'stroke 0.15s' }} /> {t("view_btn")}
                          </button>
                          
                          {deleteConfirmId === item.id ? (
                             <div className="flex items-center gap-[6px] animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
                                <span className="text-[#DC2626] text-[11px] font-[600]">{t("delete_confirm")}</span>
                                <button
                                  className="h-[28px] px-[10px] bg-[#DC2626] text-white border-none rounded-[6px] text-[11px] font-[700] cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); confirmDelete(item.id); }}
                                >{t("yes_btn")}</button>
                                <button
                                  className="h-[28px] px-[10px] bg-[#f1f5f4] text-[#6b9490] border border-[#e2e8f0] rounded-[6px] text-[11px] font-[600] cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                                >{t("no_btn")}</button>
                             </div>
                          ) : (
                            <button 
                              className="delete-btn w-[32px] h-[32px] bg-[#fff5f5] text-[#DC2626] border-[1.5px] border-[#fecaca] rounded-[8px] flex items-center justify-center cursor-pointer transition-all p-0 overflow-hidden hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626]"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeleteConfirmId(item.id); 
                                setTimeout(() => {
                                  setDeleteConfirmId(current => current === item.id ? null : current);
                                }, 4000);
                              }}
                            >
                              <ICONS.Trash className="w-[15px] h-[15px]" style={{ stroke: 'currentColor', transition: 'stroke 0.15s' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )})}
                  </AnimatePresence>
                </div>
             )}
          </motion.div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-500 opacity-80"></div>
              <div className="self-start mb-4 bg-teal-100/60 backdrop-blur-sm text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-teal-200/50">{t("step1")}</div>
              <div className="text-center mb-6 w-full">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("tab_scan")}</h2>
                <p className="text-sm text-gray-500 mt-1">{t("scan_sub")}</p>
              </div>

              {!imagePreview ? (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="relative group">
                    <button 
                      type="button"
                      className="w-48 h-48 rounded-full border-4 border-teal-50/50 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(20,184,166,0.15)] group-hover:shadow-[0_8px_30px_rgb(20,184,166,0.3)] group-hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-teal-500/5 transition-opacity duration-500 group-hover:bg-teal-500/10"></div>
                      <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mb-2 shadow-inner shadow-teal-900/20 group-hover:bg-teal-500 transition-colors duration-300">
                         <Camera className="w-8 h-8 text-white relative z-10" />
                      </div>
                      <span className="font-bold text-teal-800 text-sm z-10 relative">{t("scan_btn_camera")}</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-20"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="relative w-full max-w-sm">
                    <button
                      type="button"
                      className="w-full gap-2 bg-white/80 backdrop-blur-sm border-[1.5px] border-teal-600 text-teal-600 h-[52px] rounded-[14px] font-[700] hover:bg-teal-50 flex items-center justify-center transition-all shadow-sm"
                    >
                      <ImageIcon className="w-5 h-5" />{t("choose_gallery")} </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-gray-200 group bg-gray-50/50 backdrop-blur flex items-center justify-center p-2">
                   <img 
                    src={imagePreview} 
                    alt="Prescription preview" 
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-2 bg-gray-900/60 hover:bg-gray-900 backdrop-blur-md text-white rounded-full transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300 opacity-80"></div>
               <div className="flex items-center justify-between mb-4">
                 <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200/50 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{t("step2")}</div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                   <FileText className="w-3 h-3" />
                   Or Type Manually
                 </h3>
               </div>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-3">
                    <AnimatePresence>
                    {drugInputs.map((drug, index) => (
                      <motion.div key={index} initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="flex items-center gap-2 origin-top">
                         <input
                           type="text"
                           value={drug}
                           onChange={(e) => {
                             const newInputs = [...drugInputs];
                             newInputs[index] = e.target.value;
                             setDrugInputs(newInputs);
                           }}
                           placeholder={index === 0 ? "e.g. Paracetamol 500mg" : `Drug name ${index + 1}`}
                           className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-[1.25rem] p-4 text-sm focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-gray-400 font-medium"
                         />
                         {drugInputs.length > 1 && (
                           <button
                             type="button"
                             onClick={() => {
                               const newInputs = drugInputs.filter((_, i) => i !== index);
                               setDrugInputs(newInputs);
                             }}
                             className="p-4 text-gray-400 hover:text-red-500 transition-colors bg-white/50 border border-transparent hover:border-red-100 hover:bg-red-50/50 rounded-[1.25rem]"
                             title="Remove drug"
                           >
                             <X className="w-5 h-5" />
                           </button>
                         )}
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => setDrugInputs([...drugInputs, ''])}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors p-3 rounded-[1.25rem] hover:bg-teal-50/50 backdrop-blur-sm w-full border border-dashed border-teal-200/60"
                    >
                      <Plus className="w-4 h-4" />
                      Add another medication
                    </button>
                 </div>

                  <button
                    type="submit"
                    disabled={isLoading || (!drugInputs.some(d => d.trim()) && !imageFile) || isOffline}
                    className="btn-analyze w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold tracking-wide shadow-[0_8px_20px_rgb(13,148,136,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 truncate"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 flex-shrink-0 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="truncate">{['Drug name recognition', 'Interactions checked', 'Warnings analyzed'][loadingStep] || 'Analyzing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                        <span>{t("analyze_btn")}</span>
                      </>
                    )}
                  </button>
               </form>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
             <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50/80 backdrop-blur-md text-red-800 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100"
                >
                   <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  {/* Skeleton Card 1 — Main Drug Card */}
                  <div style={{
                    background:'white', borderRadius:'24px',
                    overflow:'hidden', marginBottom:'16px',
                    border:'1px solid #e2e8f0',
                    boxShadow:'0 4px 16px rgba(74,124,111,.08)'
                  }}>
                    {/* Header skeleton */}
                    <div style={{
                      background:'#f8fffe', padding:'20px 24px',
                      display:'flex', alignItems:'center', gap:'12px',
                      borderBottom:'1px solid #e2e8f0'
                    }}>
                      <div className="skeleton" 
                           style={{width:'40px',height:'40px',
                                  borderRadius:'12px',flexShrink:0}}>
                      </div>
                      <div style={{flex:1}}>
                        <div className="skeleton" 
                             style={{width:'55%',height:'18px',
                                    marginBottom:'8px'}}>
                        </div>
                        <div className="skeleton" 
                             style={{width:'30%',height:'13px'}}>
                        </div>
                      </div>
                    </div>

                    {/* Summary box skeleton */}
                    <div style={{
                      margin:'20px', padding:'16px',
                      background:'#f8fffe', borderRadius:'12px',
                      borderRight:'3px solid #e2e8f0'
                    }}>
                      <div className="skeleton" 
                           style={{width:'35%',height:'11px',
                                  marginBottom:'10px'}}>
                      </div>
                      <div className="skeleton" 
                           style={{width:'100%',height:'14px',
                                  marginBottom:'6px'}}>
                      </div>
                      <div className="skeleton" 
                           style={{width:'85%',height:'14px',
                                  marginBottom:'6px'}}>
                      </div>
                      <div className="skeleton" 
                           style={{width:'70%',height:'14px'}}>
                      </div>
                    </div>

                    {/* Info rows skeleton */}
                    <div style={{padding:'0 20px 20px'}}>
                      {[1,2,3,4].map((i) => (
                        <div key={i} style={{
                          display:'flex', alignItems:'center',
                          gap:'12px', padding:'12px 0',
                          borderBottom:'1px solid #f0f0f0'
                        }}>
                          <div className="skeleton" 
                               style={{width:'28px',height:'28px',
                                      borderRadius:'8px',flexShrink:0}}>
                          </div>
                          <div style={{flex:1}}>
                            <div className="skeleton" 
                                 style={{width:'25%',height:'10px',
                                        marginBottom:'6px'}}>
                            </div>
                            <div className="skeleton" 
                                 style={{width:'70%',height:'14px'}}>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skeleton Card 2 — Interactions preview */}
                  <div style={{
                    background:'white', borderRadius:'20px',
                    padding:'20px', marginBottom:'16px',
                    border:'1px solid #e2e8f0',
                    boxShadow:'0 4px 16px rgba(74,124,111,.06)'
                  }}>
                    <div style={{
                      display:'flex', alignItems:'center', 
                      gap:'10px', marginBottom:'16px'
                    }}>
                      <div className="skeleton" 
                           style={{width:'32px',height:'32px',
                                  borderRadius:'50%'}}>
                      </div>
                      <div className="skeleton" 
                           style={{width:'45%',height:'16px'}}>
                      </div>
                    </div>
                    {[1,2].map((i) => (
                      <div key={i} style={{
                        display:'flex', alignItems:'center',
                        gap:'10px', marginBottom:'10px'
                      }}>
                        <div className="skeleton" 
                             style={{width:'80px',height:'30px',
                                    borderRadius:'50px'}}>
                        </div>
                        <div className="skeleton" 
                             style={{width:'20px',height:'14px'}}>
                        </div>
                        <div className="skeleton" 
                             style={{width:'80px',height:'30px',
                                    borderRadius:'50px'}}>
                        </div>
                        <div className="skeleton" 
                             style={{width:'60px',height:'22px',
                                    borderRadius:'50px',marginRight:'auto'}}>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Loading text below skeletons */}
                  <div style={{
                    textAlign:'center', padding:'8px 0 16px',
                    display:'flex', alignItems:'center', 
                    justifyContent:'center', gap:'8px'
                  }}>
                    <div style={{
                      display:'flex', gap:'4px', 
                      alignItems:'center'
                    }}>
                      {[0, 150, 300].map((delay, index) => (
                        <div key={index} style={{
                          width:'6px', height:'6px', 
                          borderRadius:'50%',
                          background:'#4A7C6F', opacity:0.5,
                          animation:`skeleton-dot .8s ease-in-out ${delay}ms infinite alternate`
                        }}></div>
                      ))}
                    </div>
                    <span style={{
                      fontSize:'13px', color:'#6b9490'
                    }}>{t("analyzing")}</span>
                  </div>
                </motion.div>
              )}

              {!isLoading && !result && !error && !transcription && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-16 text-center rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                  <div className="w-24 h-24 bg-white/80 backdrop-blur border border-white shadow-sm rounded-[2rem] flex items-center justify-center mb-6">
                     <FileText className="w-10 h-10 text-teal-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{t("ready_title")}</h3>
                  <p className="text-gray-500 text-sm max-w-sm font-medium">{t("ready_sub")}</p>
                </motion.div>
              )}

              {transcription && !isLoading && (
                <motion.div
                  key="transcription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center border border-teal-100">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t("confirm_meds")}</h2>
                      <p className="text-sm text-gray-500 font-medium">{t("confirm_meds_sub")}</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    {transcription.extractedItems.map((item, idx) => (
                      <div key={idx} className="p-6 border border-white rounded-3xl bg-gray-50/80 backdrop-blur-sm shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-700">{t("med_table_med")} {idx + 1}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${item.confidence === 'high' ? 'bg-green-100 text-green-700 border border-green-200' : item.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{item.confidence} confidence</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                           <button
                             onClick={() => {
                               const newSel = [...transcriptionSelections];
                               newSel[idx] = item.predictedName;
                               setTranscriptionSelections(newSel);
                             }}
                             className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${transcriptionSelections[idx] === item.predictedName ? 'bg-teal-600 text-white shadow-[0_4px_15px_rgb(13,148,136,0.3)]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100/50 hover:border-gray-300'}`}
                           >
                              {item.predictedName}
                           </button>
                           {item.possibleAlternatives && item.possibleAlternatives.map((alt, altIdx) => (
                             <button
                               key={altIdx}
                               onClick={() => {
                                 const newSel = [...transcriptionSelections];
                                 newSel[idx] = alt;
                                 setTranscriptionSelections(newSel);
                               }}
                               className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${transcriptionSelections[idx] === alt ? 'bg-teal-600 text-white shadow-[0_4px_15px_rgb(13,148,136,0.3)]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100/50 hover:border-gray-300'}`}
                             >
                                {alt}
                             </button>
                           ))}
                        </div>
                        <input
                          type="text"
                          value={transcriptionSelections[idx] || ''}
                          onChange={(e) => {
                            const newSel = [...transcriptionSelections];
                            newSel[idx] = e.target.value;
                            setTranscriptionSelections(newSel);
                          }}
                          className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner"
                          placeholder="Or type the correct name manually..."
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                     <button
                       onClick={() => setTranscription(null)}
                       className="flex-1 py-4 px-6 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-2xl font-bold transition-all shadow-sm"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleConfirmTranscription}
                       className="flex-[2] py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold tracking-wide shadow-[0_8px_20px_rgb(13,148,136,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                     >
                       <Sparkles className="w-5 h-5" />
                       Confirm & Analyze
                     </button>
                  </div>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  id="results-area"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 print:space-y-4"
                >
                  {viewingReportId && (
                    <div style={{ background: '#f0faf9', border: '1px solid #c8e6e2', borderRadius: '12px', padding: '10px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#4A7C6F' }}><HistoryIcon width={16} height={16} /></span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a3330' }}>{t("viewing_saved")}</div>
                          <div style={{ fontSize: '11px', color: '#6b9490' }}>
                            From {history.find(h => h.id === viewingReportId)?.formattedDate || formatDate((history.find(h => h.id === viewingReportId)?.timestamp || Date.now()))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setViewingReportId(null)} style={{ background: 'transparent', border: 'none', color: '#6b9490', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <X width={18} height={18} />
                      </button>
                    </div>
                  )}
                  <div className="mb-6 print:hidden">
                    <button
                      id="pdf-export-btn"
                      onClick={() => { if (checkPaywall('pdf')) pdf_export(); }}
                      className="w-full h-[48px] rounded-xl bg-white/70 backdrop-blur-md border-[1.5px] border-teal-600/30 text-teal-800 font-semibold text-[15px] shadow-[0_4px_12px_rgb(0,0,0,0.03)] cursor-pointer hover:bg-white hover:border-teal-500 hover:shadow-[0_8px_20px_rgb(20,184,166,0.12)] hover:-translate-y-[1px] transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <ICONS.Download className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
                      {currentLang === 'ar' ? 'تنزيل التقرير' : 'Download Report'}
                    </button>
                  </div>

                  {/* Emergency Warning */}
                  {result.emergencyDetails?.isEmergency && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-red-600 text-white p-6 rounded-3xl shadow-xl shadow-red-600/20 mb-8 border border-red-500 overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <AlertTriangle className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                           <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                           <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                              Medical Emergency Warning
                           </h2>
                           <p className="text-red-50 font-medium text-lg leading-snug">{result.emergencyDetails.reason}</p>
                           <div className="bg-red-900/40 rounded-xl p-4 mt-4 border border-red-500/30">
                              <h3 className="font-bold text-red-200 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Activity className="w-4 h-4" />{t("immediate_action")} </h3>
                              <p className="font-semibold">{result.emergencyDetails.immediateAction}</p>
                           </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center bg-white text-red-600 p-6 rounded-2xl shadow-inner min-w-[200px]">
                           <PhoneCall className="w-10 h-10 mb-3" />
                           <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">{t("emergency_dial")}</span>
                           <span className="text-4xl font-black tabular-nums tracking-tighter">{result.emergencyDetails.localEmergencyNumber}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Medical Error Warning */}
                  {result.medicalErrorDetection?.isError && !result.emergencyDetails?.isEmergency && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-orange-600 text-white p-6 rounded-3xl shadow-xl shadow-orange-600/20 mb-8 border border-orange-500 overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <AlertTriangle className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                           <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                           <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                              Medical Error Detected
                           </h2>
                           <p className="text-orange-50 font-medium text-lg leading-snug">{result.medicalErrorDetection.description}</p>
                           <div className="bg-orange-900/40 rounded-xl p-4 mt-4 border border-orange-500/30">
                              <h3 className="font-bold text-orange-200 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />{t("action_required")} </h3>
                              <p className="font-bold text-xl">{result.medicalErrorDetection.requiredAction}</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Counterfeit Warning */}
                  {result.counterfeitAnalysis?.isSuspectedCounterfeit && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-purple-600 text-white p-6 rounded-3xl shadow-xl shadow-purple-600/20 mb-8 border border-purple-500 overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ScanSearch className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                           <ScanSearch className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                           <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                              Counterfeit Alert
                           </h2>
                           <p className="text-purple-50 font-medium text-lg leading-snug">{t("fake_med_warning")}</p>
                           <div className="bg-purple-900/40 rounded-xl p-4 mt-4 border border-purple-500/30">
                              <h3 className="font-bold text-purple-200 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Info className="w-4 h-4" />{t("why_q")} </h3>
                              <p className="font-medium">{result.counterfeitAnalysis.reasoning}</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Mode Tracker */}
                  <div className="flex bg-gray-100 p-1 rounded-2xl shadow-inner mb-6">
                    <button onClick={() => setExplanationMode('quick')} className={explanationMode === 'quick' ? 'flex-1 bg-white shadow-sm py-2.5 rounded-xl text-sm font-medium text-teal-700 transition-all' : 'flex-1 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all'}>{t("very_quick")}</button>
                    <button onClick={() => setExplanationMode('simplified')} className={explanationMode === 'simplified' ? 'flex-1 bg-white shadow-sm py-2.5 rounded-xl text-sm font-medium text-teal-700 transition-all' : 'flex-1 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all'}>{t("simplified")}</button>
                    <button onClick={() => setExplanationMode('professional')} className={explanationMode === 'professional' ? 'flex-1 bg-white shadow-sm py-2.5 rounded-xl text-sm font-medium text-teal-700 transition-all' : 'flex-1 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all'}>{t("professional")}</button>
                  </div>

                  {/* Global Warnings & Interactions */}
                  {((result.globalInteractions && result.globalInteractions.toLowerCase() !== "no known interactions" && result.globalInteractions.trim() !== "") || (result.globalWarnings && result.globalWarnings.length > 0)) && (
                    <div className="space-y-4 mb-8">
                      {result.globalInteractions && result.globalInteractions.toLowerCase() !== "no known interactions" && result.globalInteractions.trim() !== "" && (
                        <div className="bg-rose-50/80 backdrop-blur-md p-6 rounded-[2rem] border border-rose-200/50 shadow-[0_4px_20px_rgb(225,29,72,0.05)]">
                          <div className="flex items-center gap-2 mb-3 text-rose-600">
                             <AlertCircle className="w-5 h-5 shrink-0" />
                             <h3 className="text-sm font-bold tracking-wide uppercase">{t("interactions_found")}</h3>
                          </div>
                          <p className="text-rose-900/90 font-medium leading-relaxed">{result.globalInteractions}</p>
                        </div>
                      )}
                      
                      {result.globalWarnings && result.globalWarnings.length > 0 && (
                        <div className="bg-amber-50/80 backdrop-blur-md p-6 rounded-[2rem] border border-amber-200/50 shadow-[0_4px_20px_rgb(217,119,6,0.05)]">
                          <div className="flex items-center gap-2 mb-3 text-amber-600">
                             <ShieldAlert className="w-5 h-5 shrink-0" />
                             <h3 className="text-sm font-bold tracking-wide uppercase">{t("general_warnings")}</h3>
                          </div>
                          <ul className="list-disc pl-6 text-amber-900/90 text-sm space-y-2 font-medium">
                            {result.globalWarnings.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extract drugs array (handle old format) */}
                  {(() => {
                    const drugsList = result.drugs || (result.drugName ? [result as any] : []);
                    return (
                      <div className="space-y-12">
                        {/* Summary Table */}
                        {drugsList.length > 0 && (
                          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
                             <div className="overflow-x-auto">
                               <table className="w-full text-left border-collapse">
                                 <thead>
                                   <tr className="bg-gray-50/50 backdrop-blur-md border-b border-white text-xs uppercase tracking-wider text-gray-400 font-bold">
                                     <th className="px-6 py-5 whitespace-nowrap">{t("med_table_med")}</th>
                                     <th className="px-6 py-5 min-w-[200px]">{t("med_table_purpose")}</th>
                                     <th className="px-6 py-5 min-w-[200px]">{t("timing_label")}</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/50">
                                   {drugsList.map((drug: any, idx: number) => (
                                     <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                                       <td className="px-6 py-5 font-bold text-teal-700 whitespace-nowrap text-sm">{drug.drugName}</td>
                                       <td className="px-6 py-5 text-sm font-medium text-gray-600">{drug.veryQuickMode || (drug as any).purpose}</td>
                                       <td className="px-6 py-5 text-sm font-medium text-gray-600">{drug.simplifiedMode?.howToTake || drug.howToTake}</td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                             </div>
                          </div>
                        )}

                        {/* Detailed Drug Cards */}
                        <div className="space-y-10">
                          {drugsList.map((drug: any, idx: number) => (
                             <div key={idx} className="space-y-4 pt-6 border-t border-gray-200/50 first:border-0 first:pt-0">
                               <div className="flex flex-col gap-2 mb-4">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-[1rem] bg-teal-100/50 backdrop-blur-sm text-teal-700 flex items-center justify-center font-bold text-base shrink-0 shadow-[0_4px_10px_rgb(20,184,166,0.1)] border border-teal-200/50">
                                     {idx + 1}
                                   </div>
                                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">{drug.drugName}</h2>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-3 mt-2 lg:ml-13 xl:ml-[3.25rem]">
                                   {drug.confidenceScore !== undefined && (
                                     <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ${drug.confidenceScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : drug.confidenceScore >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                       <ShieldCheck className="w-4 h-4" />
                                       Confirmation Rate: {drug.confidenceScore}%
                                     </div>
                                   )}
                                   {drug.referenceLinks && drug.referenceLinks.length > 0 && (
                                     <div className="flex flex-wrap gap-2">
                                       {drug.referenceLinks.map((link: any, lIdx: number) => (
                                         <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white/60 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 border border-white shadow-sm transition-colors">
                                           <Link2 className="w-3.5 h-3.5" />
                                           {link.title}
                                         </a>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               </div>

                               {/* Cheaper Alternative Banner */}
                               {drug.cheaperAlternative?.exists && (
                                 <motion.div 
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md border border-white shadow-[0_4px_20px_rgb(16,185,129,0.05)] p-5 rounded-[2rem] mb-4 flex items-start gap-4"
                                 >
                                   <div className="bg-white/90 backdrop-blur-sm p-3 rounded-[1rem] shadow-[0_4px_10px_rgb(0,0,0,0.03)] shrink-0">
                                      <TrendingDown className="w-6 h-6 text-emerald-600" />
                                   </div>
                                   <div>
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                         <h3 className="text-emerald-900 font-bold">{t("cheaper_alt")} <span className="text-emerald-800 bg-white/50 border border-white px-3 py-1 rounded-full shadow-sm ml-1">{drug.cheaperAlternative.name}</span></h3>
                                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 border border-emerald-200/50 px-2 py-1 rounded-full shrink-0">
                                           {drug.cheaperAlternative.savingsEstimate}
                                         </span>
                                      </div>
                                      <p className="text-sm font-medium text-emerald-800/80 mt-1">
                                        {drug.cheaperAlternative.sameActiveIngredient ? (
                                          <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{t("exact_same")} </span>
                                        ) : null}
                                        <span className="ml-1">{drug.cheaperAlternative.explanation}</span>
                                      </p>
                                   </div>
                                 </motion.div>
                               )}

                               <AnimatePresence mode="wait">
                                 {explanationMode === 'quick' && (
                                   <motion.div key="quick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                                     <p className="text-xl text-gray-800 leading-relaxed font-medium">{drug.veryQuickMode || (drug as any).purpose}</p>
                                   </motion.div>
                                 )}
                                 
                                 {explanationMode === 'simplified' && (
                                   <motion.div key="simplified" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="bg-indigo-50/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(79,70,229,0.05)] border border-indigo-200/50 md:col-span-2">
                                        <div className="flex items-center gap-2 mb-3 text-indigo-700">
                                           <User className="w-5 h-5" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("why_prescribed")}</h3>
                                        </div>
                                        <p className="text-indigo-900/90 font-medium leading-relaxed text-lg">{drug.simplifiedMode?.doctorPrescriptionReason || "This was likely prescribed to you for " + (drug.simplifiedMode?.whyUseIt || (drug as any).purpose)}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                           <Activity className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("what_used_for")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.simplifiedMode?.whyUseIt || (drug as any).purpose}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                                           <Clock className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("when_works")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.simplifiedMode?.whenStartsWorking || "Typically starts working within an hour or two."}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-rose-500">
                                           <AlertCircle className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("side_effects")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.simplifiedMode?.commonSideEffects || "May cause some common side effects. Refer to the leaflet."}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-amber-500">
                                           <ShieldAlert className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("avoid")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.simplifiedMode?.whatToAvoid || "Avoid known allergens."}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white md:col-span-2">
                                        <div className="flex items-center gap-2 mb-4 text-teal-600">
                                           <Clock className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("how_to_take")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{drug.simplifiedMode?.howToTake || drug.howToTake}</p>
                                        
                                        {(drug.simplifiedMode?.timing || drug.simplifiedMode?.frequency || drug.simplifiedMode?.missedDose) && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {drug.simplifiedMode?.timing && (
                                                   <div className="bg-teal-50/80 backdrop-blur p-5 rounded-2xl border border-teal-200/50">
                                                      <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">{t("timing_label")}</h4>
                                                      <p className="text-sm text-teal-900/80 font-medium">{drug.simplifiedMode.timing}</p>
                                                   </div>
                                                )}
                                                {drug.simplifiedMode?.frequency && (
                                                   <div className="bg-emerald-50/80 backdrop-blur p-5 rounded-2xl border border-emerald-200/50">
                                                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">{t("frequency_label")}</h4>
                                                      <p className="text-sm text-emerald-900/80 font-medium">{drug.simplifiedMode.frequency}</p>
                                                   </div>
                                                )}
                                                {drug.simplifiedMode?.missedDose && (
                                                   <div className="bg-blue-50/80 backdrop-blur p-5 rounded-2xl border border-blue-200/50">
                                                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">{t("if_forget")}</h4>
                                                      <p className="text-sm text-blue-900/80 font-medium">{drug.simplifiedMode.missedDose}</p>
                                                   </div>
                                                )}
                                            </div>
                                        )}
                                     </div>
                                   </motion.div>
                                 )}

                                 {explanationMode === 'professional' && (
                                   <motion.div key="professional" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                           <Activity className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("active_ing")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.professionalMode?.activeIngredient || "N/A"}</p>
                                     </div>
                                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                                           <Activity className="w-4 h-4" />
                                           <h3 className="text-sm font-bold tracking-wide uppercase">{t("mech_action")}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{drug.professionalMode?.mechanismOfAction || "N/A"}</p>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="bg-rose-50/80 backdrop-blur-md p-6 rounded-[2rem] border border-rose-200/50 shadow-[0_4px_20px_rgb(225,29,72,0.03)]">
                                            <div className="flex items-center gap-2 mb-3 text-rose-600">
                                               <AlertCircle className="w-4 h-4" />
                                               <h3 className="text-sm font-bold tracking-wide uppercase">{t("interactions")}</h3>
                                            </div>
                                            <p className="text-rose-900/80 text-sm leading-relaxed">{drug.professionalMode?.interactions || drug.interactions || "None"}</p>
                                         </div>
                                         <div className="bg-amber-50/80 backdrop-blur-md p-6 rounded-[2rem] border border-amber-200/50 shadow-[0_4px_20px_rgb(217,119,6,0.03)]">
                                            <div className="flex items-center gap-2 mb-3 text-amber-700">
                                               <ShieldAlert className="w-4 h-4" />
                                               <h3 className="text-sm font-bold tracking-wide uppercase">{t("prof_warnings")}</h3>
                                            </div>
                                            <p className="text-amber-900/80 text-sm leading-relaxed">{drug.professionalMode?.warnings || drug.warnings}</p>
                                         </div>
                                     </div>
                                   </motion.div>
                                 )}
                               </AnimatePresence>

                               {/* Warning Indicators */}
                               {(drug.dangerousDosageRisk || drug.unsuitableForChildren || drug.pregnancyRisk || drug.causesDrowsiness || drug.requiresFood || (drug.foodDrinkAvoidance && drug.foodDrinkAvoidance.length > 0) || (drug.chronicConditionRisks && drug.chronicConditionRisks.length > 0)) && (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                   {drug.dangerousDosageRisk && (
                                     <div className="flex items-center gap-4 p-5 bg-red-50/80 backdrop-blur-md text-red-700 rounded-3xl border border-red-200/50 shadow-[0_4px_20px_rgb(239,68,68,0.05)] transition-all">
                                        <div className="bg-red-100/80 p-2.5 rounded-2xl shrink-0">
                                          <Skull className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{t("danger_dose")}</span>
                                     </div>
                                   )}
                                   {drug.unsuitableForChildren && (
                                     <div className="flex items-center gap-4 p-5 bg-red-50/80 backdrop-blur-md text-red-700 rounded-3xl border border-red-200/50 shadow-[0_4px_20px_rgb(239,68,68,0.05)] transition-all">
                                        <div className="bg-red-100/80 p-2.5 rounded-2xl shrink-0">
                                          <Baby className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{t("not_infant")}</span>
                                     </div>
                                   )}
                                   {drug.pregnancyRisk && (
                                     <div className="flex items-center gap-4 p-5 bg-red-50/80 backdrop-blur-md text-red-700 rounded-3xl border border-red-200/50 shadow-[0_4px_20px_rgb(239,68,68,0.05)] transition-all">
                                        <div className="bg-red-100/80 p-2.5 rounded-2xl shrink-0">
                                          <TriangleAlert className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{t("preg_warning")}</span>
                                     </div>
                                   )}
                                   {drug.causesDrowsiness && (
                                     <div className="flex items-center gap-4 p-5 bg-orange-50/80 backdrop-blur-md text-orange-700 rounded-3xl border border-orange-200/50 shadow-[0_4px_20px_rgb(249,115,22,0.05)] transition-all">
                                        <div className="bg-orange-100/80 p-2.5 rounded-2xl shrink-0">
                                          <Moon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{t("cause_drowsy")}</span>
                                     </div>
                                   )}
                                   {drug.requiresFood && (
                                     <div className="flex items-center gap-4 p-5 bg-blue-50/80 backdrop-blur-md text-blue-700 rounded-3xl border border-blue-200/50 shadow-[0_4px_20px_rgb(59,130,246,0.05)] transition-all">
                                        <div className="bg-blue-100/80 p-2.5 rounded-2xl shrink-0">
                                          <Utensils className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide">{t("take_food")}</span>
                                     </div>
                                   )}
                                   {drug.foodDrinkAvoidance?.length > 0 && (
                                      <div className="flex items-center gap-4 p-5 bg-amber-50/80 backdrop-blur-md text-amber-700 rounded-3xl border border-amber-200/50 shadow-[0_4px_20px_rgb(245,158,11,0.05)] col-span-1 sm:col-span-2 transition-all">
                                         <div className="bg-amber-100/80 p-2.5 rounded-2xl shrink-0">
                                           <Coffee className="w-5 h-5 text-amber-600" />
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="text-xs font-black uppercase tracking-widest text-amber-800">{t("avoid_consume")}</span>
                                             <span className="text-sm font-medium mt-0.5">{drug.foodDrinkAvoidance.join(', ')}</span>
                                         </div>
                                      </div>
                                   )}
                                   {drug.chronicConditionRisks?.length > 0 && (
                                      <div className="flex items-center gap-4 p-5 bg-rose-50/80 backdrop-blur-md text-rose-700 rounded-3xl border border-rose-200/50 shadow-[0_4px_20px_rgb(225,29,72,0.05)] col-span-1 sm:col-span-2 transition-all">
                                         <div className="bg-rose-100/80 p-2.5 rounded-2xl shrink-0">
                                           <HeartPulse className="w-5 h-5 text-rose-600" />
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="text-xs font-black uppercase tracking-widest text-rose-800">{t("chronic_risks")}</span>
                                             <span className="text-sm font-medium mt-0.5">{drug.chronicConditionRisks.join(', ')}</span>
                                         </div>
                                      </div>
                                   )}
                                 </div>
                               )}


                               {/* Predicted Questions Section */}
                               {drug.predictedQuestions && drug.predictedQuestions.length > 0 && (
                                 <div className="mt-6 border-t border-gray-100/50 pt-6">
                                   <div className="flex items-center gap-2 mb-4 px-1">
                                      <Lightbulb className="w-5 h-5 text-amber-500" />
                                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{t("common_questions")}</h3>
                                   </div>
                                   <div className="space-y-3">
                                      {drug.predictedQuestions.map((qa, qIdx) => (
                                        <div key={qIdx} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all group">
                                           <div className="flex items-start gap-4">
                                             <div className="bg-amber-50/80 backdrop-blur p-2.5 rounded-2xl shrink-0 group-hover:bg-amber-100/80 transition-colors shadow-sm">
                                               <HelpCircle className="w-5 h-5 text-amber-600" />
                                             </div>
                                             <div>
                                               <h4 className="font-bold text-gray-900 mb-1.5 leading-snug">{qa.question}</h4>
                                               <p className="text-gray-600 font-medium text-sm leading-relaxed">{qa.answer}</p>
                                             </div>
                                            </div>
                                        </div>
                                      ))}
                                   </div>
                                 </div>
                               )}

                               {/* Symptom Checker AI Integration */}
                               <div className="mt-6 border-t border-gray-100/50 pt-6">
                                 <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(59,130,246,0.05)]">
                                   <div className="flex items-center gap-3 mb-3">
                                      <div className="bg-white p-2 rounded-xl shadow-sm">
                                         <MessageCircleQuestion className="w-5 h-5 text-indigo-500" />
                                      </div>
                                      <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">{t("symptom_checker")}</h3>
                                   </div>
                                   <p className="text-xs font-semibold text-indigo-700/80 mb-4 tracking-wide pl-1">
                                     Experiencing a side effect? Ask why it happens and check if it's normal.
                                   </p>

                                   <div className="flex gap-2 mb-4">
                                     <input 
                                       type="text"
                                       value={symptomInputs[idx] || ''}
                                       onChange={(e) => setSymptomInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                                       placeholder="e.g. Why do I feel sleepy after taking this?"
                                       className="flex-1 bg-white/70 backdrop-blur-sm border border-white rounded-[1.25rem] p-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none placeholder:text-indigo-300 transition-all font-medium shadow-inner"
                                       onKeyDown={(e) => {
                                         if (e.key === 'Enter') handleExplainSymptom(idx, drug.drugName);
                                       }}
                                     />
                                     <button 
                                       onClick={() => handleExplainSymptom(idx, drug.drugName)}
                                       disabled={isExplainingSymptom[idx] || !symptomInputs[idx]?.trim()}
                                       className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-4 rounded-[1.25rem] transition-all shadow-[0_4px_15px_rgb(79,70,229,0.3)] active:scale-95 flex items-center justify-center shrink-0"
                                     >
                                        {isExplainingSymptom[idx] ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                     </button>
                                   </div>

                                   {symptomResults[idx] && (
                                     <motion.div 
                                       initial={{ opacity: 0, y: 10 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white"
                                     >
                                        <div className="flex items-start gap-4 mb-4">
                                          <div className={`p-2.5 rounded-2xl mt-0.5 shrink-0 shadow-sm ${symptomResults[idx].requiresMedicalAttention ? 'bg-red-50 text-red-600 border border-red-100' : symptomResults[idx].isNormalSideEffect ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                             {symptomResults[idx].requiresMedicalAttention ? <AlertOctagon className="w-5 h-5" /> : symptomResults[idx].isNormalSideEffect ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                          </div>
                                          <div>
                                             <h4 className="font-bold text-gray-900 mb-1 leading-snug">{t("biol_reason")}</h4>
                                             <p className="text-gray-600 font-medium text-sm leading-relaxed">{symptomResults[idx].biologicalReason}</p>
                                          </div>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${symptomResults[idx].requiresMedicalAttention ? 'bg-red-50/50 border-red-100 shadow-inner' : 'bg-gray-50/50 border-gray-100 shadow-inner'}`}>
                                           <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                             {symptomResults[idx].requiresMedicalAttention ? <span className="text-red-700">{t("action_required")}</span> : <span className="text-gray-600">{t("advice")}</span>}
                                           </h4>
                                           <p className={`text-sm font-semibold ${symptomResults[idx].requiresMedicalAttention ? 'text-red-800' : 'text-gray-700'}`}>
                                              {symptomResults[idx].actionableAdvice}
                                           </p>
                                        </div>
                                     </motion.div>
                                   )}
                                 </div>
                               </div>
                               <div className="bg-[#f8fffe] border-t border-gray-200 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4">
                                 <div className="text-[12px] text-[#6b9490] flex items-center gap-1.5 font-medium">
                                   <ICONS.Warning className="w-3.5 h-3.5" /> AI-generated. Always verify.
                                 </div>
                                 <div className="flex gap-2">
                                   <a
                                     href={`https://www.drugs.com/search.php?searchterm=${encodeURIComponent(drug.drugName)}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center justify-center gap-[4px] h-[30px] px-2.5 rounded-lg border border-teal-600/30 text-teal-700 hover:bg-teal-50 text-[11px] font-semibold transition-colors whitespace-nowrap"
                                   >
                                     <ICONS.ExternalLink />{t("verify_drugs")} </a>
                                   <a
                                     href={`https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${encodeURIComponent(drug.drugName)}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center justify-center gap-[4px] h-[30px] px-2.5 rounded-lg border border-teal-600/30 text-teal-700 hover:bg-teal-50 text-[11px] font-semibold transition-colors whitespace-nowrap"
                                   >
                                     <ICONS.ExternalLink />{t("search_fda")} </a>
                                 </div>
                               </div>
                             </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Disclaimer Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200/50 space-y-4">
                    <div className="flex items-start gap-3 text-gray-400 bg-white/40 backdrop-blur-sm border border-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      
                      <p className="text-[11px] font-mono leading-relaxed uppercase tracking-wide">
                        {result.disclaimer}
                      </p>
                    </div>

                    {/* Feedback Widget */}
                    <FeedbackWidget drugName={result.drugs?.[0]?.name || 'Unknown'} currentLang={currentLang} />


                    <div className="flex justify-end mt-4">
                      <button
                          onClick={() => {
                              setDrugInputs(prev => {
                                  // If the current inputs don't have text, populate the first one with the result
                                  const newInputs = [...prev];
                                  if (!prev.some(d => d.trim())) {
                                      newInputs[0] = result.drugName;
                                  }
                                  // Ensure there is an empty slot for the new drug
                                  if (newInputs[newInputs.length - 1].trim() !== '') {
                                    newInputs.push('');
                                  } else if (newInputs.length === 1 && newInputs[0].trim() !== '') {
                                    newInputs.push('');
                                  }
                                  return newInputs;
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur border border-white text-teal-700 rounded-[1.25rem] hover:bg-teal-50/50 transition-colors text-sm font-bold shadow-[0_4px_15px_rgb(0,0,0,0.04)] active:scale-[0.98]"
                      >
                          <Plus className="w-5 h-5" />
                          Add another drug to this analysis
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}
             </AnimatePresence>
          </div>
        </div>
        )}
        </AnimatePresence>
      
          </motion.div>
        </AnimatePresence>
</main>
    </div>
      </motion.div>
      )}
    </AnimatePresence>
    
    <div className="fixed bottom-0 left-0 w-full min-h-[36px] bg-[#1C2B28] text-[rgba(255,255,255,0.5)] text-[11px] text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1.5 px-4 z-[99999]">
      <span className="flex items-center gap-1.5"><Info width={12} height={12} /> {t("bottom_disclaimer")}</span>
      <div className="flex items-center gap-4">
        <button onClick={legal_openTerms} className="hover:text-white transition-colors hover:underline">{t("terms_link")}</button>
        <button onClick={legal_openPrivacy} className="hover:text-white transition-colors hover:underline">{t("privacy_link")}</button>
      </div>
    </div>

    {showNotifPrompt && (
      <>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideUpNotif {
            from { transform: translateX(-50%) translateY(100px); opacity:0 }
            to   { transform: translateX(-50%) translateY(0); opacity:1 }
          }
        `}} />
        <div id="notif-prompt" style={{
          position: 'fixed', bottom: '80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '90%', maxWidth: '380px',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,.15)',
          padding: '16px 20px',
          zIndex: 999,
          animation: 'slideUpNotif 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {!notifSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#0d9488' }}><ICONS.Bell width={24} height={24} /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{t("notif_title")}</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>{t("notif_btn_sub")}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button onClick={notif_hide} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '6px 16px', borderRadius: '50px' }}>{t("not_now")}</button>
                <button onClick={notif_requestPermission} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '6px 16px' }}>{t("enable_btn")}</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', color: '#166534', marginBottom: '8px' }}><ICONS.Check width={36} height={36} /></div>
              <p style={{ fontSize: '13px', color: '#166534', fontWeight: 600, marginTop: '6px' }}>
                Notifications enabled!
              </p>
            </div>
          )}
        </div>
      </>
    )}

    {toast && (
      <div style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        background: toast.color,
        color: 'white',
        padding: '10px 20px',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,.2)',
        whiteSpace: 'nowrap',
        animation: 'fadeIn 0.2s ease forwards'
      }}>
        {toast.message}
      </div>
    )}

    {showClearAllModal && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '28px 24px',
          maxWidth: '320px', width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#DC2626' }}>
            <ICONS.Trash width={48} height={48} />
          </div>
          <h3 style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#1a3330', marginBottom: '8px' }}>
            Clear All History?
          </h3>
          <p style={{ fontSize: '13px', color: '#6b9490', lineHeight: 1.7, marginBottom: '24px' }}>
            This will permanently delete all your saved analysis reports. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowClearAllModal(false)}
              style={{
                flex: 1, height: '48px', background: '#f1f5f4', color: '#6b9490',
                border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer'
              }}>{t("cancel_btn")}</button>
            <button
              onClick={confirmClearAll}
              style={{
                flex: 1, height: '48px', background: '#DC2626', color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer'
              }}>{t("clear_all_btn")}</button>
          </div>
        </div>
      </div>
    )}
    
      <TermsModal isOpen={showTerms} onClose={legal_closeModal} />
      <PrivacyModal isOpen={showPrivacy} onClose={legal_closeModal} />
      {showPWABanner && (
        <div id="pwa-install-banner" className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#1C2B28] text-white rounded-[16px] px-[18px] py-[14px] flex items-center justify-between gap-[12px] z-[998] shadow-xl">
          <div className="w-[36px] h-[36px] rounded-full bg-teal-600 flex items-center justify-center shrink-0">
             <ICONS.Pill width={18} height={18} />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-[13px] font-bold text-white">{t("add_home")}</span>
            <span className="text-[11px] text-white/70">{t("use_native")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={pwa_install} className="bg-teal-600 px-3 py-1.5 rounded-[8px] text-xs font-bold whitespace-nowrap active:scale-95 transition-transform">{t("add_btn")}</button>
            <button onClick={() => setShowPWABanner(false)} className="text-white/50 hover:text-white p-1 flex items-center justify-center">
              <X width={16} height={16} />
            </button>
          </div>
        </div>
      )}

      {/* Language Transition Overlay */}
      <div id="lang-transition-overlay">
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ICONS.Pill className="text-teal-600 w-12 h-12 mr-3" />
         </div>
      </div>

    </>
  );
}
