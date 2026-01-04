'use client';

import { useState, useEffect, ChangeEvent } from 'react';

type Employee = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  gender: 'ذكر' | 'أنثى';
  birthDate: string;
  department: string;
  jobTitle: string;
  manager: string;
  hireDate: string;
  status: 'نشط' | 'إجازة' | 'مستقيل';
  salary: number;
  iban: string;
  bankName: string;
  avatar: string;
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // حالة الموظف المختار (للعرض أو الطباعة)
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  // حالات الفورم (للاضافة والتعديل)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({ 
    fullName: '', jobTitle: '', department: '', email: '', phone: '', address: '',
    gender: 'ذكر', status: 'نشط', salary: 0, hireDate: new Date().toISOString().split('T')[0],
    birthDate: '', manager: '', iban: '', bankName: '', avatar: ''
  });

  // 1. جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
        else setEmployees([]);
      } catch (error) { 
        console.error("Fetch error:", error);
        setEmployees([]); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  // دالة رفع الصورة
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 2 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // فتح فورم الإضافة
  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ 
      fullName: '', jobTitle: '', department: '', email: '', phone: '', address: '',
      gender: 'ذكر', status: 'نشط', salary: 0, hireDate: new Date().toISOString().split('T')[0],
      birthDate: '', manager: '', iban: '', bankName: '', avatar: ''
    });
    setIsFormOpen(true);
  };

  // فتح فورم التعديل
  const handleOpenEdit = (emp: Employee) => {
    setEditId(emp.id);
    setFormData(emp);
    setIsFormOpen(true);
  };

  // حذف موظف
  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        alert('تم حذف الموظف بنجاح');
      } else {
        alert('فشل الحذف');
      }
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  // حفظ البيانات (إضافة أو تعديل)
  const handleSave = async () => {
    if (!formData.fullName || !formData.jobTitle) return alert('يرجى كتابة الاسم والمسمى الوظيفي');
    
    try {
      const url = editId ? `/api/employees/${editId}` : '/api/employees';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedEmp = await response.json();
        if (editId) {
          setEmployees(employees.map(emp => emp.id === editId ? savedEmp : emp));
          alert('تم التعديل بنجاح! ✅');
        } else {
          setEmployees([savedEmp, ...employees]);
          alert('تمت الإضافة بنجاح! 🎉');
        }
        setIsFormOpen(false);
      } else {
        alert('فشل الحفظ');
      }
    } catch (error) {
      alert('خطأ في الاتصال');
    }
  };

  // 🖨️ دالة الطباعة السريعة من الجدول
  const handleQuickPrint = (emp: Employee) => {
    setSelectedEmp(emp); // تحميل بيانات الموظف في القالب
    // ننتظر لحظة صغيرة جداً حتى يتم رسم القالب في الخلفية ثم نطبع
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // فلترة الموظفين للبحث
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const filteredList = safeEmployees.filter(emp => {
    if (!searchTerm) return true;
    const normalize = (text: string) => (text || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    const term = normalize(searchTerm);
    const allData = normalize(`${emp.fullName} ${emp.email} ${emp.phone} ${emp.jobTitle} ${emp.department} ${emp.status} ${emp.address} ${emp.bankName} ${emp.manager}`);
    return allData.includes(term);
  });

  if (isLoading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse text-xl">جاري التحميل...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      
      {/* --------------------------------------------------------------- */}
      {/* القسم 1: رأس الصفحة والبحث (يظهر فقط في الشاشة) */}
      {/* --------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 gap-6">
        <div className="text-center lg:text-right w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">إدارة الموارد البشرية ✨</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">نظام إدارة الموظفين المتكامل</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <input 
              type="text" 
              placeholder="بحث ذكي (الاسم، القسم، الهاتف...)" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-80" 
            />
            <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 w-full sm:w-auto whitespace-nowrap">
              + إضافة موظف
            </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* القسم 2: الجدول (يظهر فقط في الشاشة) */}
      {/* --------------------------------------------------------------- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">الموظف</th>
                <th className="p-6 text-center">التواصل</th>
                <th className="p-6">الوظيفة</th>
                <th className="p-6 text-center">الحالة</th>
                <th className="p-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <img src={emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover ring-4 ring-slate-50 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm md:text-base">{emp.fullName}</p>
                      <p className="text-xs text-slate-400 font-medium">ID: #{emp.id}</p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                      <p className="text-sm font-bold text-slate-700">{emp.phone}</p>
                      <p className="text-[10px] text-slate-400">{emp.email}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-slate-700 text-sm">{emp.jobTitle}</p>
                    <p className="text-xs text-blue-500 font-bold">{emp.department}</p>
                  </td>
                  <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tighter ${emp.status === 'نشط' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {emp.status}
                      </span>
                  </td>
                  <td className="p-6 text-left">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedEmp(emp)} className="p-2 bg-slate-50 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all" title="عرض التفاصيل">👁️</button>
                      <button onClick={() => handleOpenEdit(emp)} className="p-2 bg-slate-50 hover:bg-orange-100 text-slate-400 hover:text-orange-600 rounded-xl transition-all" title="تعديل">✏️</button>
                      <button onClick={() => handleQuickPrint(emp)} className="p-2 bg-slate-50 hover:bg-purple-100 text-slate-400 hover:text-purple-600 rounded-xl transition-all" title="طباعة">🖨️</button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 bg-slate-50 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-xl transition-all" title="حذف">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* القسم 3: قالب الطباعة الرسمي (يظهر فقط عند الطباعة) 🖨️ */}
      {/* يحتوي على كلاس printable-card وكلاس hidden print:block */}
      {/* --------------------------------------------------------------- */}
      {selectedEmp && (
        <div className="hidden print:block printable-card bg-white w-full h-full absolute top-0 left-0 z-[9999] p-8">
          
          {/* رأس الصفحة الرسمي (أزرق مثل الفورم) */}
          <div className="flex justify-between items-center mb-8 border-b-4 border-blue-800 pb-4">
            <div>
               <h1 className="text-3xl font-black text-blue-800">استمارة بيانات موظف</h1>
               <p className="text-slate-500 mt-1 font-bold">HR Master Management System</p>
            </div>
            <div className="text-left">
               <h2 className="text-2xl font-bold text-slate-900">{selectedEmp.fullName}</h2>
               <p className="text-slate-500 font-mono font-bold">Ref: #{selectedEmp.id}</p>
            </div>
          </div>

          <div className="space-y-8 px-2">
            
            {/* 1. القسم الشخصي */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <h3 className="text-lg font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">📸 المعلومات الشخصية</h3>
                <div className="flex gap-8 items-start">
                   <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-sm bg-slate-200 shrink-0">
                      <img src={selectedEmp.avatar || "https://placehold.co/400?text=Photo"} className="w-full h-full object-cover" />
                   </div>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                      <PrintItem label="الاسم الكامل" value={selectedEmp.fullName} />
                      <PrintItem label="الجنس" value={selectedEmp.gender} />
                      <PrintItem label="تاريخ الميلاد" value={selectedEmp.birthDate} />
                      <PrintItem label="رقم الهاتف" value={selectedEmp.phone} />
                      <div className="col-span-2">
                        <PrintItem label="العنوان" value={selectedEmp.address} />
                      </div>
                      <div className="col-span-2">
                        <PrintItem label="البريد الإلكتروني" value={selectedEmp.email} />
                      </div>
                   </div>
                </div>
            </div>

            {/* 2. قسم الوظيفة والمالية */}
            <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">💼 بيانات الوظيفة</h3>
                    <div className="space-y-4">
                        <PrintItem label="المسمى الوظيفي" value={selectedEmp.jobTitle} />
                        <PrintItem label="القسم" value={selectedEmp.department} />
                        <PrintItem label="المدير المباشر" value={selectedEmp.manager} />
                        <div className="grid grid-cols-2 gap-4">
                           <PrintItem label="تاريخ التعيين" value={selectedEmp.hireDate} />
                           <PrintItem label="الحالة" value={selectedEmp.status} highlight />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">💰 البيانات المالية</h3>
                    <div className="space-y-4">
                        <PrintItem label="الراتب الأساسي" value={`$${selectedEmp.salary}`} isBig />
                        <PrintItem label="اسم البنك" value={selectedEmp.bankName} />
                        <PrintItem label="رقم الآيبان (IBAN)" value={selectedEmp.iban} isMono />
                    </div>
                </div>
            </div>

            {/* ذيل الصفحة (التوقيع) */}
            <div className="mt-12 pt-8 border-t-2 border-slate-200 flex justify-between items-end text-sm text-slate-500">
               <div>
                  <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>تم استخراج هذه الوثيقة آلياً من النظام.</p>
               </div>
               <div className="text-center">
                  <p className="mb-12 font-bold text-slate-900 text-base">يعتمد / المدير العام</p>
                  <div className="w-48 h-0.5 bg-slate-400"></div>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* القسم 4: مودال العرض (للشاشة فقط) */}
      {/* يحتوي على كلاس no-print ليختفي عند الطباعة */}
      {/* --------------------------------------------------------------- */}
      {selectedEmp && (
         <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedEmp(null)}>
            <div className="bg-white w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto" onClick={e => e.stopPropagation()}>
                
                <div className="h-32 md:h-48 bg-gradient-to-r from-slate-800 to-blue-900 relative">
                   <button onClick={() => setSelectedEmp(null)} className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-10 transition-colors">✕</button>
                   {/* زر طباعة إضافي داخل المودال */}
                   <button onClick={() => handleQuickPrint(selectedEmp)} className="absolute top-4 right-4 md:top-6 md:right-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 backdrop-blur-sm transition-all z-10 font-bold border border-white/10 hover:border-white/30">
                     <span>🖨️</span> <span className="hidden md:inline">طباعة</span>
                   </button>
                   <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="px-6 pb-6 md:px-12 md:pb-12 relative">
                  <div className="relative -top-12 md:-top-20 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 mb-[-1rem] md:mb-[-3rem]">
                    <img src={selectedEmp.avatar || `https://i.pravatar.cc/150?u=${selectedEmp.id}`} className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] border-[6px] md:border-[8px] border-white shadow-2xl object-cover bg-white" />
                    <div className="mb-6 flex-1 text-center md:text-right w-full">
                      <div className="flex justify-center md:justify-start items-center gap-3 mb-2">
                         <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-wide ${selectedEmp.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedEmp.status}</span>
                         <span className="text-slate-400 text-xs font-bold">#{selectedEmp.id}</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-1">{selectedEmp.fullName}</h2>
                      <p className="text-blue-600 font-bold text-lg md:text-xl">{selectedEmp.jobTitle}</p>
                    </div>
                  </div>
                  {/* ... باقي تفاصيل مودال العرض ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-16">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                      <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">👤 المعلومات الشخصية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                        <DetailItem label="الجنس" value={selectedEmp.gender} />
                        <DetailItem label="تاريخ الميلاد" value={selectedEmp.birthDate} />
                        <DetailItem label="رقم الهاتف" value={selectedEmp.phone} />
                        <DetailItem label="العنوان" value={selectedEmp.address} />
                        <div className="sm:col-span-2"><DetailItem label="البريد الالكتروني" value={selectedEmp.email} /></div>
                      </div>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                           <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">💼 تفاصيل العمل</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                             <DetailItem label="القسم" value={selectedEmp.department} />
                             <DetailItem label="المدير المباشر" value={selectedEmp.manager} />
                             <DetailItem label="تاريخ التعيين" value={selectedEmp.hireDate} />
                           </div>
                        </div>
                        <div className="bg-blue-50 p-6 md:p-8 rounded-[2rem] border border-blue-100">
                           <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">💰 البيانات المالية</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                             <DetailItem label="الراتب الشهري" value={`$${selectedEmp.salary}`} />
                             <DetailItem label="البنك" value={selectedEmp.bankName} />
                             <div className="sm:col-span-2"><DetailItem label="IBAN" value={selectedEmp.iban} isMono /></div>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
         </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* القسم 5: مودال الفورم (إضافة / تعديل) */}
      {/* --------------------------------------------------------------- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] md:max-h-[95vh]">
            <div className={`p-6 md:p-8 ${editId ? 'bg-orange-600' : 'bg-blue-600'} text-white flex justify-between items-center flex-shrink-0`}>
              <h2 className="text-xl md:text-2xl font-black">{editId ? '✏️ تعديل بيانات' : '🆕 إضافة موظف جديد'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-3xl">✕</button>
            </div>
            
            <div className="p-6 md:p-12 overflow-y-auto space-y-6 md:space-y-10">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">📸 الصورة والمعلومات الشخصية</h3>
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-3 flex flex-col items-center gap-4">
                         <div className="relative group cursor-pointer w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200">
                            <img src={formData.avatar || "https://placehold.co/400?text=Photo"} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-white font-bold text-xs">تغيير</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                      </div>
                      <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                          <InputItem label="الاسم الكامل" value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} />
                          <SelectItem label="الجنس" value={formData.gender} options={['ذكر', 'أنثى']} onChange={v => setFormData({...formData, gender: v as any})} />
                          <InputItem label="تاريخ الميلاد" type="date" value={formData.birthDate} onChange={v => setFormData({...formData, birthDate: v})} />
                          <InputItem label="العنوان" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                          <InputItem label="الهاتف" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                          <InputItem label="الايميل" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <h3 className="text-lg font-bold text-slate-800 mb-4">💼 الوظيفة</h3>
                       <div className="space-y-4">
                          <InputItem label="المسمى الوظيفي" value={formData.jobTitle} onChange={v => setFormData({...formData, jobTitle: v})} />
                          <InputItem label="القسم" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                          <InputItem label="المدير المباشر" value={formData.manager} onChange={v => setFormData({...formData, manager: v})} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <InputItem label="تاريخ التعيين" type="date" value={formData.hireDate} onChange={v => setFormData({...formData, hireDate: v})} />
                             <SelectItem label="الحالة" value={formData.status} options={['نشط', 'إجازة', 'مستقيل']} onChange={v => setFormData({...formData, status: v as any})} />
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <h3 className="text-lg font-bold text-slate-800 mb-4">💰 المالية</h3>
                       <div className="space-y-4">
                          <InputItem label="الراتب الشهري ($)" type="number" value={formData.salary} onChange={v => setFormData({...formData, salary: Number(v)})} />
                          <InputItem label="اسم البنك" value={formData.bankName} onChange={v => setFormData({...formData, bankName: v})} />
                          <InputItem label="IBAN" value={formData.iban} onChange={v => setFormData({...formData, iban: v})} />
                       </div>
                    </div>
                </div>
            </div>
            
            <div className="p-6 md:p-8 bg-slate-50 flex flex-col sm:flex-row gap-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={handleSave} className="flex-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl w-full sm:w-auto">
                 {editId ? 'حفظ التعديلات' : 'إضافة الموظف'}
              </button>
              <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-white text-slate-500 py-4 rounded-2xl font-bold border border-slate-200 w-full sm:w-auto">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// المكونات الفرعية (Sub-components)
// ----------------------------------------------------

// عنصر الطباعة (للنموذج الرسمي)
function PrintItem({ label, value, isMono, isBig, highlight }: any) {
  return (
    <div className="border-b border-slate-100 last:border-0 pb-2">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <p className={`font-bold text-slate-900 
        ${isMono ? 'font-mono tracking-widest' : ''} 
        ${isBig ? 'text-2xl text-blue-700' : 'text-base'}
        ${highlight ? 'inline-block bg-green-100 text-green-700 px-3 py-0.5 rounded-lg text-sm' : ''}
      `}>
        {value || '---'}
      </p>
    </div>
  );
}

// عنصر العرض (للمودال)
function DetailItem({ label, value, isMono = false }: { label: string, value: any, isMono?: boolean }) {
  const displayValue = (value !== null && value !== undefined && value !== '') ? value : '---';
  return (
    <div className="break-words">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-tighter">{label}</p>
      <p className={`text-sm font-bold text-slate-700 ${isMono ? 'font-mono' : ''}`}>{displayValue}</p>
    </div>
  );
}

// حقل إدخال (للفورم)
function InputItem({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">{label}</label>
      <input 
        type={type} 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-bold text-slate-700 transition-all shadow-sm w-full" 
      />
    </div>
  );
}

// قائمة منسدلة (للفورم)
function SelectItem({ label, value, options, onChange }: { label: string, value: any, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">{label}</label>
      <div className="relative">
          <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
      </div>
    </div>
  );
}