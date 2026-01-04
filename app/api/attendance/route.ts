import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ✅ 1. دالة GET: لجلب بيانات الحضور وعرضها في الجدول
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); 
    const month = searchParams.get('month');

    let whereClause: any = {};

    // فلترة حسب التاريخ أو الشهر
    if (date) {
      whereClause.date = date; 
    } else if (month) {
      whereClause.date = { startsWith: month }; 
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { fullName: true, avatar: true, department: true }
        }
      },
      orderBy: { createdAt: 'desc' } // الأحدث أولاً
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 });
  }
}

// ✅ 2. دالة POST: لتسجيل الدخول/الخروج (كودك الأصلي مع منطق التأخير)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { action } = await request.json(); 
  
  const today = new Date().toISOString().slice(0, 10);
  // توقيت السيرفر الحالي
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 

  // وقت بدء الدوام (لحساب التأخير)
  const WORK_START_TIME = "09:00";

  const employee = await prisma.employee.findFirst({
    where: { fullName: session.user.name || '' } 
  });

  if (!employee) {
    return NextResponse.json({ error: 'لم يتم العثور على سجل موظف' }, { status: 404 });
  }

  const attendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: today }
  });

  try {
    // 🟢 تسجيل الدخول
    if (action === 'check-in') {
      if (attendance) {
        return NextResponse.json({ error: 'تم تسجيل الدخول مسبقاً' }, { status: 400 });
      }

      // منطق التأخير
      let myStatus = 'حاضر';
      if (currentTime > WORK_START_TIME) {
        myStatus = 'متأخر'; 
      }

      await prisma.attendance.create({
        data: {
          date: today,
          status: myStatus,
          checkIn: currentTime,
          employeeId: employee.id
        }
      });

      return NextResponse.json({ 
        message: myStatus === 'متأخر' ? `تم تسجيل الدخول (أنت متأخر 😅)` : 'تم تسجيل الدخول بنجاح ✅', 
        time: currentTime 
      });
    }

    // 🔴 تسجيل الخروج
    if (action === 'check-out') {
      if (!attendance || !attendance.checkIn) {
        return NextResponse.json({ error: 'لا يوجد تسجيل دخول' }, { status: 400 });
      }

      const start = parseInt(attendance.checkIn.split(':')[0]) * 60 + parseInt(attendance.checkIn.split(':')[1]);
      const end = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      const durationMinutes = end - start;
      const hours = parseFloat((durationMinutes / 60).toFixed(2));

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: currentTime, workHours: hours }
      });

      return NextResponse.json({ message: 'تم تسجيل الخروج 👋', time: currentTime, hours });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
  }
}