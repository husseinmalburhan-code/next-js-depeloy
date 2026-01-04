'use client';

type HeaderProps = {
  toggleMobileMenu: () => void;
};

export default function Header({ toggleMobileMenu }: HeaderProps) {
  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between transition-all">
      
      <div className="flex items-center gap-4">
        {/* زر فتح القائمة (يظهر فقط بالموبايل) */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
        >
          ☰
        </button>

        <div className="hidden md:block">
          <h2 className="text-xl font-black text-slate-800">أهلاً بك، حسين 👋</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">نتمنى لك يوماً سعيداً في العمل</p>
        </div>
        <span className="md:hidden text-lg font-black text-slate-800">HR System</span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
         {/* التاريخ */}
         <div className="hidden md:flex flex-col items-end border-l pl-6 border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ</span>
            <span className="text-sm font-bold text-slate-700">{today}</span>
         </div>

         {/* التنبيهات */}
         <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all relative group border border-transparent hover:border-blue-100">
            🔔
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
         </button>
      </div>
    </header>
  );
}