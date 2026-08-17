import { MetadataRoute } from 'next';
import { APP_URL } from '@/constants';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${APP_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const topics = await getTopics();
    topics.forEach((topic) => {
      if (topic.slug) {
        routes.push({
          url: `${APP_URL}/roadmap/${topic.slug}`,
          lastModified: topic.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    const problems = await getProblems();
    problems.forEach((problem) => {
      routes.push({
        url: `${APP_URL}/problems/${problem.id}`,
        lastModified: problem.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
