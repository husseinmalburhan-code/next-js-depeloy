import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. جلب الموظفين
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 });
  }
}

// 2. إضافة موظف جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("📥 محاولة حفظ الموظف:", body.fullName); // للتأكد من وصول البيانات

    // التحقق من الحقول الإجبارية فقط
    if (!body.fullName || !body.jobTitle || !body.department) {
      return NextResponse.json({ error: 'يرجى تعبئة الاسم، الوظيفة، والقسم' }, { status: 400 });
    }

    // التحقق من تكرار الإيميل (فقط إذا كتب إيميل)
    if (body.email && body.email.trim() !== '') {
      const exists = await prisma.employee.findUnique({
        where: { email: body.email }
      });
      if (exists) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, { status: 400 });
      }
    }

    // إنشاء الموظف (مع تنظيف البيانات)
    const newEmployee = await prisma.employee.create({
      data: {
        fullName: body.fullName,
        jobTitle: body.jobTitle,
        department: body.department,
        
        // تحويل النصوص الفارغة إلى null لتجنب المشاكل
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        gender: body.gender || 'ذكر',
        
        // التواريخ
        birthDate: body.birthDate || null,
        hireDate: body.hireDate || null,
        
        // المدير (الحقل الجديد)
        manager: body.manager || null,
        
        // الحالة والراتب
        status: body.status || 'نشط',
        salary: body.salary ? parseFloat(body.salary) : 0, // تحويل النص لرقم
        
        // البيانات المالية والصورة
        bankName: body.bankName || null,
        iban: body.iban || null,
        avatar: body.avatar || null,
      },
    });

    console.log("✅ تم الحفظ بنجاح، ID:", newEmployee.id);
    return NextResponse.json(newEmployee, { status: 201 });

  } catch (error: any) {
    console.error('❌ تفاصيل خطأ الحفظ:', error); // سيظهر لك السبب في الشاشة السوداء
    return NextResponse.json({ error: 'فشل الحفظ: ' + (error.message || 'خطأ غير معروف') }, { status: 500 });
  }
}