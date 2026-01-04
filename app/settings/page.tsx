'use client';

import Link from 'next/link';

export default function SettingsHubPage() {
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      
      {/* الهيدر */}
      <div className="text-center md:text-right mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">الإعدادات العامة ⚙️</h1>
        <p className="text-slate-500 mt-2 font-medium">تحكم في جميع خصائص النظام من مكان واحد</p>
      </div>

      {/* شبكة البوكسات (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* 1. بوكس المستخدمين (القسم الذي أنشأناه) */}
        <SettingsCard 
          title="إدارة المستخدمين"
          description="إضافة وحذف المستخدمين وتحديد الصلاحيات وكلمات المرور."
          icon="👤"
          color="bg-blue-500"
          href="/settings/users"
        />

        {/* 2. بوكس إعدادات النظام (مثال مستقبلي) */}
        <SettingsCard 
          title="إعدادات الشركة"
          description="تغيير اسم الشركة، الشعار، ومعلومات التواصل في الفواتير."
          icon="🏢"
          color="bg-purple-500"
          href="#"
          isComingSoon
        />

        {/* 3. بوكس النسخ الاحتياطي (مثال مستقبلي) */}
        <SettingsCard 
          title="النسخ الاحتياطي"
          description="تحميل نسخة احتياطية من قاعدة البيانات وحفظها بأمان."
          icon="💾"
          color="bg-green-500"
          href="#"
          isComingSoon
        />

        {/* 4. بوكس الإشعارات (مثال مستقبلي) */}
        <SettingsCard 
          title="نظام الإشعارات"
          description="تخصيص رسائل التنبيهات والبريد الإلكتروني التلقائي."
          icon="🔔"
          color="bg-orange-500"
          href="#"
          isComingSoon
        />

      </div>
    </div>
  );
}

// --- مكون البوكس (Card Component) ---
function SettingsCard({ title, description, icon, color, href, isComingSoon }: any) {
  const Component = isComingSoon ? 'div' : Link; // إذا قريباً نلغي الرابط
  
  return (
    <Component 
      href={href}
      className={`
        relative group overflow-hidden bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block
        ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* خلفية جمالية عند التحويم */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500`}></div>

      {/* الأيقونة */}
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      {/* النصوص */}
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {description}
      </p>

      {/* بادج "قريباً" */}
      {isComingSoon && (
        <span className="absolute top-4 left-4 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
          قريباً
        </span>
      )}

      {/* سهم التوجيه */}
      {!isComingSoon && (
        <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-blue-500 text-xl">
          ⬅️
        </div>
      )}
    </Component>
  );
}