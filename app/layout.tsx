import './globals.css'
import { Inter, Source_Serif_4, Crimson_Text, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '../lib/AuthContext'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'], 
  variable: '--font-source-serif-4',
  display: 'swap',
})
const crimsonText = Crimson_Text({ 
  weight: ['400', '600', '700'], 
  style: ['normal', 'italic'], 
  subsets: ['latin'], 
  variable: '--font-crimson-text',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata = {
  title: "Ongba — Grandfather's Memoir",
  description: "A digital archive for grandfather's memoirs — warm, dignified, and timeless.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.variable} ${sourceSerif.variable} ${crimsonText.variable} ${jetbrainsMono.variable} bg-background text-on-background`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
