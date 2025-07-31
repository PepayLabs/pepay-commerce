import { type SidebarData } from '../types'
import { auth } from '@/lib/auth'

const user = auth.getUser()

console.log('User:', user)

export const sidebarData: SidebarData = {
  user: {
    name: typeof user === 'string' ? user : user?.display_name || ''
  },

  teams: [
    {
      name: 'Grab Me A Slice',
      logo: () => <span className="text-xl">🍕</span>,
      plan: '',
    }
  ],
  navGroups: [
    {
      title: '',
      items: [
        {
          title: 'PROFILE',
          url: '/',
          icon: () => <span className="text-lg">🧙‍♂️</span>,
        },
          {
            title: 'POSTS',
            url: '/posts',
            icon: () => <span className="text-lg">📝</span>,
          },
        {
          title: 'CONTENT',
          url: '/content',
          icon: () => <span className="text-lg">📦</span>,
        },
        {
          title: 'PAYMENTS',
          url: '/payments',
          icon: () => <span className="text-lg">💰</span>,
        },
        {
          title: 'WALLETS',
          url: '/wallets',
          icon: () => <span className="text-lg">💳</span>,
        },
        {
          title: 'SETTING',
          url: '/settings',
          icon: () => <span className="text-lg">⚡</span>,
        }
      ],
    }
  ],
}
