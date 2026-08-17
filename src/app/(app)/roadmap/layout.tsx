import { Metadata } from 'next';
import { APP_NAME, APP_URL } from '@/constants';

export const metadata: Metadata = {
  title: `DSA Roadmap & Learning Paths | ${APP_NAME}`,
  description: `Master Data Structures, Algorithms, and System Design with our interactive, structured roadmaps. Track your progress, earn XP, and unlock badges.`,
  alternates: {
    canonical: `${APP_URL}/roadmap`,
  },
  openGraph: {
    title: `DSA Roadmap & Learning Paths | ${APP_NAME}`,
    description: `Master Data Structures, Algorithms, and System Design with our interactive, structured roadmaps. Track your progress, earn XP, and unlock badges.`,
    url: `${APP_URL}/roadmap`,
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
