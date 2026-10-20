import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// As fontes entram pelo entry, e nao por @import no global.css: o Tailwind v4
// resolve @import de pacote por conta propria e emite os url(./files/*.woff2)
// sem reescrever, entao o Vite nao reconhece os arquivos como assets e o build
// sai sem nenhuma fonte. Vindo por aqui, o pipeline de CSS do Vite reescreve as
// URLs e emite os .woff2 no dist.
import '@fontsource-variable/geist/index.css'
// Archivo e usada so pelo wordmark da logo, no eixo de largura (wdth).
import '@fontsource-variable/archivo/wdth.css'
import './styles/global.css'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
)
