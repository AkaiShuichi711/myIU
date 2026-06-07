import { useState, useRef } from 'react';
import { useSearchUsers } from '@/lib/react-query/queriesAndMutations';
import { useDebounce } from '@/hooks/useDebounce';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionedUsers?: (userIds: string[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const MentionInput = ({
  value,
  onChange,
  onMentionedUsers,
  placeholder = 'Write something... Use @ to mention someone',
  rows = 4,
  className,
}: MentionInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const debouncedQuery = useDebounce(mentionQuery, 300);
  const { data: searchData } = useSearchUsers(debouncedQuery);
  const users: any[] = searchData?.documents ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart ?? text.length;
    const before = text.slice(0, cursor);
    const atIdx = before.lastIndexOf('@');

    if (atIdx !== -1) {
      const afterAt = before.slice(atIdx + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionStart(atIdx);
        setMentionQuery(afterAt);
        setShowDropdown(afterAt.length >= 1);
        return;
      }
    }
    setShowDropdown(false);
    setMentionQuery('');
    setMentionStart(-1);
  };

  const handleSelectUser = (user: any) => {
    const username = user.username || user.name.split(' ').join('').toLowerCase();
    const before = value.slice(0, mentionStart);
    // +1 for the @ sign itself
    const after = value.slice(mentionStart + 1 + mentionQuery.length);
    const newText = `${before}@${username} ${after}`;
    onChange(newText);

    const updated = [...mentionedUserIds, user.$id];
    setMentionedUserIds(updated);
    onMentionedUsers?.(updated);

    setShowDropdown(false);
    setMentionQuery('');
    setMentionStart(-1);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const defaultClass =
    'w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009cd1]/20 focus:border-[#009cd1] transition-all resize-none placeholder:text-slate-400';

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        rows={rows}
        placeholder={placeholder}
        className={className ?? defaultClass}
      />

      {showDropdown && users.length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden mt-1">
          {users.slice(0, 6).map((u: any) => {
            const initials = (u.name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <button
                key={u.$id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelectUser(u); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
