'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function LeavesPage() {
  const { data: session } = useSession();
  const role = session?.user?.email || 'موظف';
  const userName = session?.user?.name || ''; // اسم المستخدم المسجل حالياً
  
  // هل هو مدير؟
  const isManager = role === 'مسؤول' || role === 'مشرف';

  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // البحث عن "ID" الموظف الخاص بالمستخدم الحالي
  // (نبحث في قائمة الموظفين عن شخص يحمل نفس اسم المستخدم المسجل)
  const currentEmployee = employees.find(emp => emp.fullName === userName);

  // تصفية الإجازات: إذا مدير يشوف الكل، وإذا موظف يشوف بس حقه
  const filteredLeaves = isManager 
    ? leaves 
    : leaves.filter(leave => leave.employee.fullName === userName);

  const [formData, setFormData] = useState({
    employeeId: '', type: 'إجازة سنوية', startDate: '', endDate: '', reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, empRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees')
      ]);
      
      const leavesData = await leavesRes.json();
      const empData = await empRes.json();

      setLeaves(leavesData);
      setEmployees(empData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة لفتح المودال وتجهيزه
  const openModal = () => {
    // إذا كان موظف عادي، نحدد اسمه تلقائياً
    if (!isManager && currentEmployee) {
      setFormData(prev => ({ ...prev, employeeId: currentEmployee.id.toString() }));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.startDate || !formData.endDate) return alert('يرجى ملء البيانات المطلوبة');

    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('تم تقديم الطلب بنجاح ✅');
      setIsModalOpen(false);
      setFormData({ employeeId: '', type: 'إجازة سنوية', startDate: '', endDate: '', reason: '' });
      fetchData(); 
    } else {
      alert('حدث خطأ أثناء التقديم');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if(!confirm(`هل أنت متأكد من ${status === 'مقبول' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return;

    const res = await fetch('/api/leaves', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });

    if (res.ok) {
      fetchData(); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الإجازات 🏖️</h1>
          <p className="text-slate-500 mt-1 font-medium">متابعة طلبات الموظفين والموافقات</p>
        </div>
        
        <button 
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 w-full md:w-auto"
        >
          + طلب إجازة جديد
        </button>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">الموظف</th>
                <th className="p-6">نوع الإجازة</th>
                <th className="p-6">التاريخ والمدة</th>
                <th className="p-6">السبب</th>
                <th className="p-6 text-center">الحالة</th>
                {isManager && <th className="p-6 text-left">قرار الإدارة</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">جاري تحميل الطلبات...</td></tr>
              ) : filteredLeaves.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-slate-400">
                   {isManager ? "لا توجد طلبات إجازة حالياً" : "لا توجد لديك طلبات إجازة سابقة"}
                 </td></tr>
              ) : filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <img 
                      src={leave.employee?.avatar || "https://ui-avatars.com/api/?background=random&name=" + leave.employee?.fullName} 
                      className="w-12 h-12 rounded-2xl object-cover ring-4 ring-slate-50 border border-slate-200" 
                    />
                    <div>
                      <p className="font-bold text-slate-900">{leave.employee?.fullName}</p>
                      <p className="text-xs text-slate-400 font-medium">{leave.employee?.jobTitle}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">{leave.type}</span>
                  </td>
                  <td className="p-6 text-sm">
                    <div className="flex flex-col gap-1 font-bold">
                      <span className="text-slate-500">من: <span className="text-slate-900">{leave.startDate}</span></span>
                      <span className="text-slate-500">إلى: <span className="text-slate-900">{leave.endDate}</span></span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-500 max-w-xs truncate font-medium">{leave.reason || '---'}</td>
                  <td className="p-6 text-center">
                    <StatusBadge status={leave.status} />
                  </td>

                  {isManager && (
                    <td className="p-6 text-left">
                      {leave.status === 'قيد المراجعة' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => updateStatus(leave.id, 'مقبول')} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm">قبول ✅</button>
                          <button onClick={() => updateStatus(leave.id, 'مرفوض')} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm">رفض ❌</button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs font-bold px-2">تم اتخاذ القرار</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال تقديم الطلب */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-slate-900">📝 طلب إجازة جديد</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">الموظف صاحب الطلب</label>
                    <select 
                      value={formData.employeeId} 
                      onChange={e => setFormData({...formData, employeeId: e.target.value})}
                      // ✅ قفل القائمة إذا كان المستخدم موظفاً عادياً
                      disabled={!isManager} 
                      className={`w-full p-4 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 transition-all ${!isManager ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 focus:border-blue-500'}`}
                    >
                      <option value="">اختر الموظف...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                      ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">تاريخ البدء</label>
                      <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">تاريخ العودة</label>
                      <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-500 transition-all" />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">نوع الإجازة</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-blue-500 transition-all">
                       <option value="إجازة سنوية">إجازة سنوية 🏖️</option>
                       <option value="إجازة مرضية">إجازة مرضية 🤒</option>
                       <option value="إجازة طارئة">إجازة طارئة 🚨</option>
                       <option value="إجازة بدون راتب">إجازة بدون راتب 💸</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">السبب (اختياري)</label>
                    <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none border border-slate-200 h-24 resize-none focus:border-blue-500 transition-all" placeholder="أذكر سبب الإجازة..." />
                 </div>

                 <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95">تقديم الطلب</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'قيد المراجعة': 'bg-orange-100 text-orange-600 border border-orange-200',
    'مقبول': 'bg-green-100 text-green-600 border border-green-200',
    'مرفوض': 'bg-red-100 text-red-600 border border-red-200',
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide ${styles[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}