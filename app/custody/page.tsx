'use client';

import { useState, useEffect } from 'react';

type CustodyItem = {
  id: number;
  itemName: string;
  description: string;
  serialNumber: string;
  status: string;
  receivedDate: string;
  returnedDate: string | null;
  employeeId: number;
  employee: {
    id: number;
    fullName: string;
    avatar: string;
    department: string;
    jobTitle: string;
  };
};

type Employee = {
  id: number;
  fullName: string;
};

export default function CustodyPage() {
  const [items, setItems] = useState<CustodyItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔍 حالة البحث
  const [searchTerm, setSearchTerm] = useState('');

  // حالة الطباعة
  const [printGroup, setPrintGroup] = useState<{ employee: CustodyItem['employee'], items: CustodyItem[] } | null>(null);

  // حالة المودال
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    employeeId: '',
    itemName: '',
    serialNumber: '',
    description: '',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCustody, resEmps] = await Promise.all([
        fetch('/api/custody'),
        fetch('/api/employees')
      ]);
      const custodyData = await resCustody.json();
      const empsData = await resEmps.json();
      setItems(custodyData);
      setEmployees(empsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!newItem.employeeId || !newItem.itemName) return alert("يرجى اختيار الموظف واسم الغرض");
    await fetch('/api/custody', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    setIsModalOpen(false);
    setNewItem({ employeeId: '', itemName: '', serialNumber: '', description: '', notes: '' });
    fetchData(); 
  };

  const handleReturn = async (id: number) => {
    if (!confirm("هل أنت متأكد من استلام هذا الغرض وإخلاء طرف الموظف؟")) return;
    await fetch('/api/custody', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'تم الاسترجاع' })
    });
    fetchData();
  };

  const handlePrint = (group: { employee: CustodyItem['employee'], items: CustodyItem[] }) => {
    setPrintGroup(group);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.employee.fullName.toLowerCase().includes(term) || 
      item.itemName.toLowerCase().includes(term) ||          
      (item.serialNumber && item.serialNumber.toLowerCase().includes(term))
    );
  });

  const groupedData = filteredItems.reduce((acc: any, item) => {
    const empId = item.employee.id;
    if (!acc[empId]) {
      acc[empId] = { employee: item.employee, items: [] };
    }
    acc[empId].items.push(item);
    return acc;
  }, {});

  const groupedList = Object.values(groupedData) as { employee: CustodyItem['employee'], items: CustodyItem[] }[];

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'في الذمة').length,
    returned: items.filter(i => i.status === 'تم الاسترجاع').length,
  };

  return (
    <div className="p-8 max-w-[1920px] mx-auto">
      
      {/* 🛑 ستايل الطباعة */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          #printable-custody, #printable-custody * { visibility: visible; }
          #printable-custody { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; }
          @page { size: auto; margin: 0mm; }
        }
      `}</style>

      {/* المحتوى الرئيسي */}
      <div className="print:hidden space-y-8 animate-in fade-in duration-700">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">سجل الذمة الشخصية 💼</h1>
            <p className="text-slate-500 mt-1 font-medium">متابعة الأصول والطباعة</p>
          </div>
          <div className="flex w-full md:w-auto gap-4 flex-col md:flex-row">
              <div className="relative w-full md:w-96">
                  <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">🔍</span>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg whitespace-nowrap">+ تسليم عهدة</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
             <div><p className="text-slate-400 text-xs font-bold uppercase">إجمالي القطع</p><h3 className="text-3xl font-black text-slate-800">{stats.total}</h3></div>
             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">📦</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
             <div><p className="text-slate-400 text-xs font-bold uppercase">قيد الاستخدام</p><h3 className="text-3xl font-black text-orange-600">{stats.active}</h3></div>
             <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">⏳</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
             <div><p className="text-slate-400 text-xs font-bold uppercase">تم الاسترجاع</p><h3 className="text-3xl font-black text-green-600">{stats.returned}</h3></div>
             <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[1000px]">
              <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-6 w-1/4">الموظف</th>
                  <th className="p-6 w-3/4">الأغراض والعهد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={2} className="p-10 text-center text-slate-400 font-bold">جاري تحميل البيانات...</td></tr>
                ) : groupedList.length === 0 ? (
                  <tr><td colSpan={2} className="p-10 text-center text-slate-400 font-bold">لا توجد نتائج تطابق بحثك.</td></tr>
                ) : groupedList.map((group) => (
                  <tr key={group.employee.id} className="hover:bg-slate-50/50 transition-colors align-top">
                    <td className="p-6">
                      <div className="flex flex-col gap-4 sticky left-0">
                        <div className="flex items-start gap-4">
                          <img src={group.employee.avatar || `https://ui-avatars.com/api/?background=random&name=${group.employee.fullName}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" />
                          <div>
                            <p className="font-black text-slate-900 text-lg">{group.employee.fullName}</p>
                            <p className="text-xs text-slate-500 font-bold mt-1">{group.employee.department}</p>
                            <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-lg font-bold">
                              {group.items.filter(i => i.status === 'في الذمة').length} عهدة نشطة
                            </span>
                          </div>
                        </div>
                        <button onClick={() => handlePrint(group)} className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 py-3 rounded-xl font-bold text-xs transition-all border border-slate-200">🖨️ طباعة قائمة الذمم</button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border ${item.status === 'في الذمة' ? 'bg-white border-slate-200 shadow-sm' : 'bg-green-50/50 border-green-100 opacity-75'}`}>
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.status === 'في الذمة' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                  {item.status === 'في الذمة' ? '🔒' : '🔓'}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800">{item.itemName}</p>
                                   <p className="text-xs text-slate-400 font-mono mt-0.5">S/N: {item.serialNumber || '---'} • {item.description}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-left hidden md:block">
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">تاريخ الاستلام</p>
                                   <p className="text-xs font-bold text-slate-600">{new Date(item.receivedDate).toLocaleDateString('ar-EG')}</p>
                                </div>
                                {item.status === 'في الذمة' ? (
                                  <button onClick={() => handleReturn(item.id)} className="bg-slate-900 text-white hover:bg-green-600 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md">إخلاء طرف 🔄</button>
                                ) : (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black border border-green-200">تم الاسترجاع ✅</span>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                   <h2 className="text-xl font-black text-slate-900">تسليم عهدة جديدة 📦</h2>
                   <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">الموظف المستلم</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none" value={newItem.employeeId} onChange={e => setNewItem({...newItem, employeeId: e.target.value})}>
                        <option value="">-- اختر الموظف --</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">نوع الغرض</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none" value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} placeholder="لابتوب..." />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none font-mono" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} placeholder="S/N..." />
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="الوصف..." />
                   </div>
                   <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-all shadow-lg">تأكيد التسليم ✅</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 📄 قالب الطباعة (مصحح باستخدام Flexbox لمنع التداخل) */}
      {printGroup && (
        <div id="printable-custody" className="hidden print:flex flex-col w-[210mm] min-h-[297mm] bg-white p-12 mx-auto font-sans text-right text-black" dir="rtl">
           
           <div className="border-4 border-slate-900 p-8 rounded-3xl flex-1 flex flex-col relative">
              
              {/* الرأس */}
              <div className="flex justify-between items-center border-b-4 border-slate-100 pb-8 mb-8">
                 <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">نموذج استلام عهدة</h1>
                    <p className="text-slate-500 font-bold text-lg">Custody Receipt Form</p>
                 </div>
                 <div className="text-left">
                    <p className="font-bold text-lg text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
                    <p className="text-xs text-slate-400 font-bold">تاريخ الطباعة</p>
                 </div>
              </div>

              {/* بيانات الموظف */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex items-center gap-6">
                 <img src={printGroup.employee.avatar || "https://placehold.co/400"} className="w-24 h-24 rounded-2xl border-4 border-white shadow-sm object-cover" />
                 <div className="grid grid-cols-2 gap-x-12 gap-y-2 flex-1">
                    <div>
                       <p className="text-xs text-slate-400 font-bold">الموظف المستلم</p>
                       <p className="text-xl font-black text-slate-900">{printGroup.employee.fullName}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-bold">المسمى الوظيفي</p>
                       <p className="text-lg font-bold text-slate-700">{printGroup.employee.jobTitle || '---'}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-bold">القسم</p>
                       <p className="text-lg font-bold text-slate-700">{printGroup.employee.department}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-bold">عدد الذمم</p>
                       <p className="text-lg font-bold text-blue-600">{printGroup.items.filter(i => i.status === 'في الذمة').length}</p>
                    </div>
                 </div>
              </div>

              <p className="mb-6 text-sm font-bold text-slate-600 leading-relaxed">
                أقر أنا الموقع أدناه باستلامي للأجهزة والأدوات المذكورة في الجدول التالي بحالة جيدة، وأتعهد بالمحافظة عليها وإعادتها عند الطلب أو عند انتهاء الخدمة.
              </p>

              {/* جدول الذمم (نظيف بدون أسماء متداخلة) */}
              <table className="w-full border-collapse mb-12 flex-1">
                 <thead>
                    <tr className="bg-slate-100 text-slate-700">
                       <th className="border border-slate-300 p-3 text-sm font-black w-12">م</th>
                       <th className="border border-slate-300 p-3 text-sm font-black">اسم الغرض / العهدة</th>
                       <th className="border border-slate-300 p-3 text-sm font-black">السيريال نمبر (S/N)</th>
                       <th className="border border-slate-300 p-3 text-sm font-black">الحالة / الوصف</th>
                       <th className="border border-slate-300 p-3 text-sm font-black">تاريخ الاستلام</th>
                    </tr>
                 </thead>
                 <tbody>
                    {printGroup.items.filter(i => i.status === 'في الذمة').map((item, index) => (
                       <tr key={item.id} className="text-center">
                          <td className="border border-slate-300 p-3 font-bold">{index + 1}</td>
                          <td className="border border-slate-300 p-3 font-bold text-slate-900">{item.itemName}</td>
                          <td className="border border-slate-300 p-3 font-mono font-bold text-slate-600">{item.serialNumber || '---'}</td>
                          <td className="border border-slate-300 p-3 font-bold text-slate-700">{item.description || 'جيدة'}</td>
                          <td className="border border-slate-300 p-3 font-bold text-sm">{new Date(item.receivedDate).toLocaleDateString('en-GB')}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              {/* التوقيع (مثبت في الأسفل باستخدام mt-auto) */}
              <div className="mt-auto pt-8 w-full">
                 <div className="flex justify-between text-center text-base font-bold text-slate-500">
                    <div className="w-1/3">
                        <p className="mb-16">توقيع المستلم</p>
                        <div className="w-full h-0.5 bg-slate-300 mx-auto"></div>
                        <p className="mt-2 text-slate-900 font-bold">{printGroup.employee.fullName}</p>
                    </div>
                    <div className="w-1/3">
                        <p className="mb-16">مدير الموارد البشرية</p>
                        <div className="w-full h-0.5 bg-slate-300 mx-auto"></div>
                    </div>
                 </div>
                 <p className="text-center mt-8 text-xs text-slate-300 font-bold">نظام الموارد البشرية</p>
              </div>

           </div>
        </div>
      )}

    </div>
  );
}