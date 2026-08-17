import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/landing/Footer';
import type { Metadata } from 'next';
import { APP_URL, APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: `Privacy Policy for ${APP_NAME} - Learn how we collect, use, and protect your data.`,
  alternates: {
    canonical: `${APP_URL}/privacy-policy`,
  },
  openGraph: {
    title: `Privacy Policy | ${APP_NAME}`,
    description: `Privacy Policy for ${APP_NAME} - Learn how we collect, use, and protect your data.`,
    url: `${APP_URL}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <LandingNavbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 border-b border-border/50 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Your privacy matters to us. This policy explains how CodeDepth collects, uses, stores, and protects information.
            </p>
            <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-muted-foreground/80">
              <p>Effective Date: 17 August 2026</p>
              <p>Last Updated: 17 August 2026</p>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Table of Contents - Sticky on Desktop */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24 bg-card/50 border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Table of Contents</h3>
                <nav className="flex flex-col gap-2 text-sm">
                  <a href="#introduction" className="hover:text-primary transition-colors">1. Introduction</a>
                  <a href="#information-we-collect" className="hover:text-primary transition-colors">2. Information We Collect</a>
                  <a href="#how-we-use" className="hover:text-primary transition-colors">3. How We Use Information</a>
                  <a href="#legal-basis" className="hover:text-primary transition-colors">4. Legal Basis & Consent</a>
                  <a href="#data-minimization" className="hover:text-primary transition-colors">5. Data Minimization</a>
                  <a href="#data-sharing" className="hover:text-primary transition-colors">6. Data Sharing</a>
                  <a href="#data-retention" className="hover:text-primary transition-colors">7. Data Retention</a>
                  <a href="#data-security" className="hover:text-primary transition-colors">8. Data Security</a>
                  <a href="#user-rights" className="hover:text-primary transition-colors">9. User Rights</a>
                  <a href="#account-deletion" className="hover:text-primary transition-colors">10. Account Deletion</a>
                  <a href="#childrens-privacy" className="hover:text-primary transition-colors">11. Children's Privacy</a>
                  <a href="#cookies" className="hover:text-primary transition-colors">12. Cookies & Storage</a>
                  <a href="#third-party-links" className="hover:text-primary transition-colors">13. Third-Party Links</a>
                  <a href="#policy-changes" className="hover:text-primary transition-colors">14. Policy Changes</a>
                  <a href="#contact" className="hover:text-primary transition-colors">15. Contact Us</a>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="flex-1 prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary">
              
              <section id="introduction">
                <h2>1. Introduction</h2>
                <p>
                  LearnDepth Academy LLP operates CodeDepth. This Privacy Policy explains how personal information is processed when users access or use the CodeDepth educational platform.
                </p>
              </section>

              <section id="information-we-collect">
                <h2>2. Information We Collect</h2>
                <p>We collect information reasonably necessary to provide you with the best educational experience. The categories of information we collect include:</p>
                <ul>
                  <li><strong>Account Information:</strong> Name, email address, profile information (such as username and bio), and authentication identifiers.</li>
                  <li><strong>Learning Activity:</strong> Problems attempted, completion progress, XP earned, activity streaks, badges unlocked, bookmarks, and roadmap activity.</li>
                  <li><strong>Notes:</strong> Any personal study notes you create on the platform.</li>
                </ul>
                <p>
                  <em>Note on Coding Activity:</em> CodeDepth provides stateless code execution environments. Your submitted code and execution results are processed in real-time but are <strong>not stored</strong> permanently in our databases.
                </p>
              </section>

              <section id="how-we-use">
                <h2>3. How We Use Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul>
                  <li>To create and manage your user account.</li>
                  <li>To authenticate users and secure accounts.</li>
                  <li>To provide learning functionality, save progress, and maintain bookmarks.</li>
                  <li>To track educational metrics like XP, streaks, and badges.</li>
                  <li>To improve platform performance and reliability.</li>
                  <li>To prevent abuse and maintain the security of our infrastructure.</li>
                  <li>To communicate important service-related information.</li>
                </ul>
              </section>

              <section id="legal-basis">
                <h2>4. Legal Basis & Consent</h2>
                <p>
                  We process personal information in compliance with applicable Indian data protection frameworks, including the Digital Personal Data Protection Act, 2023. By using CodeDepth, you consent to the processing of your data as described in this policy. Where applicable law provides, you may withdraw your consent; however, doing so may limit our ability to provide core platform services that require such processing.
                </p>
              </section>

              <section id="data-minimization">
                <h2>5. Data Minimization</h2>
                <p>
                  CodeDepth is committed to data minimization principles. We aim to collect and process only the information that is reasonably necessary for providing our educational services and maintaining platform security.
                </p>
              </section>

              <section id="data-sharing">
                <h2>6. Data Sharing</h2>
                <p>We do not sell your personal data. We may share necessary information with trusted third-party service providers who assist us in operating the platform, including:</p>
                <ul>
                  <li>Infrastructure and database providers (e.g., Firebase, Google Cloud).</li>
                  <li>Authentication providers.</li>
                  <li>Code execution service providers.</li>
                </ul>
              </section>

              <section id="data-retention">
                <h2>7. Data Retention</h2>
                <p>
                  Personal information is retained only for as long as reasonably necessary to fulfill the purposes described in this policy, comply with legal requirements, maintain security, resolve disputes, and support legitimate operational needs.
                </p>
              </section>

              <section id="data-security">
                <h2>8. Data Security</h2>
                <p>
                  We implement reasonable technical and organizational safeguards to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please note that no online system or electronic storage mechanism can guarantee absolute security.
                </p>
              </section>

              <section id="user-rights">
                <h2>9. User Rights</h2>
                <p>
                  Subject to applicable law, you may have rights regarding your personal information, including the right to access your data, request correction of inaccurate information, and request the deletion/erasure of your personal data. You can manage certain profile details directly within the CodeDepth application.
                </p>
              </section>

              <section id="account-deletion">
                <h2>10. Account Deletion</h2>
                <p>
                  Users may contact us using the contact details provided below to request account deletion, subject to applicable legal and operational requirements. Upon verified request, we will initiate the deletion of your account and associated personal data from our active systems.
                </p>
              </section>

              <section id="childrens-privacy">
                <h2>11. Children's Privacy</h2>
                <p>
                  If you are a minor under the applicable legal age in your jurisdiction, you must have the consent of a parent or legal guardian to use CodeDepth. We do not knowingly collect personal information from children without appropriate safeguards as required by law.
                </p>
              </section>

              <section id="cookies">
                <h2>12. Cookies & Local Storage</h2>
                <p>
                  We use strictly necessary local storage mechanisms (such as IndexedDB and LocalStorage via Firebase Authentication) solely to persist your authentication session and ensure secure access to your account. We do not use third-party tracking cookies for marketing purposes.
                </p>
              </section>

              <section id="third-party-links">
                <h2>13. Third-Party Links</h2>
                <p>
                  CodeDepth may contain links to external websites, reference materials, or third-party resources. The privacy practices of those external entities are governed by their own privacy policies, and we are not responsible for their content or practices.
                </p>
              </section>

              <section id="policy-changes">
                <h2>14. Policy Changes</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or relevant laws. When we make material changes, we will update the "Last Updated" date at the top of this policy.
                </p>
              </section>

              <section id="contact">
                <h2>15. Contact Us</h2>
                <p>
                  If you have questions, concerns, or grievances regarding this Privacy Policy or our data practices, please contact us at:
                </p>
                <p className="font-semibold">
                  [PRIVACY / GRIEVANCE CONTACT EMAIL TO BE ADDED]
                </p>
              </section>

            </article>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
