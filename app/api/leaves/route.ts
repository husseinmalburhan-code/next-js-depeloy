import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. جلب كافة الإجازات مع بيانات الموظف
// 1. جلب كافة الإجازات مع صورة الموظف الحقيقية
export async function GET() {
  try {
    const leaves = await prisma.leave.findMany({
      include: { 
        employee: {
          select: { 
            fullName: true, 
            avatar: true, // ✅ ضروري جداً لجلب الصورة المحفوظة
            jobTitle: true, 
            department: true 
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leaves);
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 });
  }
}
// 2. تقديم طلب إجازة جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    const newLeave = await prisma.leave.create({
      data: {
        employeeId: parseInt(employeeId),
        type,
        startDate,
        endDate,
        reason
      }
    });

    return NextResponse.json(newLeave);
  } catch (error) {
    return NextResponse.json({ error: 'فشل إنشاء الطلب' }, { status: 500 });
  }
}

// 3. تحديث حالة الطلب (قبول أو رفض)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body; // status: 'مقبول' | 'مرفوض'

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    return NextResponse.json({ error: 'فشل تحديث الحالة' }, { status: 500 });
  }
}