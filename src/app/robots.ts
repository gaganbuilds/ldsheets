import { MetadataRoute } from 'next';
import { APP_URL } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/roadmap',
        '/problems/*',
        '/privacy-policy',
        '/terms-and-conditions'
      ],
      disallow: [
        '/admin',
        '/admin/*',
        '/dashboard',
        '/achievements',
        '/analytics',
        '/leaderboard',
        '/profile',
        '/profile/*',
        '/login',
        '/signup',
        '/forgot-password',
        '/api/*'
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
