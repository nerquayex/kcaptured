import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyUploadToken } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "KCAPTURED Studios Admin",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = (await cookies()).get("admin_session")?.value;

  if (!sessionToken || !verifyUploadToken(sessionToken)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f2f2f2]">{children}</div>
  );
}
