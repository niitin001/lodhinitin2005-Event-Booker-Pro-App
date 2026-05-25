import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-xl font-bold">EventShooter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's premium event services booking platform. From cinematic wedding photography to high-energy DJ parties — we connect you with the best.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>+91 98765 43210</p>
              <p>hello@eventshooter.in</p>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground transition-colors">Explore All Vendors</Link></li>
              <li><Link href="/category/wedding" className="hover:text-foreground transition-colors">Wedding Services</Link></li>
              <li><Link href="/category/corporate" className="hover:text-foreground transition-colors">Corporate Events</Link></li>
              <li><Link href="/category/fashion" className="hover:text-foreground transition-colors">Fashion Shows</Link></li>
              <li><Link href="/category/party" className="hover:text-foreground transition-colors">Parties & Birthdays</Link></li>
              <li><Link href="/category/drone" className="hover:text-foreground transition-colors">Drone Shoots</Link></li>
              <li><Link href="/category/reel" className="hover:text-foreground transition-colors">Reels & Short Films</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h4 className="font-semibold mb-4">For Vendors</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/register?role=photographer" className="hover:text-foreground transition-colors">Join as a Vendor</Link></li>
              <li><Link href="/ai" className="hover:text-foreground transition-colors">AI Tools for Pros</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing & Fees</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/book" className="hover:text-foreground transition-colors">Book an Event</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EventShooter. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
