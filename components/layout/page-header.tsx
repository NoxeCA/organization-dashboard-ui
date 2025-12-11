'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
