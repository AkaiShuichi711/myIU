import { Loader2 } from 'lucide-react';

type Props = { size?: number };

const PageLoader = ({ size = 24 }: Props) => (
  <div className="min-h-full flex items-center justify-center">
    <Loader2 size={size} className="animate-spin text-[#0057A8]" />
  </div>
);

export default PageLoader;
