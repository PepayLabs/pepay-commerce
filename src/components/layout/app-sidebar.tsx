import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data.tsx'
import { Link } from '@tanstack/react-router'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      
      {/* External Links Section */}
      <SidebarMenu className="mb-2">
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Grab Me A Slice Home">
            <Link to="/home">
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Buidl">
            <a href="https://docs.pepay.io" target="_blank" rel="noopener noreferrer">
              <span className="text-lg">🛠️</span>
              <span>Buidl</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/* <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Faucet">
            <Link to="/faucet">
              <span className="text-lg">🚰</span>
              <span>Faucet</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Community">
            <a href="https://peperuney.pizza" target="_blank" rel="noopener noreferrer">
              <span className="text-lg">🍕</span>
              <span>Community</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      
      <SidebarFooter className="flex items-center justify-start">
        <div className="flex items-center w-full">
          <div className="h-12 w-12 ml-3  flex-shrink-0 rounded-md overflow-hidden border border-white/30">
            <img
              src="/images/logo.png" 
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <NavUser user={sidebarData.user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
