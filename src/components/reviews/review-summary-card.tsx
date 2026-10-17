'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewSummaryCardProps {
  stats: {
    totalSent: number;
    totalSubmitted: number;
    averageRating: number;
    distribution: Record<string, number>;
  };
}

export function ReviewSummaryCard({ stats }: ReviewSummaryCardProps) {
  const { totalSent, totalSubmitted, averageRating, distribution } = stats;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{averageRating}</div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">({totalSubmitted} reviews)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Requests Sent</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalSent}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalSubmitted} submitted ({totalSent > 0 ? Math.round((totalSubmitted / totalSent) * 100) : 0}% response rate)
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[String(stars)] || 0;
            const percentage = totalSubmitted > 0 ? (count / totalSubmitted) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right font-medium">{stars}</span>
                <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
