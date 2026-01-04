'use client';

import { useState, useEffect } from 'react';

type AttendanceRecord = {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  status: string;
  employeeId: number;
  employee: {
    fullName: string;
    department: string;
    avatar: string;
    jobTitle: string;
  };
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleAction = async (type: 'check-in' | 'check-out') => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchAttendance();
        alert(data.message);
      } else {
        alert(data.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const stats = {
    present: records.filter(r => r.status === 'حاضر').length,
    late: records.filter(r => r.status === 'متأخر').length,
    absent: records.filter(r => r.status === 'غياب').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">سجل الحضور الذكي 🤳</h1>
          <p className="text-slate-500 mt-1 font-medium">تسجيل الدخول والانصراف بضغطة زر</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-slate-400 font-bold text-xs uppercase px-2">التاريخ:</span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border-none rounded-xl p-2 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button onClick={fetchAttendance} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg text-sm font-bold">
             تحديث 🔄
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="حضور منتظم" count={stats.present} total={records.length} color="bg-green-500" icon="✅" />
        <StatCard title="تأخير" count={stats.late} total={records.length} color="bg-orange-500" icon="⚠️" />
        <StatCard title="غياب" count={stats.absent} total={records.length} color="bg-red-500" icon="❌" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">الموظف</th>
                <th className="p-6 text-center">وقت الدخول</th>
                <th className="p-6 text-center">وقت الخروج</th>
                <th className="p-6 text-center">الساعات</th>
                <th className="p-6 text-center">الحالة</th>
                <th className="p-6 text-center">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-slate-400">لا توجد سجلات لهذا اليوم</td></tr>
              ) : records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <img 
                      src={record.employee?.avatar || `https://ui-avatars.com/api/?background=random&name=${record.employee?.fullName}`} 
                      className="w-12 h-12 rounded-2xl object-cover ring-4 ring-slate-50 border border-slate-100" 
                      alt="avatar"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{record.employee?.fullName}</p>
                      <p className="text-xs text-slate-400 font-medium">{record.employee?.department}</p>
                    </div>
                  </td>
                  
                  <td className="p-6 text-center">
                    {record.checkIn ? (
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{record.checkIn}</span>
                    ) : (
                      <span className="text-slate-300 text-sm">--:--</span>
                    )}
                  </td>
                  
                  <td className="p-6 text-center">
                    {record.checkOut ? (
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{record.checkOut}</span>
                    ) : (
                      <span className="text-slate-300 text-sm">--:--</span>
                    )}
                  </td>

                  <td className="p-6 text-center font-mono font-bold text-slate-800">
                       {record.workHours ? `${record.workHours}h` : '-'}
                  </td>

                  <td className="p-6 text-center">
                    <StatusBadge status={record.status} />
                  </td>

                  <td className="p-6 text-center">
                    {!record.checkIn ? (
                      <button 
                        onClick={() => handleAction('check-in')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg shadow-green-200 transition-all active:scale-95 w-32"
                      >
                        تسجيل دخول 🟢
                      </button>
                    ) : !record.checkOut ? (
                      <button 
                        onClick={() => handleAction('check-out')}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg shadow-red-200 transition-all active:scale-95 w-32"
                      >
                        انصراف 🔴
                      </button>
                    ) : (
                      <span className="text-green-600 font-black text-xs flex items-center justify-center gap-1 border border-green-200 bg-green-50 px-3 py-2 rounded-xl w-32 mx-auto">
                         تم الانتهاء ✅
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, count, total, color, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
       <div>
         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
         <h3 className="text-3xl font-black text-slate-800">{count}</h3>
       </div>
       <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-2xl`}>
         {icon}
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'حاضر': 'bg-green-100 text-green-700',
    'متأخر': 'bg-orange-100 text-orange-700',
    'غياب': 'bg-red-100 text-red-700',
    'إجازة': 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}