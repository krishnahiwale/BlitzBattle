import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'BlitzBattle — Learn. Battle. Prove it.',description:'Two-minute learning battles. Real knowledge, friendly competition, and verifiable Monad Testnet rewards.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
