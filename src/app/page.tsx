import { Metadata } from 'next';
import HomeClient from '@/components/landing/HomeClient';
import { APP_NAME, APP_DESCRIPTION, APP_URL } from '@/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} — Master DSA, Coding & Problem Solving`,
  description: APP_DESCRIPTION,
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: `${APP_NAME} — Master DSA, Coding & Problem Solving`,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return <HomeClient />;
}
