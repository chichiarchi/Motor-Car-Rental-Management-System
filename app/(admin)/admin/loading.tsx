import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingOverlay
        message="Loading Admin Portal..."
        submessage="Synchronizing fleet, bookings, and inspection records"
        fullScreen={false}
      />
    </div>
  );
}

