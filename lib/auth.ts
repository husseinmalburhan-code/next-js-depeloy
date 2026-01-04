import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🚀 1. بدء محاولة تسجيل الدخول...");

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ البيانات ناقصة");
          throw new Error("يرجى إدخال البيانات");
        }

        console.log("🔍 البحث عن المستخدم:", credentials.username);

        const user = await prisma.user.findFirst({
          where: { username: credentials.username }
        });

        if (!user) {
          console.log("❌ المستخدم غير موجود في قاعدة البيانات");
          throw new Error("المستخدم غير موجود");
        }

        console.log("✅ تم العثور على المستخدم:", user.username);
        // طباعة كلمات المرور للمقارنة (تنبيه: احذف هذا في النسخة النهائية للإنتاج)
        console.log("💾 كلمة المرور المخزنة:", user.password);
        console.log("⌨️ كلمة المرور المدخلة:", credentials.password);

        // ✅ الفحص المزدوج (يقبل المشفر والعادي)
        // 1. هل هي مطابقة كنص عادي؟ (إذا أدخلتها يدوياً في الداتابيس)
        const isPlainMatch = credentials.password === user.password;
        
        // 2. هل هي مطابقة كتشفير؟ (إذا تم إنشاؤها عبر صفحة تسجيل)
        const isHashMatch = await bcrypt.compare(credentials.password, user.password);

        console.log("📊 نتيجة المطابقة العادية:", isPlainMatch);
        console.log("📊 نتيجة المطابقة المشفرة:", isHashMatch);

        // إذا لم تنجح أي من الطريقتين
        if (!isPlainMatch && !isHashMatch) {
          console.log("❌ كلمة المرور غير صحيحة!");
          throw new Error("كلمة المرور خطأ");
        }

        console.log("🎉 نجاح! تم تسجيل الدخول للمستخدم:", user.name);

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.role, // تخزين الصلاحية
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};