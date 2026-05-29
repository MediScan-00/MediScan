import { getTranslation } from '../lib/i18n';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, AlertTriangle, Users, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: <Camera className="w-12 h-12 text-teal-600 mb-6" />,
    title: "Scan any prescription",
    desc: "Take a photo of your pill bottle or upload a document to instantly understand what it's for."
  },
  {
    icon: <AlertTriangle className="w-12 h-12 text-amber-500 mb-6" />,
    title: "Detect dangerous interactions",
    desc: "We check your current medications and allergies to keep you safe from harmful combinations."
  },
  {
    icon: <Users className="w-12 h-12 text-indigo-500 mb-6" />,
    title: "Manage your whole family",
    desc: "Keep track of medications for everyone in your household with detailed history and profiles."
  }
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('dt_language') || 'en') : 'en';
  const t = (key: string) => getTranslation(currentLang, key);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onComplete} />
      
      <motion.div 
        key="onboarding"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
        className="relative bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl z-10 flex flex-col min-h-[420px]"
      >
        <div className="flex-1 p-8 pb-4 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {slides[currentSlide].icon}
              <h2 className="text-[22px] leading-tight font-bold text-gray-900 mb-3 font-serif">{slides[currentSlide].title}</h2>
              <p className="text-[14px] text-gray-500 leading-relaxed px-2">
                {slides[currentSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white border-t border-gray-50 mt-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={onComplete}
              className="text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors py-2 px-1"
            >
              Skip
            </button>
            
            <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 bg-teal-600' : 'w-1.5 bg-teal-100'}`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] transition-colors flex items-center gap-1 shadow-sm"
            >
              {currentSlide === slides.length - 1 ? 'Start' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-[-2px]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
