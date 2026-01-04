'use client';

import React from 'react';

type Props = {
  stats: any;
};

export const GeneralReport = React.forwardRef<HTMLDivElement, Props>(({ stats }, ref) => {
  return (
    // ✅ أزلنا أي كلاسات للإخفاء من هنا. جعلناها ورقة طبيعية.
    <div ref={ref} className="bg-white p-12 text-slate-900 font-[family-name:var(--font-cairo)] mx-auto" dir="rtl">
      
      {/* تنسيق الصفحة للطباعة لإخفاء هيدر المتصفح وضبط الحجم A4 */}
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; }
          /* إخفاء أي عناصر أخرى قد تظهر خطأً */
          .print-hidden { display: none !important; }
        `}
      </style>

      {/* حاوية المحتوى مع هوامش الطباعة */}
      <div className="p-4 max-w-4xl mx-auto h-full">

        {/* 1. الترويسة */}
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6 mb-10">
          <div>
             <h1 className="text-4xl font-black text-slate-900">تقرير الموارد البشرية</h1>
             <p className="text-slate-500 font-bold mt-2 text-lg">HR Master System - Enterprise</p>
          </div>
          <div className="text-left">
             <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                <p className="font-bold text-sm text-slate-500">تاريخ الإصدار</p>
                <p className="font-black text-xl text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
             </div>
          </div>
        </div>

        {/* 2. الملخص */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
            📊 ملخص الأداء
          </h2>
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500">إجمالي الموظفين</span>
                <p className="text-4xl font-black text-slate-900 mt-2">{stats.totalEmployees}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500">الموظفين النشطين</span>
                <p className="text-4xl font-black text-green-600 mt-2">{stats.activeEmployees}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500">طلبات الإجازة</span>
                <p className="text-4xl font-black text-orange-500 mt-2">{stats.pendingLeaves}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500">الأقسام</span>
                <p className="text-4xl font-black text-blue-600 mt-2">{stats.departments.length}</p>
             </div>
          </div>
        </div>

        {/* 3. الجدول */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
            🏢 توزيع الأقسام
          </h2>
          <table className="w-full text-right border border-slate-200 rounded-xl overflow-hidden">
             <thead className="bg-slate-900 text-white">
               <tr>
                 <th className="p-4 text-sm font-bold">القسم</th>
                 <th className="p-4 text-sm font-bold">عدد الموظفين</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {stats.departments.map((dept: any, index: number) => (
                 <tr key={index} className="even:bg-slate-50">
                   <td className="p-4 font-bold text-slate-800">{dept.department || 'غير محدد'}</td>
                   <td className="p-4 font-mono font-bold text-slate-600">{dept._count.id}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>

        {/* 4. التذييل */}
        <div className="mt-20 pt-8 border-t-2 border-slate-100 text-center">
           <p className="text-slate-400 font-bold text-sm mb-4">تم استخراج هذا التقرير آلياً من نظام HR Master</p>
           <div className="flex justify-between px-20 mt-12">
              <div className="text-center">
                 <p className="text-sm font-bold text-slate-900 mb-12">توقيع المسؤول</p>
                 <div className="w-32 border-b-2 border-slate-300"></div>
              </div>
              <div className="text-center">
                 <p className="text-sm font-bold text-slate-900 mb-12">ختم الشركة</p>
                 <div className="w-32 border-b-2 border-slate-300"></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
});

GeneralReport.displayName = 'GeneralReport';