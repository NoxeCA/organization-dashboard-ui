'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  Package,
  FileText,
  Plus,
  Wrench,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const navigation = [
  {
    title: 'Service Calls',
    items: [
      {
        title: 'All Service Calls',
        url: '/service-calls',
        icon: ClipboardList,
      },
      {
        title: 'Create New',
        url: '/service-calls/new',
        icon: Plus,
      },
    ],
  },
  {
    title: 'Purchase Orders',
    items: [
      {
        title: 'All POs',
        url: '/purchase-orders',
        icon: Package,
      },
      {
        title: 'Create New',
        url: '/purchase-orders/new',
        icon: Plus,
      },
    ],
  },
  {
    title: 'Invoices',
    items: [
      {
        title: 'All Invoices',
        url: '/invoices',
        icon: FileText,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/service-calls">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Wrench className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Service Manager</span>
                  <span className="text-xs text-muted-foreground">Internal Tool</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url ||
                    (item.url !== '/' && pathname.startsWith(item.url) && item.url !== '/service-calls/new' && item.url !== '/purchase-orders/new')
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
