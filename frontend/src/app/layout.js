import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const metadata = {
  title: 'TebaHouse · Music Producer',
  description: 'TebaHouse — Music producer, beatmaker, mix & mastering. Verona, IT.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
