'use client';

import { useState } from 'react';
import { VehicleCard } from './VehicleCard';
import type { VehicleRow, VehicleType } from '@/types/database.types';

interface FleetGridProps {
  vehicles: VehicleRow[];
}

type FilterTab = 'all' | VehicleType;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All Fleet' },
  { value: 'car', label: 'Cars' },
  { value: 'motorcycle', label: 'Motorcycles' },
];

export function FleetGrid({ vehicles }: FleetGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered =
    activeTab === 'all'
      ? vehicles
      : vehicles.filter((v) => v.vehicle_type === activeTab);

  return (
    <div>
      {/* Filter Tabs with interactive hover and smooth color changes */}
      <div className="flex gap-2.5 mb-8 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`btn-modern px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 text-gray-400">
          <p className="font-semibold text-gray-600">No {activeTab !== 'all' ? activeTab + 's' : 'vehicles'} available right now.</p>
          <p className="text-xs text-gray-400 mt-1">Please check other categories or contact our support team.</p>
        </div>
      )}
    </div>
  );
}
