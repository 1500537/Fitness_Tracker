import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
// --- ADD THIS IMPORT ---
import { dark } from '@clerk/themes' 

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
 <ClerkProvider 
  publishableKey={PUBLISHABLE_KEY}
  afterSignOutUrl="/"
  appearance={{
    baseTheme: dark,
    variables: {
      colorPrimary: "#FF7222",
      colorBackground: "#0d0d0d",
      colorInputBackground: "#1a1a1a",
      colorInputText: "#ffffff",
      borderRadius: "1rem",
      fontFamily: "'Inter', sans-serif"
    },
    elements: {
      // CARD: Efecto de flotación 3D con borde sutil
      card: "bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all duration-500",
      
      // BOTÓN PRIMARIO: Efecto de elevación (Elevation)
      formButtonPrimary: "bg-gradient-to-r from-[#FF7222] to-[#ff8c4a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,114,34,0.3)] hover:shadow-[0_0_30px_rgba(255,114,34,0.5)] font-black uppercase italic tracking-widest",
      
      // INPUTS: Diseño robusto con foco neón
      formFieldInput: "bg-white/5 border-white/10 focus:border-[#FF7222] focus:ring-1 focus:ring-[#FF7222]/50 transition-all duration-300",
      
      // BOTONES SOCIALES: Glassmorphism puro
      socialButtonsBlockButton: "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300",
      
      headerTitle: "text-2xl font-black uppercase tracking-tighter italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent",
      headerSubtitle: "text-white/40 font-medium",
      dividerLine: "bg-white/10",
      footerActionLink: "text-[#FF7222] hover:text-[#ff8c4a] font-bold transition-colors"
    }
  }}
>
      <App />
    </ClerkProvider>
  </StrictMode>,
)