import { Metadata } from 'next';
import { APP_NAME, APP_URL } from '@/constants';
import { getProblem } from '@/lib/firebase/problems';

export async function generateMetadata({
  params,
}: {
  params: { problemId: string };
}): Promise<Metadata> {
  const problem = await getProblem(params.problemId);
  
  if (!problem) {
    return {
      title: `Problem Not Found | ${APP_NAME}`,
    };
  }

  const title = `${problem.title} — Coding Problem | ${APP_NAME}`;
  let description = `Solve the ${problem.title} problem. Interactive coding challenge with test cases and examples on ${APP_NAME}.`;
  
  if (problem.description) {
    const plainText = problem.description.replace(/<[^>]+>/g, '').trim();
    if (plainText) {
      description = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }
  }

  const url = `${APP_URL}/problems/${params.problemId}`;

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

export default async function ProblemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { problemId: string };
}) {
  const problem = await getProblem(params.problemId);
  
  let breadcrumbSchema = null;
  if (problem) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Roadmaps",
          item: `${APP_URL}/roadmap`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: problem.title,
          item: `${APP_URL}/problems/${params.problemId}`,
        },
      ],
    };
  }

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  );
}
