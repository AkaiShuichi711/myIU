import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, MapPin, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetPostById,
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useDeletePost,
  useGetSavedPosts,
  useCreateNotification,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isPending: isLoading } = useGetPostById(id || '');
  const { data: savedRecords } = useGetSavedPosts(user.id);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSave } = useDeleteSavedPost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: createNotif } = useCreateNotification();

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#323393]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Post not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#323393] hover:underline">Go back</button>
      </div>
    );
  }

  const likes: string[] = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likes.includes(user.id);
  const savedRecord = savedRecords?.find((r: any) => r.post?.$id === post.$id || r.post === post.$id);
  const isSaved = !!savedRecord;
  const creator = typeof post.creator === 'object' ? post.creator : null;
  const isOwner = user.id === (creator?.$id || post.creator);

  const handleLike = () => {
    const newLikes = isLiked ? likes.filter((uid) => uid !== user.id) : [...likes, user.id];
    const wasLiked = isLiked;
    likePost({ postId: post.$id, likesArray: newLikes }, {
      onSuccess: () => {
        if (!wasLiked && creator?.$id && creator.$id !== user.id) {
          createNotif({
            userId: creator.$id,
            type: 'like',
            actorId: user.id,
            actorName: user.name,
            postId: post.$id,
            message: `${user.name} đã thích bài viết của bạn`,
          });
        }
      },
    });
  };

  const handleSave = () => {
    if (isSaved && savedRecord) {
      deleteSavedPost(savedRecord.$id);
    } else {
      savePost({ postId: post.$id, userId: user.id });
    }
  };

  const handleDelete = () => {
    deletePost({ postId: post.$id, imageId: post.imageId });
    navigate('/explore');
  };

  const creatorName = creator?.name || 'Unknown';
  const creatorInitials = getInitials(creatorName);

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Back bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-100 dark:border-slate-700 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                to={`/update-post/${post.$id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-60"
              >
                <Trash2 size={13} /> {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Image */}
            {post.imageUrl && (
              <div className="lg:w-[55%] bg-slate-50 dark:bg-slate-900 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            )}

            {/* Right: Details */}
            <div className={`flex flex-col ${post.imageUrl ? 'lg:w-[45%]' : 'w-full'}`}>
              {/* Creator header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700">
                <Link
                  to={creator?.$id ? `/profile/${creator.$id}` : '#'}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: '#323393' }}
                  >
                    {creatorInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{creatorName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatTimeAgo(post.$createdAt)}</p>
                  </div>
                </Link>
              </div>

              {/* Caption & details */}
              <div className="flex-1 px-5 py-4 overflow-y-auto">
                {post.caption && (
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4">{post.caption}</p>
                )}

                {post.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
                    <MapPin size={12} /> {post.location}
                  </div>
                )}

                {Array.isArray(post.tags) && post.tags.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.filter(Boolean).map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#323393]/8 dark:bg-[#323393]/20 text-[#323393]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-50 dark:border-slate-700">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: isLiked ? '#ef4444' : '#94a3b8' }}
                >
                  <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} className="transition-transform active:scale-110" />
                  <span>{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving || isDeletingSave}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                  style={{ color: isSaved ? '#323393' : '#94a3b8' }}
                >
                  <Bookmark size={18} fill={isSaved ? '#323393' : 'none'} className="transition-transform active:scale-110" />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Comments */}
              <CommentSection
                postId={post.$id}
                postOwnerId={creator?.$id || String(post.creator)}
                postOwnerName={creatorName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
