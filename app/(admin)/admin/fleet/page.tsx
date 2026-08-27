import { getVehicles } from '@/app/actions/fleet';
import { FleetTable } from '@/components/admin/FleetTable';

export const metadata = { title: 'Fleet — Admin' };

export default async function AdminFleetPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add, edit, or update the status of vehicles in your rental fleet.
          </p>
        </div>
      </div>

      <FleetTable vehicles={vehicles} />
    </div>
  );
}
