import { useState } from 'react';
import { Trash2, Loader2, MessageCircle, Send } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetPostComments,
  useCreateComment,
  useDeleteComment,
  useCreateNotification,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';
import MentionInput from './MentionInput';

interface CommentSectionProps {
  postId: string;
  postOwnerId: string;
  postOwnerName: string;
}

const renderWithMentions = (text: string) =>
  text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-[#009CD1] font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );

const CommentSection = ({ postId, postOwnerId, postOwnerName }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [body, setBody] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  const { data: comments = [], isPending: isLoading } = useGetPostComments(postId);
  const { mutate: createComment, isPending: isAdding } = useCreateComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: createNotif } = useCreateNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const snapshot = { body: body.trim(), mentioned: [...mentionedUsers] };

    createComment(
      {
        postId,
        userId: user.id,
        authorName: user.name,
        body: snapshot.body,
        taggedUsers: snapshot.mentioned,
      },
      {
        onSuccess: (comment: any) => {
          // Notify post owner (don't notify yourself)
          if (postOwnerId && postOwnerId !== user.id) {
            createNotif({
              userId: postOwnerId,
              type: 'comment',
              actorId: user.id,
              actorName: user.name,
              postId,
              commentId: comment?.$id,
              message: `${user.name} đã bình luận bài viết của bạn`,
            });
          }
          // Notify each @mentioned user
          snapshot.mentioned.forEach((uid) => {
            if (uid !== user.id && uid !== postOwnerId) {
              createNotif({
                userId: uid,
                type: 'mention',
                actorId: user.id,
                actorName: user.name,
                postId,
                commentId: comment?.$id,
                message: `${user.name} đã nhắc đến bạn trong một bình luận`,
              });
            }
          });
        },
      }
    );

    setBody('');
    setMentionedUsers([]);
  };

  const handleDelete = (commentId: string) => {
    deleteComment({ commentId, postId });
  };

  return (
    <div className="border-t border-slate-100">
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2">
        <MessageCircle size={15} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          Comments{' '}
          {comments.length > 0 && (
            <span className="font-normal text-slate-400">({comments.length})</span>
          )}
        </span>
      </div>

      {/* Comment list */}
      <div className="px-5 flex flex-col gap-3 max-h-72 overflow-y-auto pb-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="animate-spin text-[#009CD1]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          (comments as any[]).map((c) => {
            const initials = (c.authorName || '?')
              .split(' ')
              .map((w: string) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const isOwn = c.userId === user.id;

            return (
              <div key={c.$id} className="flex items-start gap-2.5 group">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: '#009CD1' }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-slate-800 mb-0.5">{c.authorName}</p>
                    <p className="text-sm text-slate-700 leading-relaxed break-words">
                      {renderWithMentions(c.body)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 px-1">{formatTimeAgo(c.$createdAt)}</p>
                </div>
                {isOwn && (
                  <button
                    onClick={() => handleDelete(c.$id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-red-400 shrink-0 mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-5 py-3 border-t border-slate-50 flex items-end gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: '#009CD1' }}
        >
          {(user.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div className="flex-1 relative">
          <MentionInput
            value={body}
            onChange={setBody}
            onMentionedUsers={setMentionedUsers}
            placeholder="Thêm bình luận... dùng @ để tag người"
            rows={1}
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009CD1]/20 focus:border-[#009CD1] transition-all resize-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !body.trim()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-40"
          style={{ background: '#009CD1' }}
        >
          {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
