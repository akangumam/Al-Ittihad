'use client'

import * as React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ChevronRight } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar'
import verticalMenuData from '@/data/navigation/verticalMenuData'
import type { VerticalMenuDataType, VerticalMenuItemDataType, VerticalSubMenuDataType } from '@/types/menuTypes'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const menuData = verticalMenuData() as VerticalMenuDataType[]

  // Helper to check if a route is active
  const isActive = (href?: string) => {
    if (!href) return false

    return pathname === href || pathname.startsWith(href)
  }

  // Helper to check if a group has active children
  const isGroupActive = (children: VerticalMenuDataType[]): boolean => {
    return children.some(child => {
      if ('href' in child && typeof child.href === 'string') {
        return isActive(child.href)
      }

      if ('children' in child && child.children) {
        return isGroupActive(child.children)
      }

      return false
    })
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <i className='ri-school-line text-xl' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>MTs Al-Ittihad</span>
                  <span className='truncate text-xs'>School Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.map((item, index) => {
                const labelText: string | undefined = typeof item.label === 'string' ? item.label : undefined

                if ('children' in item && item.children) {
                  const subMenu = item as VerticalSubMenuDataType

                  return (
                    <Collapsible
                      key={index}
                      asChild
                      defaultOpen={isGroupActive(subMenu.children)}
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={labelText}>
                            {item.icon ? <i className={item.icon} /> : null}
                            <span>{item.label}</span>
                            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {subMenu.children.map((subItem, subIndex) => {
                              const menuItem = subItem as VerticalMenuItemDataType

                              return (
                                <SidebarMenuSubItem key={subIndex}>
                                  <SidebarMenuSubButton asChild isActive={isActive(menuItem.href)}>
                                    <Link href={menuItem.href || '#'}>
                                      {menuItem.icon ? <i className={menuItem.icon} /> : null}
                                      <span>{menuItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                const menuItem = item as VerticalMenuItemDataType

                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild isActive={isActive(menuItem.href)} tooltip={labelText}>
                      <Link href={menuItem.href || '#'}>
                        {menuItem.icon ? <i className={menuItem.icon} /> : null}
                        <span>{menuItem.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='p-2 text-xs text-center text-muted-foreground'>v6.0.0</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
