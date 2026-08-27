import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function RootLoading() {
  return (
    <LoadingOverlay
      message="Loading DriveEasy..."
      submessage="Getting vehicle availability & rates ready"
      fullScreen={true}
    />
  );
}

