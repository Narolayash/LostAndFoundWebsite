import Link from 'next/link';
import { Compass, Shield, Search, MessageCircle, HelpCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 flex flex-col justify-center">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          About Campus Find
        </h1>
        <p className="text-lg text-muted-foreground">
          A modern, open-access, and zero-friction portal to coordinate lost and found items inside the college campus.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-foreground">Zero Friction</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No signup, registration, or logins required. Anyone can quickly view active searches or post reports immediately.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-foreground">Open Communication</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Direct chat linked to every item details screen. Coordinate meets, confirm item identities, and hand over items.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-foreground">Secure & Fast</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Images are uploaded to Cloudinary servers. Real-time updates keep searches active, and logs can be deleted upon completion.
          </p>
        </div>
      </div>

      {/* Workflow Guideline */}
      <div className="rounded-2xl border border-border bg-muted/20 p-8 sm:p-12 space-y-6">
        <h2 className="text-2xl font-extrabold text-foreground text-center">How it works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-2 text-sm">
              1
            </div>
            <h4 className="font-bold text-foreground">Submit Report</h4>
            <p className="text-xs text-muted-foreground">
              Provide description, date, campus location, and attach an image.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-2 text-sm">
              2
            </div>
            <h4 className="font-bold text-foreground">Coordinate Meet</h4>
            <p className="text-xs text-muted-foreground">
              Exchange messages on the item details page to verify ownership and timing.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-2 text-sm">
              3
            </div>
            <h4 className="font-bold text-foreground">Resolve & Delete</h4>
            <p className="text-xs text-muted-foreground">
              Mark the report status as Returned/Recovered, or delete the report entirely.
            </p>
          </div>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-6 border-t border-border">
        <span>Campus Find Utility © 2026. Made for college communities with</span>
        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
      </div>
    </div>
  );
}
