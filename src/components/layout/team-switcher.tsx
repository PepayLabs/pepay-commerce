import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link } from 'react-router-dom'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam] = React.useState(teams[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className="flex items-center justify-start w-full">
                <Link to="/" className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      src='/images/gmas-app-square.png'
                      alt='Grab Me A Slice Logo'
                      className='h-12 w-12 rounded-lg object-contain mr-2'
                    />
                  </div>
                  <div className="hidden md:block">
                    <img
                      src='/images/gmas-written.png'
                      alt='Grab Me A Slice'
                      className='h-12 mt-2 ml-1 object-contain'
                    />
                  </div>
                </Link>
              </div>
              {!isMobile && (
                <div className='grid flex-1 text-left text-sm leading-tight ml-auto'>
                  <span className='truncate font-semibold'>
                    {activeTeam.name}
                  </span>
                  <span className='truncate text-xs'>{activeTeam.plan}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
      {isMobile && (
        <SidebarMenuItem>
          {/* Add mobile-specific content here */}
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
}
