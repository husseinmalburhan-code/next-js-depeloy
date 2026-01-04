import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. جلب سجلات الذمة (الكل أو لموظف محدد)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  const whereClause = employeeId ? { employeeId: parseInt(employeeId) } : {};

  const items = await prisma.custody.findMany({
    where: whereClause,
    include: { employee: true },
    orderBy: { receivedDate: 'desc' }
  });

  return NextResponse.json(items);
}

// 2. إضافة ذمة جديدة لموظف
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newItem = await prisma.custody.create({
      data: {
        itemName: body.itemName,
        description: body.description,
        serialNumber: body.serialNumber,
        employeeId: parseInt(body.employeeId),
        status: 'في الذمة',
        notes: body.notes
      }
    });

    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: 'فشل إضافة الذمة' }, { status: 500 });
  }
}

// 3. تحديث الحالة (إخلاء طرف / استرجاع)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    // إذا الحالة "تم الاسترجاع"، نسجل تاريخ اليوم كتاريخ إرجاع
    const updateData: any = { status };
    if (status === 'تم الاسترجاع') {
      updateData.returnedDate = new Date();
    }

    const updatedItem = await prisma.custody.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 });
  }
}