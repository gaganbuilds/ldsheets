import { Metadata } from 'next';
import { APP_NAME, APP_URL } from '@/constants';
import { getTopicBySlug } from '@/lib/firebase/topics';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const topic = await getTopicBySlug(resolvedParams.topicSlug);
  
  if (!topic) {
    return {
      title: `Topic Not Found | ${APP_NAME}`,
    };
  }

  const title = `${topic.title} Roadmap | ${APP_NAME}`;
  const description = topic.description || `Master ${topic.title} with interactive coding problems and tutorials on ${APP_NAME}.`;
  const url = `${APP_URL}/roadmap/${resolvedParams.topicSlug}`;

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
