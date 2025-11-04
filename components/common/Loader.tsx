import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader: React.FC<{ message?: string }> = ({ message = 'Loading Page...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-on-surface-variant">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
    <p className="mt-4 text-lg font-semibold">{message}</p>
  </div>
);

export default Loader;
