import Link from 'next/link';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import ItemDetailsClient from '@/components/ItemDetailsClient';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const { id } = await params;
  
  let item = null;
  let dbError = false;

  try {
    await dbConnect();
    item = await Item.findById(id);
  } catch (error) {
    console.error('Error fetching item details:', error);
    dbError = true;
  }

  // Database Connection Error Screen
  if (dbError) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          Database connection error. Failed to load item details.
        </div>
      </div>
    );
  }

  // 404 Not Found Screen
  if (!item) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
          <Search className="h-8 w-8 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Item Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The item report you are looking for does not exist or has been removed.
        </p>
        <Link href="/lost">
          <Button>Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <ItemDetailsClient initialItem={JSON.parse(JSON.stringify(item))} />
  );
}
export const revalidate = 0; // Disable static cache to force live database checks
