import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  { title: "1. Information We Collect", content: "We collect information you provide directly: name, email, phone number, location, and event details when you register or submit a booking. We also collect usage data such as pages visited, search queries, and interaction with vendor profiles. Payment information is handled by Razorpay and is never stored on our servers." },
  { title: "2. How We Use Your Information", content: "We use your information to: connect you with appropriate vendors; process bookings and payments; send booking confirmations and event reminders; improve our platform and personalise your experience; send relevant marketing communications (you can opt out anytime); comply with legal obligations." },
  { title: "3. Information Sharing", content: "We share your information with vendors only when you initiate a booking inquiry. We do not sell your personal data to third parties. We may share anonymised, aggregated data with partners for analytics purposes. We share information with legal authorities when required by law." },
  { title: "4. Data Security", content: "We use industry-standard encryption (SSL/TLS) for all data transmission. Payment data is handled by PCI-DSS compliant processors. We conduct regular security audits and vulnerability assessments. All staff with data access undergo security training." },
  { title: "5. Cookies", content: "We use essential cookies for site functionality and authentication; analytics cookies to understand how users interact with our platform; and marketing cookies (with your consent) for personalised advertising. You can control cookie preferences in your browser settings." },
  { title: "6. Your Rights", content: "You have the right to: access your personal data; correct inaccurate data; request deletion of your data (subject to legal requirements); opt out of marketing communications; data portability. To exercise these rights, contact privacy@eventshooter.in." },
  { title: "7. Data Retention", content: "We retain account data as long as your account is active. Booking records are retained for 7 years for tax and legal compliance. You can request data deletion for non-essential data at any time." },
  { title: "8. Third-Party Links", content: "Our platform may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their privacy policies before sharing any personal information." },
  { title: "9. Children's Privacy", content: "EventShooter is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us information, please contact us immediately." },
  { title: "10. Contact Us", content: "For privacy-related queries, contact our Data Protection Officer at privacy@eventshooter.in or write to: EventShooter Privacy Team, Level 12, Platina Business Park, Andheri East, Mumbai 400093." },
];

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-primary-foreground/80">Last updated: January 1, 2025</p>
        </section>
        <section className="py-14 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4">
            <p className="text-muted-foreground mb-8 leading-relaxed">Your privacy is important to us. This policy explains how EventShooter collects, uses, and protects your personal information.</p>
            <div className="space-y-8">
              {SECTIONS.map(s => (
                <div key={s.title}>
                  <h2 className="font-serif text-xl font-bold mb-2">{s.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
