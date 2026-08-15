import '@/styles/globals.css'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import Link from 'next/link'

export const metadata = {
  title: 'Admin - KCAPTURED',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="min-h-screen bg-slate-900 text-white">
        <SidebarProvider>
          <div className="flex">
            <Sidebar side="left" variant="inset" collapsible="icon">
              <SidebarHeader className="px-4 py-4">
                <Link href="/admin" className="text-lg font-semibold">Admin</Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/admin">
                      <SidebarMenuButton asChild>
                        <a>Dashboard</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/portfolio">
                      <SidebarMenuButton asChild>
                        <a>Portfolio</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/packages">
                      <SidebarMenuButton asChild>
                        <a>Packages</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/testimonials">
                      <SidebarMenuButton asChild>
                        <a>Testimonials</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/bookings">
                      <SidebarMenuButton asChild>
                        <a>Bookings</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/settings">
                      <SidebarMenuButton asChild>
                        <a>Settings</a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="px-4 py-4">
                <div className="text-xs text-gray-400">Signed in via upload key</div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="flex-1 bg-slate-900 text-white">
              <div className="w-full">
                <header className="border-b border-slate-700 py-4 px-6">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl font-semibold">Admin</h1>
                  </div>
                </header>
                <main className="p-6 max-w-7xl mx-auto">{children}</main>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
