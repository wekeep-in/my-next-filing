import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TopBarProvider } from '@/components/top-bar'
import { router } from '@/app'
import '@/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <TopBarProvider>
        <RouterProvider router={router} />
      </TopBarProvider>
    </TooltipProvider>
  </StrictMode>,
)
