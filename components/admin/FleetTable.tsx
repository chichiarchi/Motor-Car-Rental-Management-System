'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2, Trash2 } from 'lucide-react';
import { VehicleForm } from './VehicleForm';
import { toggleVehicleStatus, deleteVehicle } from '@/app/actions/fleet';
import { formatPeso } from '@/lib/utils';
import { VEHICLE_STATUS_MAP } from '@/lib/constants';
import type { VehicleRow, VehicleStatus } from '@/types/database.types';

interface FleetTableProps {
  vehicles: VehicleRow[];
}

const STATUS_CYCLE: Record<VehicleStatus, VehicleStatus> = {
  available: 'maintenance',
  maintenance: 'available',
  rented: 'available',
};

export function FleetTable({ vehicles }: FleetTableProps) {
  const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleStatus = (vehicle: VehicleRow) => {
    const nextStatus = STATUS_CYCLE[vehicle.current_status];
    setPendingId(vehicle.id);
    startTransition(async () => {
      await toggleVehicleStatus(vehicle.id, nextStatus);
      router.refresh();
      setPendingId(null);
    });
  };

  const handleDelete = (vehicleId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from the fleet?')) return;
    setPendingId(vehicleId);
    startTransition(async () => {
      await deleteVehicle(vehicleId);
      router.refresh();
      setPendingId(null);
    });
  };

  const handleFormClose = () => {
    setEditVehicle(null);
    setShowCreateForm(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Add Vehicle Button with modern interactive style */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-modern btn-primary-interactive px-4 py-2.5 rounded-xl text-sm font-bold gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add New Vehicle
        </button>
      </div>

      {/* Create / Edit Form Overlay */}
      {(showCreateForm || editVehicle) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <VehicleForm
              vehicle={editVehicle ?? undefined}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <p className="font-semibold text-gray-700 text-base">No vehicles in fleet yet</p>
            <p className="mt-1">Click &ldquo;Add New Vehicle&rdquo; above to upload your first car or motorcycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="text-left px-5 py-3.5">Vehicle</th>
                  <th className="text-left px-4 py-3.5 hidden sm:table-cell">Plate</th>
                  <th className="text-left px-4 py-3.5 hidden md:table-cell">Type</th>
                  <th className="text-right px-4 py-3.5">Daily Rate</th>
                  <th className="text-right px-4 py-3.5 hidden md:table-cell">Deposit</th>
                  <th className="text-left px-4 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((vehicle) => {
                  const status = VEHICLE_STATUS_MAP[vehicle.current_status];
                  const isLoading = isPending && pendingId === vehicle.id;

                  return (
                    <tr key={vehicle.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{vehicle.model_name}</div>
                        <div className="sm:hidden text-xs text-gray-400 font-mono mt-0.5">{vehicle.plate_number}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-gray-600 font-mono font-medium">
                        {vehicle.plate_number}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 capitalize font-medium">
                        {vehicle.vehicle_type === 'car' ? 'Car' : 'Motorcycle'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-blue-700">
                        {formatPeso(vehicle.daily_rate)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-500 hidden md:table-cell">
                        {formatPeso(vehicle.security_deposit)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            vehicle.current_status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : vehicle.current_status === 'rented'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditVehicle(vehicle)}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors active:scale-95"
                            title="Edit Vehicle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(vehicle)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 active:scale-95"
                            title={`Toggle availability (Current: ${vehicle.current_status})`}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : vehicle.current_status === 'available' ? (
                              <ToggleRight className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 active:scale-95"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
