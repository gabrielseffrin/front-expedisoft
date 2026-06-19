import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './index.css'
import App from './App'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="expedisoft-theme">
      <App />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>,
)
