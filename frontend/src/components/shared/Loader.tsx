import { Loader2 } from 'lucide-react';

const Loader = () => (
  <div className="flex items-center justify-center w-full">
    <Loader2 size={24} className="animate-spin text-[#0057A8]" />
  </div>
);

export default Loader;
