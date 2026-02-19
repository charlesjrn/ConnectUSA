import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav links={[{ href: "/", label: "Home" }]} />

      {/* Content */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and email address when you join our waitlist</li>
                <li>Account information when you create a profile (name, email, profile details)</li>
                <li>Content you share on the Platform (posts, prayer requests, testimonies)</li>
                <li>Communications you send to us</li>
              </ul>
              <p className="mt-3">
                We also automatically collect certain information when you use the Platform, including
                your IP address, browser type, and pages visited, through our analytics service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve the Platform</li>
                <li>Send you updates about the Platform launch and new features</li>
                <li>Respond to your questions and requests</li>
                <li>Monitor and analyze usage patterns to improve user experience</li>
                <li>Protect the safety and security of our users and the Platform</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-3">
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in operating the Platform</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In connection with a merger, acquisition, or sale of assets (with notice)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>
                We take reasonable measures to protect your personal information from unauthorized access,
                alteration, disclosure, or destruction. However, no method of transmission over the Internet
                or electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Export your data in a portable format</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies and Analytics</h2>
              <p>
                We use privacy-friendly analytics (Umami) to understand how visitors use our Platform.
                This service collects anonymized data and does not use cookies for tracking. We do not
                use third-party advertising cookies or trackers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Email Communications</h2>
              <p>
                If you join our waitlist or create an account, we may send you emails about Platform
                updates, new features, and community news. You can unsubscribe from these emails at
                any time by clicking the unsubscribe link in any email or contacting us directly.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Children's Privacy</h2>
              <p>
                Chosen Connect is not intended for children under the age of 13. We do not knowingly
                collect personal information from children under 13. If we become aware that we have
                collected such information, we will take steps to delete it.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new policy on this page and updating the "Last updated" date. We encourage
                you to review this policy periodically.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please
                contact us through the Platform or via the contact information provided on our website.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
