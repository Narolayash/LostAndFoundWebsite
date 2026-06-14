import Link from 'next/link';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import ItemCard from '@/components/ItemCard';
import HomeSearch from '@/components/HomeSearch';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, HelpCircle, Archive, CheckCircle, ArrowRight } from 'lucide-react';

export default async function Home() {
  let totalLost = 0;
  let totalFound = 0;
  let totalReturned = 0;
  let latestItems: any[] = [];
  let dbError = false;
  let isMissingUri = false;

  try {
    await dbConnect();
    totalLost = await Item.countDocuments({ type: 'lost' });
    totalFound = await Item.countDocuments({ type: 'found' });

    // Items with "recovered" or "returned" status
    totalReturned = await Item.countDocuments({
      status: { $in: ['recovered', 'returned'] },
    });

    // Get latest 4 active items
    latestItems = await Item.find({
      $or: [
        { type: 'lost', status: 'searching' },
        { type: 'found', status: 'waiting' },
      ],
    }).sort({ createdAt: -1 }).limit(4);
  } catch (error) {
    console.error('Database connection error in home page:', error);
    dbError = true;
    isMissingUri = !process.env.MONGODB_URI;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 bg-radial from-primary/10 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto mb-6 leading-tight">
            Lost something? <br />
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">We will help you find it.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            A simple, open-access platform for students, faculty, and campus staff. Report lost belongings, post found items, and coordinate returns directly in real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link href="/post-lost">
              <Button size="lg" className="gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>Report Lost Item</span>
              </Button>
            </Link>
            <Link href="/post-found">
              <Button size="lg" variant="outline" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                <span>Report Found Item</span>
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          {!dbError && <HomeSearch />}
        </div>
      </section>

      {/* Database Setup State */}
      {dbError ? (
        <section className="py-12 bg-muted/40 flex-1 flex items-center">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-md">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                ⚠️
              </div>
              {isMissingUri ? (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">Configure MongoDB Connection</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please create a <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> file in the project root directory and define the connection string:
                  </p>
                  <pre className="bg-muted/80 p-3 rounded-lg text-left text-xs font-mono mb-6 overflow-x-auto text-muted-foreground select-all">
                    MONGODB_URI=mongodb+srv://...
                  </pre>
                  <p className="text-xs text-muted-foreground">
                    Once variables are set, restart your development server to establish the connection.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-2">Database Connection Error</h2>
                  <p className="text-sm text-muted-foreground mb-4 text-left">
                    The <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">MONGODB_URI</code> environment variable is set, but the server failed to connect to the database.
                  </p>
                  <div className="text-left text-xs text-muted-foreground space-y-2 mb-6">
                    <p className="font-semibold text-foreground">Possible causes & solutions:</p>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>
                        <strong>IP Whitelist / Network Access:</strong> If hosted on Vercel/live server, ensure MongoDB Atlas permits access from anywhere (<code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">0.0.0.0/0</code>) because live servers use dynamic IPs.
                      </li>
                      <li>
                        <strong>Incorrect Credentials:</strong> Verify username, password, or database name in the connection string.
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Once fixed, please restart your server or redeploy your website.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Stats Cards Section */}
          <section className="py-12 bg-muted/30 border-y border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Stat 1 */}
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="rounded-lg bg-amber-500/15 p-3 text-amber-600 dark:text-amber-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Lost Items</p>
                    <h4 className="text-2xl font-bold tracking-tight text-foreground">{totalLost}</h4>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="rounded-lg bg-blue-500/15 p-3 text-blue-600 dark:text-blue-400">
                    <Archive className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Found Items</p>
                    <h4 className="text-2xl font-bold tracking-tight text-foreground">{totalFound}</h4>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="rounded-lg bg-emerald-500/15 p-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Items Returned</p>
                    <h4 className="text-2xl font-bold tracking-tight text-foreground">{totalReturned}</h4>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Posts Section */}
          <section className="py-16 flex-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Latest Active Reports</h2>
                  <p className="text-sm text-muted-foreground mt-1">Recently posted lost and found items on campus.</p>
                </div>
                {latestItems.length > 0 && (
                  <Link href="/lost" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    <span>Browse All</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {latestItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center max-w-md mx-auto">
                  <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
                    🔍
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No items available</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    There are currently no active lost or found reports on campus.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/post-lost">
                      <Button size="sm">Report Lost</Button>
                    </Link>
                    <Link href="/post-found">
                      <Button variant="outline" size="sm">Report Found</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {latestItems.map((item) => (
                    <ItemCard key={item._id.toString()} item={JSON.parse(JSON.stringify(item))} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
