import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;
  return (
    <div id="terms-modal" className="fixed inset-0 z-[10001] bg-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="mb-10">
          <h1 className="font-serif text-[1.4rem] font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: May 2026</p>
        </div>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using MediScan, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>MediScan provides educational information about medications only.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Medical Disclaimer</h2>
            <p className="font-medium text-gray-900">NOT a substitute for professional medical advice, diagnosis, or treatment.</p>
            <p className="mt-2">Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on MediScan.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. User Responsibilities</h2>
            <p>You agree to use this application responsibly. You must provide accurate information when utilizing the translation and analysis tools and acknowledge that the results are AI-generated and require human verification.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
            <p>MediScan and its creators shall not be liable for any direct, indirect, incidental, consequential, or exemplary damages resulting from your use of the service or any medication decisions made based on its output.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">6. Privacy and Data</h2>
            <p>All data stored locally on your device.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">7. Subscriptions and Payments</h2>
            <p>Billed monthly. Cancel anytime.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the date at the top of this document.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">9. Contact Us</h2>
            <p>support@mediscan.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function PrivacyModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;
  return (
    <div id="privacy-modal" className="fixed inset-0 z-[10001] bg-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="mb-10">
          <h1 className="font-serif text-[1.4rem] font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: May 2026</p>
        </div>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>We do NOT collect personal health data.<br />All medication data stays on your device.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. How We Use Information</h2>
            <p>The application processes medication names to access public pharmaceutical databases and APIs to provide educational descriptions, interactions, and warnings.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Data Storage</h2>
            <p>localStorage only — never transmitted.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p>OpenAI/Anthropic API for analysis.<br />LemonSqueezy for payments.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">5. Cookies</h2>
            <p>We may use minimal local cookies necessary for the secure functioning of user accounts and payment sessions.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p>Under GDPR and similar privacy regulations, you have the right to access, rectify, or erase your data. Since all sensitive data is kept locally, you have full control to delete your data at any time by clearing your browser cache or using the app's clear data functionalities.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">7. Children's Privacy</h2>
            <p>Not intended for users under 13.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">8. Changes to Policy</h2>
            <p>We may update this Privacy Policy periodically. We encourage you to review this page for the latest information on our privacy practices.</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">9. Contact Us</h2>
            <p>support@mediscan.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}
