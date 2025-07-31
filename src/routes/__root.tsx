import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/toaster'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { auth } from '@/lib/auth'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ location }) => {
    const isAuthenticated = auth.isAuthenticated()
    const authRoutes = ['/sign-in', '/sign-up']
    const isAuthRoute = authRoutes.includes(location.pathname)
    

    // If it's the root path, handle differently based on authentication
    if (location.pathname === '/') {
      // If user is not authenticated, redirect to marketing home page
      if (!isAuthenticated) {
        throw redirect({
          to: '/home',
        })
      }
      // For authenticated users, no redirect needed since Dashboard is at '/'
      // We'll let it render normally
    }

    // If user is not authenticated and trying to access authenticated routes
    if (
      !isAuthenticated &&
      location.pathname.startsWith('/_authenticated')
    ) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // If user is authenticated and trying to access auth routes (sign-in, sign-up)
    if (isAuthenticated && isAuthRoute) {
      throw redirect({
        to: '/', // This is fine now because we won't trigger the first condition again
      })
    }
  },
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})


// import { QueryClient } from '@tanstack/react-query'
// import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
// import { Toaster } from '@/components/ui/toaster'
// import GeneralError from '@/features/errors/general-error'
// import NotFoundError from '@/features/errors/not-found-error'
// import { auth } from '@/lib/auth'

// export const Route = createRootRouteWithContext<{
//   queryClient: QueryClient
// }>()({
//   beforeLoad: ({ location }) => {
//     const isAuthenticated = auth.isAuthenticated()
//     const authRoutes = ['/sign-in', '/sign-up']
//     const isAuthRoute = authRoutes.includes(location.pathname)

//     // If user is not authenticated and trying to access authenticated routes or root path
//     if (
//       !isAuthenticated &&
//       (location.pathname.startsWith('/_authenticated') || location.pathname === '/')
//     ) {
//       throw redirect({
//         to: '/sign-in',
//         search: {
//           redirect: location.href,
//         },
//       })
//     }

//     // If user is authenticated and trying to access auth routes (sign-in, sign-up)
//     if (isAuthenticated && isAuthRoute) {
//       throw redirect({
//         to: '/',
//       })
//     }
//   },
//   component: () => {
//     return (
//       <>
//         <Outlet />
//         <Toaster />
//         {import.meta.env.MODE === 'development' && (
//           <>
//             <ReactQueryDevtools buttonPosition='bottom-left' />
//             <TanStackRouterDevtools position='bottom-right' />
//           </>
//         )}
//       </>
//     )
//   },
//   notFoundComponent: NotFoundError,
//   errorComponent: GeneralError,
// })
