export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';

async function getDashboardStats() {
  'use server';
  
  // 1. جلب الأرقام والإحصائيات
  const totalEmployees = await prisma.employee.count();
  const activeEmployees = await prisma.employee.count({ where: { status: 'نشط' } });
  
  const departments = await prisma.employee.groupBy({
    by: ['department'],
    _count: { id: true },
  });

  const pendingLeavesCount = await prisma.leave.count({
    where: { status: 'قيد المراجعة' }
  });

  // ✅ 2. جلب قائمة الإجازات المعلقة (البيانات الحقيقية)
  const pendingLeavesList = await prisma.leave.findMany({
    where: { status: 'قيد المراجعة' },
    include: { employee: true }, // نحتاج بيانات الموظف (الاسم والصورة)
    orderBy: { startDate: 'desc' }, // الأحدث أولاً
    take: 5 // نجلب آخر 5 طلبات فقط
  });

  return { 
    totalEmployees, 
    activeEmployees, 
    departments, 
    pendingLeaves: pendingLeavesCount,
    pendingLeavesList // نمرر القائمة للواجهة
  };
}

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <main className="animate-in fade-in duration-700 p-4 md:p-8 max-w-[1920px] mx-auto">
      <DashboardClient stats={stats} />
    </main>
  );
}