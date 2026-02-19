import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav links={[{ href: "/", label: "Home" }]} />

      {/* Content */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Chosen Connect ("the Platform"), you agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>
                Chosen Connect is a community platform designed for Christians who want to connect, encourage
                one another, and grow in faith together. The Platform provides a space for fellowship,
                encouragement, prayer, and sharing of spiritual experiences.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p>
                To access certain features of the Platform, you may be required to create an account. You are
                responsible for maintaining the confidentiality of your account credentials and for all activities
                that occur under your account. You agree to provide accurate and complete information when
                creating your account.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. User Conduct</h2>
              <p className="mb-2">You agree to use the Platform in a manner consistent with its faith-based purpose. You will not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post content that is hateful, harassing, or discriminatory</li>
                <li>Share false or misleading information</li>
                <li>Impersonate another person or entity</li>
                <li>Use the Platform for commercial solicitation without permission</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Content</h2>
              <p>
                Content shared on Chosen Connect is provided for fellowship and encouragement purposes only.
                It should not be considered professional, medical, legal, or pastoral advice. Users are
                responsible for the content they share and should exercise discernment in all interactions.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
              <p>
                You retain ownership of content you create and share on the Platform. By posting content,
                you grant Chosen Connect a non-exclusive, royalty-free license to display and distribute
                your content within the Platform for the purpose of operating the service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Payments and Subscriptions</h2>
              <p>
                Certain features may require a paid subscription in the future. Payment terms, pricing, and
                refund policies will be clearly communicated before any purchase. Chosen Connect reserves the
                right to modify pricing with reasonable notice to subscribers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Termination</h2>
              <p>
                Chosen Connect reserves the right to suspend or terminate accounts that violate these Terms
                of Service or engage in behavior that is harmful to the community. Users may also delete
                their accounts at any time.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Disclaimer</h2>
              <p>
                The Platform is provided "as is" without warranties of any kind, either express or implied.
                Chosen Connect does not guarantee uninterrupted or error-free service. Content shared by
                users represents their personal views and experiences, not the official position of
                Chosen Connect.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. We will notify users of significant
                changes through the Platform or via email. Continued use of the Platform after changes
                constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
              <p>
                If you have questions about these Terms of Service, please reach out to us through the
                Platform or via the contact information provided on our website.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
