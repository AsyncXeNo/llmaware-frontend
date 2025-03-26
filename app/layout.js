import { Poppins, Roboto, Inter } from 'next/font/google'

import './globals.css'


const poppins = Poppins({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-poppins',
    display: 'swap',
})


const roboto = Roboto({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-roboto',
    display: 'swap',
})


const inter = Inter({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})


export const metadata = {
    title: 'LLMAware',
    description: 'AI news, updates, and more.'
}


function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={`${poppins.variable} ${roboto.variable} ${inter.variable}`}>
                {children}
            </body>
        </html>
    )
}


export default RootLayout