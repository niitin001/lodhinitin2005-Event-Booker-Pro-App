import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold">EventShooter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium event photography booking platform. Cinematic memories for your most important moments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground">Explore Photographers</Link></li>
              <li><Link href="/explore?eventType=wedding" className="hover:text-foreground">Wedding Photography</Link></li>
              <li><Link href="/explore?eventType=corporate" className="hover:text-foreground">Corporate Events</Link></li>
              <li><Link href="/explore?eventType=fashion" className="hover:text-foreground">Fashion Shoots</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Creatives</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register?role=photographer" className="hover:text-foreground">Join as a Photographer</Link></li>
              <li><Link href="/ai" className="hover:text-foreground">AI Tools for Pros</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing & Fees</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EventShooter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
