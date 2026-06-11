import { getInitials } from '@/lib/utils';

type AvatarVariant = 'primary' | 'muted';

const AVATAR_BG: Record<AvatarVariant, string> = {
  primary: '#0068FF',
  muted:   '#64748b',
};

type Props = {
  name: string;
  className?: string;
  variant?: AvatarVariant;
};

const UserAvatar = ({ name, className = 'w-8 h-8 text-xs', variant = 'primary' }: Props) => (
  <div
    className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    style={{ background: AVATAR_BG[variant] }}
    title={name}
  >
    {getInitials(name) || '?'}
  </div>
);

export default UserAvatar;
