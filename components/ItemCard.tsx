'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatDate } from '@/lib/utils';

export interface ItemCardProps {
  item: {
    _id: string;
    title: string;
    category: string;
    type: 'lost' | 'found';
    description: string;
    location: string;
    date: string | Date;
    personName: string;
    phone: string;
    imageUrl: string;
    status: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  // Determine status color/text
  const getStatusBadge = () => {
    switch (item.status.toLowerCase()) {
      case 'searching':
        return <Badge variant="warning">Searching</Badge>;
      case 'recovered':
        return <Badge variant="success">Recovered</Badge>;
      case 'waiting':
      case 'waiting for owner':
        return <Badge variant="info">Waiting for Owner</Badge>;
      case 'returned':
        return <Badge variant="success">Returned</Badge>;
      default:
        return <Badge variant="secondary">{item.status}</Badge>;
    }
  };

  const isLost = item.type === 'lost';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Type badge overlay */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className={isLost ? "bg-red-500/90 text-white border-transparent" : "bg-emerald-500/90 text-white border-transparent"}>
          {isLost ? 'Lost' : 'Found'}
        </Badge>
      </div>

      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.category}</span>
          {getStatusBadge()}
        </div>

        <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1 mb-2">
          {item.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        {/* Location & Date */}
        <div className="space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{isLost ? 'Lost at' : 'Found at'}: {item.location}</span>
          </div>
          <div className="flex items-center gap-1.5" suppressHydrationWarning>
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span>{isLost ? 'Lost on' : 'Found on'}: {formatDate(item.date)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3">
          <Link href={`/items/${item._id}`}>
            <Button className="w-full flex items-center justify-center gap-1" variant="outline">
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
