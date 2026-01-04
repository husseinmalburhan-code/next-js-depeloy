'use client';

import { useState, useEffect } from 'react';

export default function PayrollPage() {
  const currentMonth = new Date().toISOString().slice(0, 7); 
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // حالة المعاينة والطباعة
  const [previewData, setPreviewData] = useState<any>(null);

  // جلب البيانات
  const fetchPayrolls = async () => {
    setLoading(true);
    const res = await fetch(`/api/payroll?month=${selectedMonth}`);
    const data = await res.json();
    setPayrolls(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayrolls(); }, [selectedMonth]);

  // احتساب الرواتب
  const generatePayroll = async () => {
    if (!confirm(`هل أنت متأكد من إعادة احتساب الرواتب لشهر ${selectedMonth}؟`)) return;
    setLoading(true);
    await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: selectedMonth })
    });
    fetchPayrolls();
    setLoading(false);
  };

  // صرف الراتب
  const markAsPaid = async (id: number) => {
    await fetch('/api/payroll', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'تم الصرف' })
    });
    fetchPayrolls();
  };

  // 🔥 دالة الطباعة (مع تأخير بسيط لضمان الرسم)
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="p-8 max-w-[1920px] mx-auto">
      
      {/* ✅ ستايل خاص للطباعة فقط (لحل مشكلة الصفحة البيضاء والألوان) */}
      <style jsx global>{`
        @media print {
          /* إجبار المتصفح على طباعة الألوان والخلفيات */
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* إخفاء كل شيء في الصفحة */
          body * {
            visibility: hidden;
          }
          /* إظهار منطقة الطباعة فقط */
          #printable-area, #printable-area * {
            visibility: visible;
          }
          /* ضبط التموضع */
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          /* إخفاء هوامش الصفحة الافتراضية */
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* 🛑 هذا القسم (الموقع بالكامل) سيختفي عند الطباعة بسبب الستايل أعلاه */}
      <div className="space-y-8 animate-in fade-in duration-700">
        
        {/* الهيدر */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-slate-900">مسير الرواتب 💳</h1>
            <p className="text-slate-500 mt-1 font-medium">إدارة الرواتب والطباعة</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
             <input 
               type="month" 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="bg-white border border-slate-200 rounded-xl p-2 font-bold outline-none"
             />
             <button onClick={generatePayroll} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
               ⚡ احتساب الرواتب
             </button>
          </div>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[1000px]">
              <thead className="bg-slate-50 text-slate-400 text-xs font-black">
                <tr>
                  <th className="p-4">الموظف</th>
                  <th className="p-4">الأساسي</th>
                  <th className="p-4 text-green-600">الإضافي (+)</th>
                  <th className="p-4 text-red-400">خصم غياب (-)</th>
                  <th className="p-4">الصافي</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                   <tr><td colSpan={7} className="p-8 text-center text-slate-400">لا توجد سجلات. اضغط احتساب.</td></tr>
                ) : payrolls.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-3">
                      <img 
                        src={row.employee?.avatar || `https://ui-avatars.com/api/?background=random&name=${row.employee?.fullName}`} 
                        className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
                        alt="avatar"
                      />
                      {row.employee?.fullName}
                    </td>
                    <td className="p-4 font-mono">${row.basicSalary?.toLocaleString()}</td>
                    
                    <td className="p-4">
                      <div className="text-green-600 font-mono font-bold">+${row.overtimePay?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{row.overtimeHours?.toFixed(1)} ساعة</div>
                    </td>
                    
                    <td className="p-4 font-mono text-red-500 font-bold">-${row.deductions?.toLocaleString()}</td>
                    <td className="p-4 font-mono font-black text-lg text-slate-800">${row.netSalary?.toLocaleString()}</td>
                    
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-black ${row.status === 'تم الصرف' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {row.status !== 'تم الصرف' && (
                         <button onClick={() => markAsPaid(row.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600">صرف</button>
                      )}
                      {/* زر المعاينة */}
                      <button onClick={() => setPreviewData(row)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-all">
                        👁️ معاينة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ✅ المودال (النافذة المنبثقة) للمعاينة */}
      {previewData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            
            {/* رأس المودال */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[2rem]">
               <h2 className="text-xl font-black text-slate-800">📄 معاينة القسيمة</h2>
               <div className="flex gap-3">
                  <button 
                    onClick={handlePrint} 
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    🖨️ طباعة / حفظ PDF
                  </button>
                  <button onClick={() => setPreviewData(null)} className="bg-slate-100 text-slate-500 w-10 h-10 rounded-full font-bold hover:bg-slate-200 transition-all">✕</button>
               </div>
            </div>

            {/* جسم المودال */}
            <div className="p-8 bg-slate-50 overflow-y-auto flex justify-center">
               
               {/* 🛑🛑 معرف (ID) مهم جداً للطباعة: printable-area */}
               <div id="printable-area">
                 <PayslipTemplate data={previewData} />
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ------------------------------------------------------------------
// 📄 مكون تصميم القسيمة
// ------------------------------------------------------------------
function PayslipTemplate({ data }: { data: any }) {
  // تصميم ثابت (A4 Size)
  return (
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '40px', fontFamily: 'sans-serif', direction: 'rtl', color: '#000', margin: '0 auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
       <div style={{ border: '4px solid #1e293b', padding: '32px', borderRadius: '24px', position: 'relative', height: '100%' }}>
          
          {/* الرأس */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #f1f5f9', paddingBottom: '32px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1e293b', margin: 0 }}>شريط راتب</h1>
              <p style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '18px', marginTop: '8px' }}>PAYSLIP REPORT</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '20px', margin: 0 }} dir="ltr">{data.month}</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold', margin: '4px 0 0 0' }}>التاريخ</p>
            </div>
          </div>

          {/* معلومات الموظف */}
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
             <img 
                src={data.employee?.avatar || "https://placehold.co/400"} 
                style={{ width: '96px', height: '96px', borderRadius: '16px', border: '4px solid #ffffff', objectFit: 'cover' }}
             />
             <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>الموظف</p>
                  <p style={{ fontWeight: '900', fontSize: '24px', color: '#0f172a', margin: 0 }}>{data.employee?.fullName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>المسمى الوظيفي</p>
                  <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#2563eb', margin: 0 }}>{data.employee?.jobTitle}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>القسم</p>
                  <p style={{ fontWeight: 'bold', color: '#334155', margin: 0 }}>{data.employee?.department}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>الرقم الوظيفي</p>
                  <p style={{ fontWeight: 'bold', color: '#334155', margin: 0 }}>#{data.employee?.id}</p>
                </div>
             </div>
          </div>

          {/* الأرقام */}
          <div style={{ marginBottom: '48px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
               <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#475569' }}>الراتب الأساسي</span>
               <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '24px', color: '#0f172a' }}>${data.basicSalary?.toLocaleString()}</span>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', marginTop: '16px' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#166534' }}>عمل إضافي</span>
                  <span style={{ fontSize: '14px', color: '#15803d', fontWeight: 'bold', marginTop: '4px' }}>ساعات العمل: {data.overtimeHours?.toFixed(1)} ساعة</span>
               </div>
               <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '24px', color: '#15803d' }}>+${data.overtimePay?.toLocaleString()}</span>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2', marginTop: '16px' }}>
               <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#991b1b' }}>خصومات (غياب)</span>
               <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '24px', color: '#b91c1c' }}>-${data.deductions?.toLocaleString()}</span>
             </div>

             <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '4px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>الصافي المستحق للدفع:</span>
               <span style={{ fontSize: '40px', fontWeight: '900', color: '#0f172a', backgroundColor: '#fde047', padding: '16px 32px', borderRadius: '16px' }}>
                  ${data.netSalary?.toLocaleString()}
               </span>
             </div>
          </div>

          {/* التوقيع */}
          <div style={{ position: 'absolute', bottom: '40px', left: '0', width: '100%', padding: '0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#94a3b8' }}>
              <div style={{ width: '33%' }}>
                  <p style={{ marginBottom: '80px', color: '#64748b', fontSize: '18px' }}>توقيع المحاسب</p>
                  <div style={{ width: '100%', height: '2px', backgroundColor: '#cbd5e1', margin: '0 auto' }}></div>
              </div>
              <div style={{ width: '33%' }}>
                  <p style={{ marginBottom: '80px', color: '#64748b', fontSize: '18px' }}>توقيع الموظف</p>
                  <div style={{ width: '100%', height: '2px', backgroundColor: '#cbd5e1', margin: '0 auto' }}></div>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold' }}>Generated by HR Enterprise System • Confidential</p>
          </div>
          
       </div>
    </div>
  );
}