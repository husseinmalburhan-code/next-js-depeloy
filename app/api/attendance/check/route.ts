import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // تأكد من مسار authOptions

export async function POST(request: Request) {
  // 1. التحقق من هوية المستخدم
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { action } = await request.json(); // 'check-in' أو 'check-out'
  const today = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // "08:30"

  // 2. البحث عن بيانات الموظف بناءً على الإيميل (الاسم في حالتنا)
  // ملاحظة: نفترض أن اسم المستخدم في الـ session يطابق اسم الموظف
  const employee = await prisma.employee.findFirst({
    where: { fullName: session.user.name || '' } 
  });

  if (!employee) {
    return NextResponse.json({ error: 'لم يتم العثور على سجل موظف مرتبط بهذا الحساب' }, { status: 404 });
  }

  // 3. البحث عن سجل حضور لليوم
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      date: today
    }
  });

  try {
    // 🟢 حالة تسجيل الدخول
    if (action === 'check-in') {
      if (attendance) {
        return NextResponse.json({ error: 'لقد قمت بتسجيل الدخول مسبقاً اليوم!' }, { status: 400 });
      }

      await prisma.attendance.create({
        data: {
          date: today,
          status: 'حاضر',
          checkIn: currentTime,
          employeeId: employee.id
        }
      });

      return NextResponse.json({ message: 'تم تسجيل الدخول بنجاح ✅', time: currentTime });
    }

    // 🔴 حالة تسجيل الخروج
    if (action === 'check-out') {
      if (!attendance || !attendance.checkIn) {
        return NextResponse.json({ error: 'لا يوجد تسجيل دخول لهذا اليوم!' }, { status: 400 });
      }

      // حساب ساعات العمل
      const start = parseInt(attendance.checkIn.split(':')[0]) * 60 + parseInt(attendance.checkIn.split(':')[1]);
      const end = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      const durationMinutes = end - start;
      const hours = parseFloat((durationMinutes / 60).toFixed(2));

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: currentTime,
          workHours: hours
        }
      });

      return NextResponse.json({ message: 'تم تسجيل الخروج. يعطيك العافية! 👋', time: currentTime, hours });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
  }
}

// دالة لجلب حالة الموظف الحالية (هل هو داخل أم خارج؟)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return NextResponse.json({});

  const employee = await prisma.employee.findFirst({ where: { fullName: session.user.name || '' } });
  if (!employee) return NextResponse.json({});

  const today = new Date().toISOString().slice(0, 10);
  const attendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: today }
  });

  return NextResponse.json(attendance || {});
}