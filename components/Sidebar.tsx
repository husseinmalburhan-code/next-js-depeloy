'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

type SidebarProps = {
  isOpen: boolean;
  closeMobileMenu: () => void;
};

export default function Sidebar({ isOpen, closeMobileMenu }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession(); 
  
  // استخراج الصلاحية
  const role = session?.user?.email || 'موظف'; 

  // دالة مساعدة لإنشاء الروابط
  const SidebarLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href}
        onClick={closeMobileMenu}
        className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
        }`}
      >
        <span className={`ml-3 text-xl relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>
          {icon}
        </span>
        <span className={`text-sm font-bold relative z-10 ${isActive ? '' : 'font-medium'}`}>
          {label}
        </span>
        {!isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
      </Link>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobileMenu}
      />

      <aside className={`
        fixed md:sticky top-0 right-0 h-screen w-72 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-40 
        transition-transform duration-300 ease-in-out border-l border-slate-800
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* اللوجو */}
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 bg-slate-900/50">
          <div className="w-10 h-10 rounded-xl ml-3 bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">H</div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block">HR<span className="text-blue-500">Master</span></span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">نظام الإدارة الذكي</span>
          </div>
        </div>

        {/* الروابط */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          
          {/* 1. قسم للجميع */}
          <p className="text-[10px] font-black text-slate-500 px-4 mb-2 uppercase tracking-widest opacity-70">الرئيسية</p>
          <SidebarLink href="/" icon="📊" label="لوحة التحكم" />
          
          {/* 2. قسم الإدارة (فقط للمسؤول والمشرف) */}
          {(role === 'مسؤول' || role === 'مشرف') && (
            <>
              <SidebarLink href="/employees" icon="👥" label="الموظفين" />
              
              <p className="text-[10px] font-black text-slate-500 px-4 mb-2 mt-6 uppercase tracking-widest opacity-70">الإدارة والمالية</p>
              <SidebarLink href="/attendance" icon="📅" label="الحضور والانصراف" />
              <SidebarLink href="/payroll" icon="💳" label="الرواتب" />
              {/* ✅ تمت الإضافة هنا */}
              <SidebarLink href="/custody" icon="💼" label="الذمة الشخصية" />
            </>
          )}

          {/* 3. الإجازات */}
          <SidebarLink href="/leaves" icon="🏖️" label="الإجازات" />
          
          {/* 4. قسم النظام (فقط للمسؤول) */}
          {role === 'مسؤول' && (
            <>
              <p className="text-[10px] font-black text-slate-500 px-4 mb-2 mt-6 uppercase tracking-widest opacity-70">النظام</p>
              <SidebarLink href="/settings" icon="⚙️" label="الإعدادات" />
            </>
          )}

        </nav>

        {/* كارت المستخدم */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <div className="bg-slate-800/50 rounded-2xl p-3 flex items-center mb-3 border border-slate-700/50">
              <img src={session?.user?.image || "https://i.pravatar.cc/150?img=11"} className="w-10 h-10 rounded-full border-2 border-slate-600 ml-3" />
              <div>
                  <p className="text-white font-bold text-sm">{session?.user?.name || "زائر"}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> 
                     {role} 
                  </p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              تسجيل الخروج ⬅️
            </button>
        </div>
      </aside>
    </>
  );
}