import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeDepth | Terms & Conditions',
  description: 'Terms and Conditions for using the CodeDepth educational platform.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <LandingNavbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 border-b border-border/50 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms & Conditions</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Please read these terms carefully before using CodeDepth.
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
                  <a href="#eligibility" className="hover:text-primary transition-colors">2. Eligibility</a>
                  <a href="#account-registration" className="hover:text-primary transition-colors">3. Account Registration</a>
                  <a href="#platform-usage" className="hover:text-primary transition-colors">4. Platform Usage</a>
                  <a href="#coding-environment" className="hover:text-primary transition-colors">5. Coding Environment</a>
                  <a href="#educational-content" className="hover:text-primary transition-colors">6. Educational Content</a>
                  <a href="#user-content-code" className="hover:text-primary transition-colors">7. User Content / Code</a>
                  <a href="#intellectual-property" className="hover:text-primary transition-colors">8. Intellectual Property</a>
                  <a href="#third-party-services" className="hover:text-primary transition-colors">9. Third-Party Services</a>
                  <a href="#pro-features" className="hover:text-primary transition-colors">10. Pro Features</a>
                  <a href="#availability" className="hover:text-primary transition-colors">11. Availability</a>
                  <a href="#disclaimer" className="hover:text-primary transition-colors">12. Disclaimer</a>
                  <a href="#limitation-of-liability" className="hover:text-primary transition-colors">13. Limitation of Liability</a>
                  <a href="#suspension-termination" className="hover:text-primary transition-colors">14. Suspension & Termination</a>
                  <a href="#changes-to-platform" className="hover:text-primary transition-colors">15. Changes to Platform</a>
                  <a href="#changes-to-terms" className="hover:text-primary transition-colors">16. Changes to Terms</a>
                  <a href="#governing-law" className="hover:text-primary transition-colors">17. Governing Law</a>
                  <a href="#contact" className="hover:text-primary transition-colors">18. Contact</a>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="flex-1 prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary">
              
              <section id="introduction">
                <h2>1. Introduction</h2>
                <p>
                  CodeDepth is an educational and coding-learning platform operated by LearnDepth Academy LLP. By accessing or using CodeDepth, you agree to be bound by these Terms & Conditions. If you do not agree to these Terms, you should discontinue use of the platform immediately.
                </p>
              </section>

              <section id="eligibility">
                <h2>2. Eligibility</h2>
                <p>
                  By using CodeDepth, you represent that you are providing accurate information and will use the platform lawfully. If you are a minor under applicable law, you must obtain the consent of a parent or legal guardian to use the service.
                </p>
              </section>

              <section id="account-registration">
                <h2>3. Account Registration</h2>
                <p>To use certain features of CodeDepth, you must register for an account. You are responsible for:</p>
                <ul>
                  <li>Providing accurate and complete registration information.</li>
                  <li>Maintaining the security and confidentiality of your credentials.</li>
                  <li>All activity performed through your account.</li>
                </ul>
                <p>
                  You must notify CodeDepth immediately if you believe your account has been compromised.
                </p>
              </section>

              <section id="platform-usage">
                <h2>4. Platform Usage</h2>
                <p>You may use CodeDepth for lawful educational and learning purposes. Prohibited activities include, but are not limited to:</p>
                <ul>
                  <li>Unauthorized access to the platform or underlying systems.</li>
                  <li>Attempting to bypass platform restrictions or access controls.</li>
                  <li>Abusing APIs or overloading infrastructure.</li>
                  <li>Scraping content where prohibited.</li>
                  <li>Uploading malicious code or harmful content.</li>
                  <li>Interfering with other users or attempting to access another user's account.</li>
                  <li>Manipulating XP, progress, streaks, badges, or leaderboard rankings.</li>
                  <li>Abusing coding execution infrastructure.</li>
                </ul>
              </section>

              <section id="coding-environment">
                <h2>5. Coding Environment</h2>
                <p>
                  CodeDepth may provide coding environments and execution features. Execution availability depends on supported languages, technical limitations, security restrictions, usage limits, and infrastructure availability. CodeDepth does not guarantee that every program will execute successfully. You must not use the coding environment for malicious, harmful, or unauthorized activities.
                </p>
              </section>

              <section id="educational-content">
                <h2>6. Educational Content</h2>
                <p>
                  CodeDepth provides educational material, roadmaps, problems, examples, tutorials, and related resources. This content is provided solely for educational purposes. We do not guarantee employment, interview success, salary outcomes, certification, or specific academic results.
                </p>
              </section>

              <section id="user-content-code">
                <h2>7. User Content / Code</h2>
                <p>
                  Users retain ownership of content and code they submit, subject to the rights and permissions necessary for CodeDepth to operate the service. By submitting code, you grant CodeDepth a limited license only to the extent technically or operationally necessary to host, process, execute, display, or otherwise provide the service functionality to you.
                </p>
              </section>

              <section id="intellectual-property">
                <h2>8. Intellectual Property</h2>
                <p>
                  CodeDepth branding, UI, platform software, original content, graphics, logos, and other proprietary materials belong to LearnDepth Academy LLP or their respective licensors unless otherwise stated. Users may not copy, reproduce, redistribute, reverse engineer, or commercially exploit protected platform content except where expressly permitted by law or with our prior written permission.
                </p>
              </section>

              <section id="third-party-services">
                <h2>9. Third-Party Services and Links</h2>
                <p>
                  CodeDepth may use or link to third-party services, including authentication providers, infrastructure, coding execution systems, and external problem resources. These third-party services may have their own terms and privacy policies. CodeDepth is not responsible for third-party websites or services to the fullest extent permitted by applicable law.
                </p>
              </section>

              <section id="pro-features">
                <h2>10. Pro Features</h2>
                <p>
                  CodeDepth may introduce paid or "Pro" features. At present, if certain Pro functionality is visually designated but not commercially available, please note that availability and pricing models may be introduced at a later date. We do not claim that you have purchased any services unless actual payment functionality and transactions are processed.
                </p>
              </section>

              <section id="availability">
                <h2>11. Availability</h2>
                <p>
                  While we aim to maintain a reliable service, CodeDepth does not guarantee continuous or uninterrupted availability. Maintenance, updates, outages, security events, infrastructure issues, or third-party dependencies may temporarily affect access to the platform.
                </p>
              </section>

              <section id="disclaimer">
                <h2>12. Disclaimer</h2>
                <p>
                  Educational information and platform services are provided on an "as is" and "as available" basis, to the maximum extent permitted by law. We disclaim all warranties, express or implied, regarding the accuracy, completeness, or reliability of the platform, without excluding any legally non-excludable rights you may have under consumer protection laws.
                </p>
              </section>

              <section id="limitation-of-liability">
                <h2>13. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable law, LearnDepth Academy LLP shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of or inability to use the platform.
                </p>
              </section>

              <section id="suspension-termination">
                <h2>14. Suspension and Termination</h2>
                <p>
                  CodeDepth may suspend or terminate your account where reasonably necessary for violations of these Terms, security concerns, abuse, unlawful or fraudulent activity, or operational/legal requirements. You may stop using the service at any time.
                </p>
              </section>

              <section id="changes-to-platform">
                <h2>15. Changes to the Platform</h2>
                <p>
                  CodeDepth is continuously evolving. We may modify, improve, remove, or introduce new features at any time. Material changes to these Terms or the platform will be communicated appropriately.
                </p>
              </section>

              <section id="changes-to-terms">
                <h2>16. Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. Your continued use of the platform after changes become effective constitutes your acceptance of the revised Terms.
                </p>
              </section>

              <section id="governing-law">
                <h2>17. Governing Law</h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms shall be subject to the jurisdiction of the courts located in:
                </p>
                <p className="font-semibold text-muted-foreground">
                  [REGISTERED OFFICE / JURISDICTION TO BE CONFIRMED]
                </p>
              </section>

              <section id="contact">
                <h2>18. Contact</h2>
                <p>
                  If you have any questions regarding these Terms & Conditions, please contact us at:
                </p>
                <p className="font-semibold text-muted-foreground">
                  [LEGAL CONTACT EMAIL TO BE ADDED]
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
