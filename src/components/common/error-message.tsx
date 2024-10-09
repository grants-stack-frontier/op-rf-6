import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorMessage({ error }: { error?: { message: string } }) {
  return (
    <Alert variant={'destructive'}>
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error?.message}</AlertDescription>
    </Alert>
  );
}
