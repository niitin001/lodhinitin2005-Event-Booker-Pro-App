import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  { title: "1. Acceptance of Terms", content: "By accessing or using EventShooter (the \"Platform\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform. These terms apply to all users, including customers, vendors, and visitors." },
  { title: "2. Description of Service", content: "EventShooter is an online marketplace that connects customers with event service providers (vendors) including photographers, videographers, decorators, DJs, makeup artists, and other event professionals. We facilitate the connection but are not party to the service agreement between customers and vendors." },
  { title: "3. User Accounts", content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration. EventShooter reserves the right to suspend accounts that violate our policies." },
  { title: "4. Vendor Responsibilities", content: "Vendors listed on EventShooter must maintain accurate portfolio information, respond to booking requests within 24 hours, deliver services as described and agreed upon, hold appropriate licenses and insurance where applicable, and comply with all applicable laws and regulations." },
  { title: "5. Booking & Payments", content: "Bookings are confirmed only upon receipt of the advance payment. All payments are processed securely. Prices listed are indicative; final pricing is agreed upon between the customer and vendor. EventShooter charges a platform fee (see Pricing page) on completed transactions." },
  { title: "6. Cancellation & Refunds", content: "Cancellation policies vary by vendor and are displayed on each vendor's profile. Generally: cancellations 7+ days before the event qualify for a full refund; 3-7 days qualify for a 50% refund; within 72 hours, no refund is applicable unless the vendor cancels. EventShooter is not liable for vendor cancellations but will assist in finding alternatives." },
  { title: "7. Intellectual Property", content: "Vendors retain ownership of their creative work. By listing on EventShooter, vendors grant us a non-exclusive license to use their portfolio images for promotional purposes. Customers may not reproduce or redistribute vendors' work without written consent." },
  { title: "8. Prohibited Activities", content: "Users may not: circumvent the platform to book vendors directly after initial contact through EventShooter; post false reviews or misleading information; use the platform for illegal activities; harass or threaten other users or vendors; violate any applicable laws or regulations." },
  { title: "9. Limitation of Liability", content: "EventShooter's liability is limited to the platform fee paid on a transaction. We are not liable for the quality of vendor services, event outcomes, losses arising from vendor cancellations, or any indirect or consequential damages." },
  { title: "10. Changes to Terms", content: "EventShooter reserves the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated terms." },
  { title: "11. Governing Law", content: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra." },
  { title: "12. Contact", content: "For questions about these terms, please contact us at legal@eventshooter.in or +91 98765 43210." },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-primary-foreground/80">Last updated: January 1, 2025</p>
        </section>
        <section className="py-14 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="prose dark:prose-invert max-w-none space-y-8">
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
