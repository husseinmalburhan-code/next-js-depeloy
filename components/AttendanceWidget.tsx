'use client';

import { useState, useEffect } from 'react';

export default function AttendanceWidget() {
  const [status, setStatus] = useState<any>(null); // null, 'checked-in', 'checked-out', 'none'
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // ساعة رقمية تتحرك
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // جلب الحالة عند فتح الصفحة
  const checkStatus = async () => {
    const res = await fetch('/api/attendance/check');
    const data = await res.json();
    
    if (data.checkOut) setStatus('checked-out');
    else if (data.checkIn) setStatus('checked-in');
    else setStatus('none');
    
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    const res = await fetch('/api/attendance/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      checkStatus(); // تحديث الحالة
    } else {
      alert(data.error);
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-slate-100 rounded-3xl"></div>;

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* خلفية جمالية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-black mb-1">سجل دوامك ⏱️</h2>
           <p className="text-slate-400 font-medium text-sm">التوقيت الحالي: <span className="text-white font-mono font-bold">{currentTime}</span></p>
        </div>

        <div>
          {status === 'none' && (
            <button 
              onClick={() => handleAction('check-in')}
              className="bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              🟢 تسجيل دخول
            </button>
          )}

          {status === 'checked-in' && (
            <button 
              onClick={() => handleAction('check-out')}
              className="bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              🔴 تسجيل خروج
            </button>
          )}

          {status === 'checked-out' && (
            <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700 text-center">
              <span className="text-2xl">😴</span>
              <p className="text-xs font-bold text-slate-400 mt-1">انتهى دوامك لليوم</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}