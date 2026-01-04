import { withAuth } from "next-auth/middleware";

// هذا يصدر الميدل وير بشكل صريح
export default withAuth({
  // صفحة تسجيل الدخول (يوجه المستخدم لها إذا لم يكن مسجلاً)
  pages: {
    signIn: "/login",
  },
});

// تحديد الصفحات المحمية
export const config = { 
  matcher: [
    "/",
    "/employees/:path*",
    "/attendance/:path*",
    "/settings/:path*"
  ] 
};