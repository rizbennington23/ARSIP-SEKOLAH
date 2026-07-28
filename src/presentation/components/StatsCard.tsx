/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  colorTheme: 'blue' | 'emerald' | 'amber' | 'indigo';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme,
}) => {
  const themeStyles = {
    blue: {
      bgIcon: 'bg-blue-100 text-blue-700',
      border: 'border-blue-200/80',
      textVal: 'text-blue-900',
    },
    emerald: {
      bgIcon: 'bg-emerald-100 text-emerald-700',
      border: 'border-emerald-200/80',
      textVal: 'text-emerald-900',
    },
    amber: {
      bgIcon: 'bg-amber-100 text-amber-800',
      border: 'border-amber-200/80',
      textVal: 'text-amber-900',
    },
    indigo: {
      bgIcon: 'bg-indigo-100 text-indigo-700',
      border: 'border-indigo-200/80',
      textVal: 'text-indigo-900',
    },
  };

  const currentTheme = themeStyles[colorTheme];

  return (
    <div
      className={`bg-white rounded-2xl p-5 border ${currentTheme.border} shadow-xs hover:shadow-md transition-all flex items-start justify-between gap-4`}
    >
      <div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`text-2xl font-black ${currentTheme.textVal} mt-1.5`}>
          {value}
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${currentTheme.bgIcon} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
