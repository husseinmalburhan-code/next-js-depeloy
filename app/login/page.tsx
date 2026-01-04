'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('❌ اسم المستخدم أو كلمة المرور غير صحيحة');
      setLoading(false);
    } else {
      router.push('/'); // توجيه للرئيسية بعد النجاح
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* القسم الفني (صورة) - يختفي في الموبايل */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          {/* دوائر زخرفية في الخلفية */}
          <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 -top-20 -left-20"></div>
          <div className="absolute w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px] opacity-20 bottom-0 right-0"></div>
          
          <div className="relative z-10 text-center p-12 text-white">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <span className="text-5xl font-black">H</span>
            </div>
            <h2 className="text-4xl font-black mb-4">HR Master</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              نظامك المتكامل لإدارة الموارد البشرية، الرواتب، والحضور بذكاء وسهولة.
            </p>
          </div>
        </div>

        {/* نموذج الدخول */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
            
            <div className="mb-10 text-center md:text-right">
              <h1 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول 👋</h1>
              <p className="text-slate-500 font-medium">مرحباً بعودتك! الرجاء إدخال بياناتك</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-pulse text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-2 text-sm">اسم المستخدم</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="User ID"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">👤</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 text-sm">كلمة المرور</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔒</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-500 font-bold">تذكرني</span>
                </label>
                <a href="#" className="text-blue-600 font-bold hover:underline">نسيت كلمة المرور؟</a>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? 'جاري التحقق...' : 'دخول للنظام 🚀'}
              </button>

            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-xs font-bold">© 2025 HR Master System v1.0</p>
            </div>

        </div>

      </div>
    </div>
  );
}