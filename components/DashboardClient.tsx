'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSession } from 'next-auth/react';
import { GeneralReport } from './GeneralReport'; 
import AttendanceWidget from './AttendanceWidget'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

type Props = {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    departments: any[];
    pendingLeaves: number;
    pendingLeavesList: any[];
  }
};

export default function DashboardClient({ stats }: Props) {
  
  const { data: session } = useSession();

  // ✅ التعديل هنا:
  // صرنا نقبل "مسؤول" (بالعربي) أو "ADMIN" (بالإنجليزي)
  const isAdmin = session?.user?.email === 'مسؤول' || session?.user?.email === 'ADMIN';

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `HR-Report-${new Date().toISOString().slice(0,10)}`,
  });

  const chartData = stats.departments.map(dept => ({
    name: dept.department || 'غير محدد',
    count: dept._count.id
  }));

  return (
    <div className="space-y-8">

      {/* 1. ويدجت الحضور */}
      <AttendanceWidget />

      {/* 2. التقرير المخفي */}
      <div className="absolute top-0 left-0 w-full opacity-0 pointer-events-none -z-50 h-0 overflow-hidden">
         <div className="w-[210mm]">
            <GeneralReport ref={componentRef} stats={stats} />
         </div>
      </div>

      {/* 3. الترويسة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة 📊</h1>
          <p className="text-slate-500 mt-1 font-medium">أهلاً بك، {session?.user?.name || 'زائر'}</p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => handlePrint && handlePrint()}
             className="bg-white text-slate-700 px-5 py-3 rounded-2xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-sm flex items-center gap-2"
           >
             📄 تصدير تقرير PDF
           </button>

           <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 text-sm">
             + إجراء سريع
           </button>
        </div>
      </div>
      
      {/* 4. الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الموظفين" value={stats.totalEmployees} icon="👥" color="bg-blue-500" subtext="المسجلين في النظام" />
        <StatCard title="الموظفين النشطين" value={stats.activeEmployees} icon="⚡" color="bg-green-500" subtext="على رأس عملهم حالياً" />
        <StatCard title="متوسط الرواتب" value="$1,250" icon="💰" color="bg-purple-500" subtext="تقديري لهذا الشهر" />
        <StatCard title="طلبات الإجازة" value={stats.pendingLeaves} icon="📝" color="bg-orange-500" subtext="بانتظار الموافقة" />
      </div>

      {/* 5. الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">🏢 توزيع الموظفين حسب الأقسام</h3>
           <div className="h-72 w-full" dir="ltr">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
           <h3 className="text-lg font-bold text-slate-800 mb-2 self-start w-full">📈 حالة الموظفين</h3>
           <div className="h-64 w-full relative" dir="ltr">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={[{ name: 'نشط', value: stats.activeEmployees }, { name: 'غير نشط', value: stats.totalEmployees - stats.activeEmployees }]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                   <Cell fill="#10b981" />
                   <Cell fill="#cbd5e1" />
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{stats.activeEmployees}</span>
                <span className="text-sm text-slate-400 font-bold mt-1">نشط</span>
             </div>
           </div>
        </div>
      </div>

      {/* ✅ 6. جدول الإجازات (يظهر الآن إذا كنت "مسؤول") */}
      {isAdmin && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-orange-100 p-2 rounded-xl text-orange-600">⏳</div>
               <h3 className="text-xl font-bold text-slate-800">طلبات الإجازة المعلقة</h3>
             </div>
             
             {stats.pendingLeaves > 0 && (
               <a href="/leaves" className="text-blue-600 text-sm font-bold hover:underline bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                 عرض وإدارة الطلبات ⬅️
               </a>
             )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-6">الموظف</th>
                  <th className="p-6">نوع الإجازة</th>
                  <th className="p-6">تاريخ البدء</th>
                  <th className="p-6">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                 {stats.pendingLeavesList.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="p-12 text-center flex flex-col items-center justify-center gap-2">
                       <span className="text-4xl">🎉</span>
                       <span className="text-slate-400 font-medium">لا توجد طلبات معلقة، كل شيء تمام!</span>
                     </td>
                   </tr>
                 ) : (
                   stats.pendingLeavesList.map((leave: any) => (
                     <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                        <td className="p-6 flex items-center gap-4">
                           <img 
                             src={leave.employee?.avatar || "https://ui-avatars.com/api/?background=random&name=" + leave.employee?.fullName} 
                             className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm group-hover:scale-110 transition-transform"
                             alt="Avatar"
                           />
                           <span className="text-slate-900 group-hover:text-blue-600 transition-colors">
                             {leave.employee?.fullName}
                           </span>
                        </td>
                        <td className="p-6">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                            {leave.type}
                          </span>
                        </td>
                        <td className="p-6 text-slate-500 font-mono text-xs">
                           {leave.startDate}
                        </td>
                        <td className="p-6">
                          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 w-fit font-bold">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            قيد المراجعة
                          </span>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// الكارت
function StatCard({ title, value, icon, color, subtext }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {icon}
             </div>
             <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${color} opacity-40`}></div>
                <div className={`w-1.5 h-1.5 rounded-full ${color} opacity-20`}></div>
             </div>
          </div>
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">{title}</h3>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
          <p className="text-slate-400 text-[11px] mt-2 font-bold opacity-70">{subtext}</p>
       </div>
       <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity duration-500`}></div>
    </div>
  );
}