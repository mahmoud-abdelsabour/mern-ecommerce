import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartDrawerProvider } from './contexts/CartDrawerProvider.jsx'
import { AppToaster } from './components/AppToaster.jsx'
import { AppSkeletonProvider } from './components/AppSkeletonProvider.jsx'
import { appSystem } from './theme/system.js'
import { ColorModeProvider } from './theme/color-mode.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <ChakraProvider value={appSystem}>
        <AppSkeletonProvider>
          <Router>
            <QueryClientProvider client={queryClient}>
              <CartDrawerProvider>
                <App />
              </CartDrawerProvider>
              <AppToaster />
            </QueryClientProvider>
          </Router>
        </AppSkeletonProvider>
      </ChakraProvider>
    </ColorModeProvider>
  </StrictMode>,
)
