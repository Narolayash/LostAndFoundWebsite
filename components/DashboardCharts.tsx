'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ChartProps {
  lostCount: number;
  foundCount: number;
  categoryData: { name: string; count: number }[];
}

export default function DashboardCharts({ lostCount, foundCount, categoryData }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholders during SSR
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[300px] w-full rounded-xl bg-muted animate-pulse" />
        <div className="h-[300px] w-full rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  // Data for Pie Chart
  const pieData = [
    { name: 'Lost Items', value: lostCount },
    { name: 'Found Items', value: foundCount },
  ];

  // Colors
  const COLORS = ['#ef4444', '#10b981']; // Red for Lost, Emerald for Found

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Pie Chart (Lost vs Found) */}
      <div className="lg:col-span-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Lost vs Found Breakdown</h3>
        <div className="h-[280px] w-full flex items-center justify-center">
          {lostCount === 0 && foundCount === 0 ? (
            <p className="text-sm text-muted-foreground">No data to display charts.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart (Items by Category) */}
      <div className="lg:col-span-7 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Reports by Category</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
