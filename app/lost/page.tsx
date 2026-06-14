import Link from 'next/link';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import ItemCard from '@/components/ItemCard';
import ItemsFilter from '@/components/ItemsFilter';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, HelpCircle } from 'lucide-react';

interface LostPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function LostPage({ searchParams }: LostPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const sort = params.sort || 'latest';

  let dbError = false;
  let isMissingUri = false;
  let items: any[] = [];

  try {
    await dbConnect();
    
    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { type: 'lost', status: 'searching' };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;
    items = await Item.find(filter).sort({ createdAt: sortOrder });
  } catch (error) {
    console.error('Error loading lost items:', error);
    dbError = true;
    isMissingUri = !process.env.MONGODB_URI;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Lost Items Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse through items reported missing by students and staff on campus.
          </p>
        </div>
        <Link href="/post-lost">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Report Lost Item</span>
          </Button>
        </Link>
      </div>

      {dbError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          {isMissingUri 
            ? "Failed to establish database connection. Please check your config in `.env.local`."
            : "Failed to connect to the database. If hosted on a live server, please verify MongoDB Atlas IP Whitelist (allow access from 0.0.0.0/0) and check your database credentials."}
        </div>
      ) : (
        <>
          {/* Interactive Filters */}
          <ItemsFilter />

          {/* Items List */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                <HelpCircle className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No items available</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {query || category
                  ? "We couldn't find any lost items matching your filters. Try clearing search fields."
                  : 'No lost items have been reported yet. Create a report to help search for them!'}
              </p>
              {(query || category) && (
                <Link href="/lost">
                  <Button variant="outline">Reset Filters</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item._id.toString()} item={JSON.parse(JSON.stringify(item))} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
export const revalidate = 0; // Disable static build caching to guarantee live database queries
