import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>
}

// 1. تعديل موظف (تم إصلاح تعديل المدير)
export async function PUT(request: Request, props: Props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const updated = await prisma.employee.update({
      where: { id: id },
      data: {
        fullName: body.fullName,
        jobTitle: body.jobTitle,
        department: body.department,
        email: body.email,
        phone: body.phone,
        salary: parseFloat(body.salary),
        address: body.address,
        gender: body.gender,
        birthDate: body.birthDate,
        hireDate: body.hireDate,
        bankName: body.bankName,
        iban: body.iban,
        status: body.status,
        avatar: body.avatar,
        manager: body.manager, // ✅ تمت إضافة المدير هنا ليتم تعديله
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'فشل التعديل' }, { status: 500 });
  }
}

// 2. حذف موظف
export async function DELETE(request: Request, props: Props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);

    await prisma.employee.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'فشل الحذف' }, { status: 500 });
  }
}

// 3. جلب موظف واحد
export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const employee = await prisma.employee.findUnique({ where: { id } });
    
    if (!employee) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'فشل الجلب' }, { status: 500 });
  }
}