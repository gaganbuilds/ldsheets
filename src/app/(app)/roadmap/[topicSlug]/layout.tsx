import { Metadata } from 'next';
import { APP_NAME, APP_URL } from '@/constants';
import { getTopicBySlug } from '@/lib/firebase/topics';

export async function generateMetadata({
  params,
}: {
  params: { topicSlug: string };
}): Promise<Metadata> {
  const topic = await getTopicBySlug(params.topicSlug);
  
  if (!topic) {
    return {
      title: `Topic Not Found | ${APP_NAME}`,
    };
  }

  const title = `${topic.title} Roadmap | ${APP_NAME}`;
  const description = topic.description || `Master ${topic.title} with interactive coding problems and tutorials on ${APP_NAME}.`;
  const url = `${APP_URL}/roadmap/${params.topicSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
    },
  };
}

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
