'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // قائمة الموظفين
  const [loading, setLoading] = useState(true);
  
  // بيانات النموذج
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'مسؤول' });

  // جلب البيانات (المستخدمين + الموظفين)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, empRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/employees')
      ]);
      
      const usersData = await usersRes.json();
      const empData = await empRes.json();

      setUsers(usersData);
      setEmployees(empData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return alert('املأ جميع الحقول');

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('تمت إضافة المستخدم بنجاح! 🎉');
      setFormData({ name: '', username: '', password: '', role: 'مسؤول' }); // تصفير
      fetchData(); // تحديث القائمة
    } else {
      const err = await res.json();
      alert('خطأ: ' + err.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      
      {/* زر الرجوع */}
      <div className="flex items-center gap-4">
         <Link href="/settings" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-slate-500">
           ➡️
         </Link>
         <div>
            <h1 className="text-2xl font-black text-slate-900">إدارة المستخدمين 👤</h1>
            <p className="text-slate-500 text-sm font-medium">ربط الموظفين بحسابات دخول للنظام</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* فورم الإضافة */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl sticky top-8">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               👤 إضافة حساب جديد
             </h2>
             <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* ✅ التغيير هنا: قائمة منسدلة بأسماء الموظفين */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">اختر الموظف</label>
                  <select 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">اختر من القائمة...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName} - {emp.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">اسم المستخدم (للدخول)</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="مثال: ali_ahmed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">كلمة المرور</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">الصلاحية</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="مسؤول">مسؤول (Admin)</option>
                    <option value="مشرف">مشرف (Supervisor)</option>
                    <option value="موظف">موظف (Employee)</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 mt-4">
                  + إنشاء الحساب
                </button>
             </form>
          </div>
        </div>

        {/* الجدول */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">📋 المستخدمين الحاليين</h3>
               <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{users.length} مستخدم</span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-right">
                 <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <tr>
                     <th className="p-6">الموظف</th>
                     <th className="p-6">User ID</th>
                     <th className="p-6">الصلاحية</th>
                     <th className="p-6 text-left">إجراء</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {loading ? (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-400">جاري التحميل...</td></tr>
                   ) : users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-6 font-bold text-slate-800">{user.name}</td>
                       <td className="p-6 font-mono text-slate-500 bg-slate-50 rounded px-2 w-fit">{user.username}</td>
                       <td className="p-6">
                         <span className={`px-3 py-1 rounded-lg text-xs font-bold 
                           ${user.role === 'مسؤول' ? 'bg-purple-100 text-purple-700' : 
                             user.role === 'مشرف' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                           {user.role}
                         </span>
                       </td>
                       <td className="p-6 text-left">
                         <button 
                           onClick={() => handleDelete(user.id)}
                           className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all"
                           title="حذف الحساب"
                         >
                           🗑️
                         </button>
                       </td>
                     </tr>
                   ))}
                   {users.length === 0 && !loading && (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد مستخدمين بعد. أضف أول مستخدم!</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}