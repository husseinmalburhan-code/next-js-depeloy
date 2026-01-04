import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// 1. جلب كافة المستخدمين
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب المستخدمين' }, { status: 500 });
  }
}

// 2. إضافة مستخدم جديد (مع تشفير كلمة المرور 🔐)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    // التحقق من أن جميع البيانات موجودة
    if (!name || !username || !password) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 });
    }

    // التحقق من عدم تكرار اسم المستخدم
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'اسم المستخدم موجود مسبقاً' }, { status: 400 });
    }

    // 🔥 خطوة الأمان: تشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        name, 
        username, 
        password: hashedPassword, // ✅ تخزين المشفر وليس النص الأصلي
        role 
      }
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json({ error: 'فشل إنشاء المستخدم' }, { status: 500 });
  }
}

// 3. حذف مستخدم
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    
    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'فشل الحذف' }, { status: 500 });
  }
}