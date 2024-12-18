import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label }: SpinnerProps) {
  return (
    <div className="flex justify-center items-center flex-1 absolute top-0 left-0 right-0 bottom-0 bg-black/50">
      <p>{label}</p>
      <Loader2 className="animate-spin" size={64} />
    </div>
  );
}
