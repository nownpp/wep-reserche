"use client";

import { useState, useRef, useEffect } from 'react';
import { Loader2, FileText, Download, FileOutput, Edit3, CheckCircle, ArrowRight, LogIn, UserPlus, LogOut, RefreshCw, Clock } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TableOfContents, Footer, PageNumber } from 'docx';
import AdBanner from '@/components/AdBanner';
import { siteConfig } from '@/config/site';

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Outline Edit, 3: Generation & Result
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('تربية عام');
  const [researchTitle, setResearchTitle] = useState('');
  const [section, setSection] = useState('أساسي علوم');
  const [academicYear, setAcademicYear] = useState('2025 / 2026');
  
  const [outlineText, setOutlineText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const AD_LINK = 'https://www.profitablecpmratenetwork.com/w8meqgbgd?key=7700cf784b2a5489c9348e7e77832640';

  // --- نظام الحسابات (Auth System) ---
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<{username: string, credits: number, activated: boolean} | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [checkBalanceResult, setCheckBalanceResult] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('bt_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
      setStudentName(parsed.username);

      if (parsed.password) {
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', username: parsed.username, password: parsed.password })
        })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            const rawCredits = data.credits !== undefined ? data.credits : (data.newCredits !== undefined ? data.newCredits : 0);
            const updatedCredits = Number(rawCredits);
            const isActuallyActivated = data.activated === true || String(data.activated).toLowerCase() === 'true' || Number(data.activated) === 1;

            if (updatedCredits !== Number(parsed.credits) || isActuallyActivated !== parsed.activated) {
              const updatedSession = { ...parsed, credits: updatedCredits, activated: isActuallyActivated };
              setCurrentUser(updatedSession);
              localStorage.setItem('bt_user', JSON.stringify(updatedSession));
              
              if ((parsed.credits === undefined || Number(parsed.credits) <= 0 || !parsed.activated) && (updatedCredits > 0 || isActuallyActivated)) {
                setIsWelcoming(true);
                setTimeout(() => setIsWelcoming(false), 2000);
              }
            }
          }
        })
        .catch(err => console.error('Silent refresh error:', err));
      }
    }

    // تحميل بيانات "تذكرني" (Remember Me)
    const savedRemember = localStorage.getItem('bt_remember');
    if (savedRemember === 'true') {
      setRememberMe(true);
      const savedUser = localStorage.getItem('bt_remembered_user');
      const savedPass = localStorage.getItem('bt_remembered_pass');
      if (savedUser && savedPass) {
        setAuthForm({ username: savedUser, password: savedPass });
      }
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (authMode === 'signup') {
      const name = authForm.username.trim();
      
      const isValidName = (str: string) => {
        // 1. يمنع وجود مسافات متتالية كثيرة، ويسمح بالحروف الإنجليزية والعربية والأرقام
        if (!/^[\u0600-\u06FFa-zA-Z0-9\s]{2,30}$/.test(str)) return false;
        
        // منع اختيار الكلمات الوارد أنها مجرد تجربة
        if (/^(test|admin|user|demo|root|testing)$/i.test(str)) return false;

        return true;
      };

      if (!isValidName(name)) {
        setAuthError('يرجى كتابة اسم حقيقي وصحيح. لا يُسمح بالأسماء الوهمية أو الحروف العشوائية الكيبوردية.');
        setAuthLoading(false);
        return;
      }
    }

    try {
      const trimmedUser = authForm.username.trim();
      const rawPass = authForm.password; // لا نستخدم trim هنا لضمان الدقة

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: authMode, username: trimmedUser, password: rawPass })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'فشل في عملية الدخول');
      
      const rawCredits = data.credits !== undefined ? data.credits : (data.newCredits !== undefined ? data.newCredits : 0);
      const session = { username: trimmedUser, password: rawPass, credits: Number(rawCredits), activated: !!data.activated };
      setCurrentUser(session);
      setStudentName(session.username); 
      localStorage.setItem('bt_user', JSON.stringify(session));

      // التعامل مع "تذكرني"
      if (rememberMe) {
        localStorage.setItem('bt_remember', 'true');
        localStorage.setItem('bt_remembered_user', trimmedUser);
        localStorage.setItem('bt_remembered_pass', rawPass);
      } else {
        localStorage.removeItem('bt_remember');
        localStorage.removeItem('bt_remembered_user');
        localStorage.removeItem('bt_remembered_pass');
      }

      if (authMode === 'login') {
        setIsWelcoming(true);
        setTimeout(() => setIsWelcoming(false), 2000); // إظهار شاشة الترحيب لفانيتين
      }
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('bt_user');
    setStep(1);
    setGeneratedContent('');
    setOutlineText('');
    setAuthForm({ username: '', password: '' });
  };

  const handleCheckBalance = async () => {
    if (!currentUser || isCheckingBalance) return;
    setIsCheckingBalance(true);
    setCheckBalanceResult('');

    try {
      const stored = localStorage.getItem('bt_user');
      const parsed = stored ? JSON.parse(stored) : {};
      
      // استخراج كلمة المرور بشكل أكثر دقة وموثوقية
      const validPassword = (currentUser as any).password || parsed.password;
      const currentUserName = currentUser.username || parsed.username;
      
      if (!validPassword || !currentUserName) {
         setCheckBalanceResult('⚠️ تعذر العثور على بيانات تسجيل دخول محفوظة. يرجى تسجيل الخروج ثم الدخول مرة أخرى.');
         setIsCheckingBalance(false);
         return;
      }
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          username: String(currentUserName).trim(), 
          password: String(validPassword) // نرسل كلمة المرور كما هي بدون trim()
        })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
         setCheckBalanceResult(`خطأ من السيرفر: ${data.error || 'بيانات غير صحيحة'}`);
         setIsCheckingBalance(false);
         return;
      }

      const rawCredits = data.credits !== undefined ? data.credits : (data.newCredits !== undefined ? data.newCredits : 0);
      const updatedCredits = Number(rawCredits);
      
      const isActuallyActivated = data.activated === true || String(data.activated).toLowerCase() === 'true' || Number(data.activated) === 1;

      if (updatedCredits > 0 || isActuallyActivated) {
        // نضمن إعادة حفظ كلمة المرور مع الجلسة المحدثة
        const updatedSession = { ...parsed, credits: updatedCredits, activated: isActuallyActivated, password: validPassword };
        setCurrentUser(updatedSession);
        localStorage.setItem('bt_user', JSON.stringify(updatedSession));
        
        if (isActuallyActivated) {
           setCheckBalanceResult(''); 
           setIsWelcoming(true);
           setTimeout(() => setIsWelcoming(false), 2000);
        } else {
           setCheckBalanceResult('تم تحديث الرصيد (' + updatedCredits + ')، والحساب ما زال بانتظار التفعيل.');
        }
      } else {
        setCheckBalanceResult('لم يتم تفعيل حسابك بعد. يرجى الانتظار.');
      }
    } catch (err: any) {
      setCheckBalanceResult('نواجه صعوبة في الاتصال حالياً، يرجى التحقق من جودة الإنترنت.');
    } finally {
      setIsCheckingBalance(false);
    }
  };
  // -----------------------------------

  // ---- شاشات التحقق من الحسابات ----
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-indigo-600" size={50} />
      </div>
    );
  }

  // شاشة الترحيب للمستخدم (Loading Screen)
  if (isWelcoming && currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center justify-center p-4 select-none">
        <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); .font-fancy { font-family: 'Dancing Script', cursive; letter-spacing: 1px; }" }} />
        <Loader2 className="animate-spin text-indigo-500 mb-8" size={50} />
        <h2 className="text-2xl text-gray-400 mb-2 font-semibold">Welcome Back,</h2>
        <h1 className="text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 font-fancy px-4 pb-2 drop-shadow-xl">
          {currentUser.username}
        </h1>
      </div>
    );
  }

  // شاشة تسجيل الدخول وإنشاء الحساب (المنصة الاحترافية)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); .font-fancy { font-family: 'Dancing Script', cursive; } .font-arabic { font-family: 'Tajawal', sans-serif; }" }} />
        
        {/* --- Hero Section --- */}
        <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-fuchsia-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              الجيل الجديد من الأبحاث الأكاديمية
            </div>
            
            <h1 className="text-6xl md:text-8xl font-arabic font-black text-slate-900 leading-[1.2]">
              مرحباً بك في منصة <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 font-fancy pb-2">B-bot Research</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 font-arabic max-w-2xl mx-auto leading-relaxed">
              حوّل أفكارك إلى أبحاث أكاديمية متكاملة في دقائق. دقة عالية، تنسيق احترافي، ونتائج مبهرة تناسب تطلعاتك العلمية.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6">
              <button 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 active:scale-95"
              >
                ابدأ رحلتك الآن
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-bold text-xl hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
              >
                تعرف على المزايا
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-slate-400 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section id="features-section" className="py-24 bg-white px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-arabic font-bold text-slate-900 mb-4">لماذا تختار منصة B-bot؟</h2>
              <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "دقة أكاديمية", desc: "أبحاث تلتزم بالهيكل العلمي الصحيح، من المقدمة وحتى المراجع بدقة متناهية.", icon: <CheckCircle className="text-indigo-600" size={40} /> },
                { title: "تنسيق PDF جاهز", desc: "بلمسة واحدة، احصل على بحثك منسقاً وجاهزاً للطباعة بصيغة Word أو PDF باحترافية.", icon: <FileOutput className="text-fuchsia-600" size={40} /> },
                { title: "دعم بحثي ذكي", desc: "محرك ذكاء اصطناعي يفهم تخصصك الدراسي ويساعدك في اختيار العناوين المناسبة.", icon: <Edit3 className="text-emerald-600" size={40} /> }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm">{f.icon}</div>
                  <h3 className="text-2xl font-arabic font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 font-arabic leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Auth Section --- */}
        <section id="auth-section" className="py-24 bg-gradient-to-b from-white to-indigo-50/50 px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600"></div>
              
              <div className="text-center mb-10">
                <div className="text-4xl font-fancy text-indigo-600 mb-2">Join the Platform</div>
                <h2 className="text-2xl font-arabic font-extrabold text-slate-900">
                  {authMode === 'login' ? 'مرحباً بعودتك' : 'ابدأ تجربتك المجانية'}
                </h2>
              </div>

              <div className="flex bg-slate-100/50 rounded-2xl p-1.5 mb-10">
                <button 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >دخول</button>
                <button 
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${authMode === 'signup' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >تسجيل جديد</button>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700 mr-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 text-center text-xl font-bold"
                    placeholder="User_Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700 mr-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 text-center tracking-[1em] text-xl"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 px-2">
                  <input
                    type="checkbox"
                    id="rem"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="rem" className="text-sm font-bold text-slate-600 cursor-pointer">تذكر بياناتي</label>
                </div>

                {authError && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center border border-red-100 font-bold">{authError}</div>}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-75"
                >
                  {authLoading ? <Loader2 className="animate-spin" size={24} /> : (authMode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />)}
                  <span>{authLoading ? 'جاري التحقق...' : (authMode === 'login' ? 'دخول للمنصة' : 'إنشاء حساب جديد')}</span>
                </button>
              </form>
            </div>

            <p className="text-center mt-12 text-slate-400 font-arabic text-sm">
              تم التطوير بواسطة <span className="text-slate-600 font-bold">Yousef Tech 🚀</span> <br />
              جميع الحقوق محفوظة {new Date().getFullYear()}
            </p>
          </div>
        </section>
      </div>
    );
  }


  // حالة استنفاد الرصيد أو انتظار التفعيل 
  const isActivated = currentUser?.activated === true || String(currentUser?.activated).toLowerCase() === 'true' || Number(currentUser?.activated) === 1;
  const hasCredits = currentUser?.credits !== undefined && Number(currentUser?.credits) > 0;

  if (!currentUser || isWelcoming) return null;

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 font-sans flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-2 left-0 bg-amber-400"></div>
            
            <div className="relative inline-block mx-auto mb-8">
              {/* Floating Hit Label */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap animate-float shadow-lg z-10">
                اضغط هنا لتحديث التفعيل 👇
              </div>
              
              <button
                onClick={handleCheckBalance}
                disabled={isCheckingBalance}
                title="انقر لتحديث الرصيد"
                className={`bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center shadow-md hover:bg-amber-200 transition-all focus:outline-none focus:ring-4 focus:ring-amber-200/50 cursor-pointer relative z-0 ${!isCheckingBalance ? 'animate-pulse-shadow' : ''}`}
              >
                <svg className={isCheckingBalance ? "animate-spin" : ""} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">لم يتم تفعيل حسابك بعد ⏳</h2>
            {checkBalanceResult && (
              <div className="bg-red-50 text-red-600 py-3 px-4 rounded-xl mb-6 text-sm font-bold border border-red-100 leading-relaxed shadow-sm">
                {checkBalanceResult}
              </div>
            )}
            <p className="text-gray-600 leading-relaxed mb-8">
              مرحباً <b>{currentUser.username}</b>،
              <br/>
              لقد حصلت على <b>رصيد (1) مجاني</b> كبداية، ولكن يجب تفعيل حسابك من قبل الإدارة قبل البدء.
              <br/><br/>
              <span className="text-sm opacity-70">سيتم التفعيل تلقائياً خلال وقت قصير، يرجى المحاولة لاحقاً.</span>
            </p>

            <div className="flex flex-col gap-3">
               <button
                 onClick={handleCheckBalance}
                 disabled={isCheckingBalance}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50"
               >
                 {isCheckingBalance ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                 {isCheckingBalance ? 'جاري التحقق...' : 'تحديث حالة التفعيل الآن'}
               </button>

               <button
                 onClick={handleLogOut}
                 className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                 <LogOut size={18} />
                 تسجيل خروج للعودة لاحقاً
               </button>
            </div>
        </div>
      </div>
    );
  }

  // الرصيد انتهى: نمنع فقط إذا كان المستخدم يحاول بدء بحث جديد (Step 1)
  if (!hasCredits && step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center" dir="rtl">
        <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700;800&display=swap'); .font-arabic { font-family: 'Tajawal', sans-serif; }" }} />
        <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full border border-indigo-100 relative overflow-hidden font-arabic">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
          
          <div className="bg-rose-50 text-rose-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <LogOut size={48} className="opacity-30 rotate-180" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-6">انتهى الرصيد المتاح 📊</h2>

          <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-lg border border-red-100 font-bold mb-8 leading-relaxed">
            لقد استنفدت كافة محاولاتك المجانية. يرجى شحن الرصيد لمتابعة أبحاثك الجديدة.
          </div>

          <p className="text-slate-500 mb-8 leading-relaxed">
            مرحباً <span className="text-indigo-600 font-bold">{currentUser.username}</span>، نحن سعداء بمساعدتك. 
            يمكنك شحن حسابك لفتح عدد غير محدود من الأبحاث الأكاديمية الجديدة.
          </p>

          <div className="flex flex-col gap-3">
             <button
               disabled
               className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl transition-all shadow-xl opacity-75"
             >
               تواصل معنا للشحن الآن 🚀
             </button>

             <button
               onClick={handleLogOut}
               className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg"
             >
               تسجيل خروج
             </button>
          </div>
        </div>
      </div>
    );
  }
  // ------------------------------------

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !department || !researchTitle) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    if (currentUser.activated === false) {
      setError('عذراً، لم يتم تفعيل حسابك بعد. يرجى الانتظار.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingMessage('جاري بناء خطة وعناوين البحث المتوقعة...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, department, researchTitle, stage: 'outline', username: currentUser.username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الاتصال بالخادم.');

      setOutlineText(data.text);
      setStep(2);
      
      // تحديث الرصيد في الواجهة فوراً
      if (data.newCredits !== undefined && data.newCredits !== null) {
        const updatedSession = { ...currentUser, credits: Number(data.newCredits) };
        setCurrentUser(updatedSession);
        localStorage.setItem('bt_user', JSON.stringify(updatedSession));
      }

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStartWriting = async () => {
    if (!outlineText.trim()) {
      setError('لا يمكن ترك خطة البحث فارغة.');
      return;
    }

    setStep(3);
    setIsLoading(true);
    setError('');
    setGeneratedContent('');
    setIsEditingContent(false);

    const stages = [
      { id: 'intro', text: 'جاري كتابة المقدمة والتمهيد...' },
      { id: 'body1', text: 'جاري كتابة الفصل الأول من البحث...' },
      { id: 'body2', text: 'جاري كتابة الفصل الثاني من البحث...' },
      { id: 'conclusion', text: 'جاري كتابة الخاتمة وتجميع المراجع...' }
    ];

    let fullContent = `## فهرس المحتويات\n\n${outlineText}\n\n---\n\n`;

    try {
      setGeneratedContent(fullContent);

      for (const stage of stages) {
        setLoadingMessage(stage.text);

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            studentName, 
            department, 
            researchTitle, 
            stage: stage.id,
            outlineContext: outlineText,
            username: currentUser.username // User required for debiting
          }),
        });

        const data = await res.json();
        
        if (!res.ok || data.error) throw new Error(data.error || 'فشل الاتصال بالخادم.');

        fullContent += (stage.id !== 'intro' ? '\n\n' : '') + data.text;
        setGeneratedContent(fullContent);
      }
    } catch (err: any) {
      // Return to step outline if failed at first stage to retry? Keep it simple.
      setError(err.message || 'حدث خطأ أثناء الكتابة.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const buildDocx = async () => {
    if (!generatedContent) return;

    const contentParagraphs = generatedContent.split('\n').map((line) => {
      if (line.startsWith('### ')) {
        return new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 120 },
        });
      }
      if (line.startsWith('## ')) {
        return new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 120 },
        });
      }
      if (line.startsWith('# ')) {
        return new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 120 },
        });
      }
      
      const textRuns: TextRun[] = [];
      const parts = line.split('**');
      parts.forEach((part, index) => {
        textRuns.push(new TextRun({ text: part, bold: index % 2 !== 0 }));
      });

      return new Paragraph({
        children: textRuns,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
      });
    });

    const doc = new Document({
      creator: studentName,
      title: researchTitle,
      sections: [
        {
          properties: {},
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: ["الصفحة ", PageNumber.CURRENT],
                      size: 24, // 12pt font
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({ text: "", spacing: { before: 2000 } }),
            new Paragraph({
              children: [new TextRun({ text: "البحث الأكاديمي", size: 48, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ text: researchTitle, size: 36, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 1000 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `إعداد الطالب: ${studentName}`, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `القسم: ${department}`, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `الشعبة: ${section}`, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `السنة الدراسية: ${academicYear}`, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `إشراف: أ.د. ممدوح محمد الحطاب`, size: 32, bold: true })],
              alignment: AlignmentType.CENTER,
              pageBreakBefore: false,
            }),
            new Paragraph({ text: "", pageBreakBefore: true }),
            
            // الفهرس المولد تلقائيا
            new TableOfContents("فهرس المحتويات الآلي", {
                hyperlink: true,
                headingStyleRange: "1-3",
            }),
            new Paragraph({ text: "", alignment: AlignmentType.CENTER, children: [new TextRun({text: "ملاحظة: لكي تعمل أرقام الصفحات بدقة في الوورد، اضغط بزر الفأرة الأيمن على الفهرس ثم اختر 'تحديث الحقل' (Update Field)." })] }),
            new Paragraph({ text: "", pageBreakBefore: true }),
            
            ...contentParagraphs,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${researchTitle}.docx`;
    a.click();
  };

  const exportToPdf = () => {
    // نعتمد الآن على خاصية الطباعة المدمجة في المتصفح التي تدعم كافة ميزات CSS الحديثة
    window.print();
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, idx) => {
      let styledLine = line.trim();
      if (!styledLine) return <br key={idx} />;

      // إزالة رموز الهاشتاج والنجوم من أجل نظافة النص
      styledLine = styledLine.replace(/[#*]/g, '').trim();

      // تمييز العناوين الرئيسية بناءً على الكلمات المفتاحية
      if (
        styledLine.startsWith('الفصل') || 
        styledLine.startsWith('المقدمة') || 
        styledLine.startsWith('الخاتمة') || 
        styledLine.startsWith('قائمة المراجع') ||
        styledLine.startsWith('الفهرس')
      ) {
        return <h1 key={idx}>{styledLine}</h1>;
      }
      
      // تمييز المباحث والعناوين الفرعية
      if (
        styledLine.startsWith('المبحث') || 
        styledLine.startsWith('تمهيد') || 
        styledLine.startsWith('أولاً') || 
        styledLine.startsWith('ثانياً') || 
        styledLine.startsWith('ثالثاً') ||
        styledLine.startsWith('رابعاً')
      ) {
        return <h2 key={idx}>{styledLine}</h2>;
      }

      // تمييز النقاط الفرعية المرقمة أو المصنفة
      if (/^(\d+[-.]|[أبجد]-)/.test(styledLine)) {
        return <h3 key={idx}>{styledLine}</h3>;
      }

      // الفقرات العادية
      return <p key={idx}>{styledLine}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 font-sans pb-20">
      <style dangerouslySetInnerHTML={{__html: "@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); .font-fancy { font-family: 'Dancing Script', cursive; letter-spacing: 1px; }" }} />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 relative">
        <button onClick={handleLogOut} title="تسجيل الخروج" className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors">
            <LogOut size={20} />
        </button>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex gap-2 items-center">
            <span>مرحباً، {currentUser.username}</span>
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs">{currentUser.credits} رصيد</span>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <FileText size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">B-bot للمقالات والأبحاث</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <AdBanner type="horizontal" />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-6 border border-gray-100">
            
            {/* Step 1: Form Inputs */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">بيانات البحث الأساسية</h2>
                <form onSubmit={handleGenerateOutline} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">اسم الطالب</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white ${studentName.toLowerCase() === currentUser.username.toLowerCase() || studentName.toLowerCase() === 'yousef' ? 'font-fancy text-2xl text-indigo-600' : 'text-gray-900'}`}
                      placeholder={currentUser.username}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">القسم / الكلية</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                      placeholder="تربية عام"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">الشعبة / التخصص</label>
                      <input
                        type="text"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                        placeholder="أساسي علوم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">السنة الدراسية</label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                        placeholder="2025 / 2026"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">عنوان البحث</label>
                    <textarea
                      value={researchTitle}
                      onChange={(e) => setResearchTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none min-h-[100px] resize-none bg-gray-50 focus:bg-white"
                      placeholder="تأثير الذكاء الاصطناعي على أمن المعلومات..."
                      required
                    />
                  </div>

                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-semibold">{error}</div>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                  >
                    {isLoading ? (
                      <><Loader2 className="animate-spin" size={20} /><span>{loadingMessage || 'جاري المعالجة...'}</span></>
                    ) : (
                      <><FileText size={20} /><span>توليد خطة البحث والعناوين</span></>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Outline Edit */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex gap-2 items-center border-b pb-3">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-indigo-600 focus:outline-none">
                    <ArrowRight size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">مراجعة خطة وعناوين البحث</h2>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-sm text-amber-800 font-semibold mb-2 text-center">
                    تنبيه: سيتم خصم (1) من رصيدك عند ضغط بدء الكتابة.
                </div>
                
                <textarea
                  value={outlineText}
                  onChange={(e) => setOutlineText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none min-h-[250px] resize-y bg-gray-50 focus:bg-white text-gray-800 leading-relaxed font-mono"
                  dir="auto"
                />

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

                <button
                  onClick={handleStartWriting}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                >
                  <CheckCircle size={20} />
                  <span>اعتماد الخطة وبدء كتابة البحث الفعلي</span>
                </button>
              </div>
            )}

            {/* Step 3: Generating/Result Options */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-3 text-right">تقدم البحث</h2>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-indigo-800 font-semibold">{loadingMessage}</p>
                    <p className="text-sm text-gray-500 max-w-[200px]">الرجاء الانتظار، جاري تسطير البحث والمباحث استناداً للخطّة.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <CheckCircle className="text-emerald-500" size={50} />
                    <p className="text-gray-800 font-bold text-lg">اكتمل البحث بنجاح!</p>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold underline mt-2"
                    >
                      كتابة بحث جديد
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
          
          <div className="hidden lg:block">
            <AdBanner type="square" />
          </div>
        </div>

        {/* Right Column - Result Content */}
        <div className="lg:col-span-8">
          {(step === 3 && generatedContent) ? (
            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 flex flex-col items-center border border-gray-100 overflow-hidden relative min-h-[600px]">
              
              {/* Action Toolbar */}
              <div className="w-full bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 no-print">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingContent(!isEditingContent)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                      isEditingContent 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    {isEditingContent ? <CheckCircle size={18} /> : <Edit3 size={18} />}
                    <span>{isEditingContent ? 'إنهاء التعديلات' : 'تعديل المحتوى يدوياً'}</span>
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={isLoading || isEditingContent || !siteConfig.enableAds ? "#" : AD_LINK}
                    target={!siteConfig.enableAds ? "_self" : "_blank"}
                    rel="noreferrer"
                    onClick={(e) => {
                      if (isLoading || isEditingContent) {
                        e.preventDefault();
                        return;
                      }
                      if (!siteConfig.enableAds) e.preventDefault();
                      buildDocx();
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-md ${
                      isLoading || isEditingContent 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                    }`}
                  >
                    <Download size={18} />
                    <span>تصدير Word</span>
                  </a>
                  
                  <a
                    href={isLoading || isEditingContent || !siteConfig.enableAds ? "#" : AD_LINK}
                    target={!siteConfig.enableAds ? "_self" : "_blank"}
                    rel="noreferrer"
                    onClick={(e) => {
                      if (isLoading || isEditingContent) {
                        e.preventDefault();
                        return;
                      }
                      if (!siteConfig.enableAds) e.preventDefault();
                      exportToPdf();
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-md ${
                      isLoading || isEditingContent 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    }`}
                  >
                    <FileOutput size={18} />
                    <span>تصدير PDF</span>
                  </a>
                </div>
              </div>

              {/* Editable Content OR Rendered Preview */}
              <div ref={printRef} className="w-full h-full flex flex-col flex-1 research-content">
                {isEditingContent ? (
                  <div className="p-6 h-full flex-1 min-h-[600px] no-print">
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-full min-h-[600px] p-4 border-2 border-indigo-200 rounded-xl focus:ring-0 focus:border-indigo-500 outline-none resize-y leading-relaxed text-gray-800"
                      dir="auto"
                    />
                  </div>
                ) : (
                  <div className="w-full px-8 py-10 md:px-14 md:py-16 bg-white min-h-[600px]">
                    {/* Cover Page */}
                    <div className="text-center mb-20 mt-6 min-h-[18cm] flex flex-col justify-center">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 leading-tight">
                        {researchTitle}
                      </h1>
                      <div className="text-xl md:text-2xl text-gray-700 mt-12 space-y-4">
                        <p>إعداد الطالب: <span className="font-bold">{studentName}</span></p>
                        <p>القسم: <span className="font-bold">{department}</span></p>
                        {section && <p>الشعبة: <span className="font-bold">{section}</span></p>}
                        {academicYear && <p>السنة الدراسية: <span className="font-bold">{academicYear}</span></p>}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-12 bg-gray-100 py-3 px-6 rounded-xl inline-block border-2 border-indigo-100 no-print-bg">
                        إشراف: أ.د. ممدوح محمد الحطاب
                      </div>
                    </div>

                    <div className="page-break border-b-2 border-gray-200 mb-16 no-print"></div>

                    <div className="text-justify text-lg pt-4 max-w-none text-gray-900 leading-loose">
                      {renderContent(generatedContent)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-stripes-indigo-50">
              <FileText size={64} className="mb-4 opacity-50 text-indigo-200" />
              {step === 2 ? (
                <>
                  <h3 className="text-xl font-bold text-gray-500 mb-2">خطة البحث جاهزة للمراجعة</h3>
                  <p className="max-w-sm">راجع الخطة في القائمة الجانبية وعدل ما تراه مناسباً، ثم انقر على "اعتماد الخطة".</p>  
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-500 mb-2">لا يوجد بحث جاهز</h3>
                  <p className="max-w-sm">قم بإدخال بياناتك وانقر على "توليد خطة البحث والعناوين" لتبدأ.</p>
                </>
              )}
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}
