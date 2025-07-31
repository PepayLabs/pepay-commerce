import { Link, useNavigate } from '@tanstack/react-router'
import {
  ChevronsUpDown,
  Receipt,
  LogOut,
  User,
  Wallet,
  Settings,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'

export function NavUser({
  user,
}: {
  user: {
    name: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    auth.logout()
    navigate({ to: '/sign-in' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
          
              <div className='grid flex-1 text-right text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.name}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/'>
                  <span className="text-lg mr-2">🧙‍♂️</span>
                  PROFILE
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/posts'>
                  <span className="text-lg mr-2">📝</span>
                  POSTS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/content'>
                  <span className="text-lg mr-2">📦</span>
                  CONTENT
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/payments'>
                  <span className="text-lg mr-2">💰</span>
                  PAYMENTS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/wallets'>
                  <span className="text-lg mr-2">💳</span>
                  WALLETS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <span className="text-lg mr-2">⚡</span>
                  SETTINGS
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
