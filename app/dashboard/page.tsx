import Link from 'next/link';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import DashboardCharts from '@/components/DashboardCharts';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  let totalItems = 0;
  let lostItems = 0;
  let foundItems = 0;
  let returnedItems = 0;
  let categoryData: { name: string; count: number }[] = [];
  let dbError = false;

  try {
    await dbConnect();

    // Query stats
    totalItems = await Item.countDocuments({});
    lostItems = await Item.countDocuments({ type: 'lost' });
    foundItems = await Item.countDocuments({ type: 'found' });
    returnedItems = await Item.countDocuments({
      status: { $in: ['recovered', 'returned'] },
    });

    // Query categories data
    const categories = ['Electronics', 'Wallet', 'Keys', 'ID Card', 'Books', 'Accessories'];
    categoryData = await Promise.all(
      categories.map(async (cat) => {
        const count = await Item.countDocuments({
          category: { $regex: new RegExp(`^${cat}$`, 'i') },
        });
        return { name: cat, count };
      })
    );
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    dbError = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview statistics of the Campus Lost & Found database.
          </p>
        </div>
      </div>

      {dbError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          Database connection error. Failed to load dashboard statistics.
        </div>
      ) : (
        <div className="space-y-8 flex-1">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 text-muted-foreground">
                <span className="text-sm font-semibold">Total Submissions</span>
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-3xl font-extrabold tracking-tight text-foreground">{totalItems}</h4>
                <p className="text-xs text-muted-foreground mt-1">All reports posted to date</p>
              </div>
            </div>

            {/* Lost */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 text-muted-foreground">
                <span className="text-sm font-semibold">Lost Items</span>
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-3xl font-extrabold tracking-tight text-foreground">{lostItems}</h4>
                <p className="text-xs text-muted-foreground mt-1">Currently searching items</p>
              </div>
            </div>

            {/* Found */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 text-muted-foreground">
                <span className="text-sm font-semibold">Found Items</span>
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-3xl font-extrabold tracking-tight text-foreground">{foundItems}</h4>
                <p className="text-xs text-muted-foreground mt-1">Waiting for owners or returned</p>
              </div>
            </div>

            {/* Returned */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 text-muted-foreground">
                <span className="text-sm font-semibold">Returned to Owners</span>
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-3xl font-extrabold tracking-tight text-foreground">{returnedItems}</h4>
                <p className="text-xs text-muted-foreground mt-1">Success returns rate: {totalItems > 0 ? Math.round((returnedItems / totalItems) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <DashboardCharts lostCount={lostItems} foundCount={foundItems} categoryData={categoryData} />

          {/* Quick Links Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-2">Management Controls</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Access the directories directly to inspect reported lost or found items.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/lost">
                <Button className="gap-1.5 text-sm">
                  <span>View Lost Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/found">
                <Button variant="outline" className="gap-1.5 text-sm">
                  <span>View Found Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export const revalidate = 0; // Disable static cache to force live dashboard metrics
