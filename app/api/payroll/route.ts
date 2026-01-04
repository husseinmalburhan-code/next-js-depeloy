import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. جلب الرواتب
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  if (!month) return NextResponse.json([]);

  const payrolls = await prisma.payroll.findMany({
    where: { month },
    include: { employee: true },
    orderBy: { employeeId: 'asc' }
  });

  return NextResponse.json(payrolls);
}

// 2. 🔥 احتساب الرواتب مع الإضافي (Overtime)
export async function POST(request: Request) {
  try {
    const { month } = await request.json(); 
    const employees = await prisma.employee.findMany();

    for (const emp of employees) {
      
      // أ. حساب الغياب
      const absentDays = await prisma.attendance.count({
        where: {
          employeeId: emp.id,
          status: 'غياب',
          date: { startsWith: month }
        }
      });

      // ب. حساب ساعات العمل الإضافي
      // ✅ نجلب سجلات "حاضر" و "متأخر"
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          status: { in: ['حاضر', 'متأخر'] }, 
          date: { startsWith: month }
        }
      });

      let totalOvertimeHours = 0;
      
      // ✅ (record: any) لحل مشكلة التايب سكريبت
      attendanceRecords.forEach((record: any) => {
        // إذا اشتغل أكثر من 8 ساعات، نحسب الفرق
        if (record.workHours && record.workHours > 8) {
          totalOvertimeHours += (record.workHours - 8);
        }
      });

      // ج. المعادلات المالية
      const dailyRate = emp.salary / 30;       // أجر اليوم
      const hourlyRate = dailyRate / 8;        // أجر الساعة
      
      const deductionAmount = Math.floor(dailyRate * absentDays); // مبلغ الخصم
      
      // معادلة الإضافي: الساعة بساعة ونصف
      const overtimeAmount = Math.floor(totalOvertimeHours * hourlyRate * 1.5);

      // الصافي النهائي
      const netSalary = emp.salary - deductionAmount + overtimeAmount;

      // د. الحفظ أو التحديث
      const existingPayroll = await prisma.payroll.findFirst({
        where: { employeeId: emp.id, month }
      });

      const payrollData = {
        basicSalary: emp.salary,
        deductions: deductionAmount,
        overtimeHours: totalOvertimeHours,
        overtimePay: overtimeAmount,
        netSalary: netSalary,
        bonuses: 0
      };

      if (existingPayroll) {
        await prisma.payroll.update({
          where: { id: existingPayroll.id },
          data: payrollData
        });
      } else {
        await prisma.payroll.create({
          data: {
            employeeId: emp.id,
            month,
            status: 'معلق',
            ...payrollData
          }
        });
      }
    }

    return NextResponse.json({ message: 'تم الحساب بنجاح' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشل العملية' }, { status: 500 });
  }
}

// 3. تحديث الحالة (صرف)
export async function PATCH(request: Request) {
  const { id, status } = await request.json();
  await prisma.payroll.update({
    where: { id },
    data: { status }
  });
  return NextResponse.json({ success: true });
}