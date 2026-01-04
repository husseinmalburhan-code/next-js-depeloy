import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";   // ✅ التصميم العام (القائمة الجانبية)
import AuthProvider from "@/components/AuthProvider"; // ✅ مزود الجلسة (لحل مشكلة الدخول)

// إعداد خط Cairo
const cairo = Cairo({ 
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام الموارد البشرية الذكي",
  description: "نظام إدارة الموظفين - نسخة Enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-slate-50 text-slate-900 antialiased`}>
        
        {/* ✅ يجب تغليف التطبيق بـ AuthProvider ليعمل تسجيل الدخول */}
        <AuthProvider>
            
            {/* تصميم الصفحة (السايد بار والمحتوى) */}
            <MainLayout>
              {children}
            </MainLayout>

        </AuthProvider>

      </body>
    </html>
  );
}