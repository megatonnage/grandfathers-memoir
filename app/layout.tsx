import './globals.css'
import { Inter, Source_Serif_4, Crimson_Text, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '../lib/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif-4' })
const crimsonText = Crimson_Text({ weight: ['400', '600', '700'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-crimson-text' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata = {
  title: "Grandfather's Memoir",
  description: "A temporal palimpsest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} ${crimsonText.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
