"use client";

import { useState } from "react";
import { Code2, Send, ChevronUp } from "lucide-react";

export default function DeveloperBadge() {
  const [isOpen, setIsOpen] = useState(false);
  
  // قم بكتابة معرف بوت التليجرام الخاص بك هنا بدون علامة القوسين أو @
  const botUsername = "yousmen"; 

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      
      {/* القائمة المنبثقة للأعلى */}
      <div 
        className={`absolute bottom-full mb-3 left-0 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-5 w-72 md:w-80 transition-all duration-300 transform origin-bottom-left flex flex-col gap-4 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
      >
        <div className="text-center border-b border-gray-100 pb-3">
          <h3 className="text-lg font-extrabold text-gray-900 mb-1">المُطوِّر: يـوسـف</h3>
          <p className="text-sm text-gray-500 font-semibold">مطور مواقع أنظمة برمجية متقدمة</p>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed font-bold text-center">
            لإنشاء مواقع الويب الاحترافية، المنصات التعليمية، أداوت الذكاء الاصطناعي، أو للتواصل مع المطور:
          </p>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
            <span className="text-xs text-indigo-400 font-bold block mb-1">المعرف الخاص ببوت التواصل:</span>
            <span className="text-indigo-700 font-extrabold font-sans tracking-wider mx-auto w-max text-center select-all">
              @{botUsername}
            </span>
          </div>
        </div>

        <a 
          href={`https://t.me/${botUsername}`}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 group"
        >
          <Send size={18} className="group-hover:-translate-y-1 transition-transform -scale-x-100" />
          <span>تواصل الآن عبر تيليجرام</span>
        </a>
      </div>

      {/* الزر العائم الرئيسي */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white hover:bg-indigo-600 hover:border-indigo-500 shadow-xl shadow-indigo-900/20 px-5 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group focus:outline-none"
        title="اضغط لمعرفة المزيد وإرسال رسالة"
      >
        <Code2 size={16} className={`transition-colors ${isOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        <span className="text-xs md:text-sm font-semibold tracking-widest uppercase font-sans flex items-center gap-1">
          Developed by <span className="text-indigo-400 group-hover:text-white transition-colors font-bold">YOUSEF</span>
        </span>
        <ChevronUp size={16} className={`transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180 text-white' : 'text-gray-400 group-hover:text-white'}`} />
      </button>

    </div>
  );
}
