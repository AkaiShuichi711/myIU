import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, MapPin, MoreHorizontal, Trash2, Edit3, Video, FileText, FileSpreadsheet, Presentation, File as FileIcon, Download } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { useLikePost, useSavePost, useDeleteSavedPost, useDeletePost } from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import type { IPost } from '@/types';

type PostCardProps = {
  post: IPost;
  savedRecords?: { postId: string; $id: string }[];
};

const DOC_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  video:  { icon: <Video size={16} />,          label: 'Video',  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  pdf:    { icon: <FileText size={16} />,        label: 'PDF',    color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  word:   { icon: <FileText size={16} />,        label: 'Word',   color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  excel:  { icon: <FileSpreadsheet size={16} />, label: 'Excel',  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  ppt:    { icon: <Presentation size={16} />,    label: 'PPT',    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  file:   { icon: <FileIcon size={16} />,        label: 'File',   color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-700' },
};

const MediaItem = ({ url, type, idx, total }: { url: string; type: string; idx: number; total: number }) => {
  if (type === 'image') {
    return (
      <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-900 ${total > 1 ? 'h-52' : ''}`} style={total === 1 ? { maxHeight: '480px' } : {}}>
        <img
          src={url}
          alt="Post media"
          className={`w-full object-cover ${total > 1 ? 'h-full' : ''}`}
          style={total === 1 ? { maxHeight: '480px' } : {}}
          loading="lazy"
        />
        {total > 2 && idx === total - 1 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-lg font-bold">+{total - 2}</span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className={`relative bg-black ${total > 1 ? 'h-52' : ''}`}>
        <video
          src={url}
          className={`w-full object-contain ${total > 1 ? 'h-full' : ''}`}
          style={total === 1 ? { maxHeight: '480px' } : {}}
          controls={total === 1}
          muted
          preload="metadata"
        />
        {total > 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Video size={18} className="text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const meta = DOC_META[type] ?? DOC_META.file;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-3 px-4 py-3 ${meta.bg} hover:opacity-80 transition-opacity`}
    >
      <div className={meta.color}>{meta.icon}</div>
      <span className={`text-sm font-semibold ${meta.color}`}>{meta.label} file</span>
      <Download size={14} className={`ml-auto ${meta.color}`} />
    </a>
  );
};

const PostCard = ({ post, savedRecords = [] }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [menuOpen, setMenuOpen] = useState(false);

  const creator = typeof post.creator === 'object' ? post.creator : null;
  const creatorName = creator?.name || 'Unknown';
  const creatorUsername = creator?.username || '';

  const likes: string[] = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likes.includes(user.id);
  const savedRecord = savedRecords.find((r: any) => r.post?.$id === post.$id || r.post === post.$id);
  const isSaved = !!savedRecord;
  const isOwner = user.id === (creator?.$id || post.creator);

  // Multi-media or legacy single image
  const mediaUrls: string[] = Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
    ? post.mediaUrls
    : post.imageUrl ? [post.imageUrl] : [];
  const mediaTypes: string[] = Array.isArray(post.mediaTypes) && post.mediaTypes.length > 0
    ? post.mediaTypes
    : post.imageUrl ? ['image'] : [];
  const displayMedia = mediaUrls.slice(0, 4);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSave } = useDeleteSavedPost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likePost({ postId: post.$id, likesArray: isLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id] });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && savedRecord) deleteSavedPost(savedRecord.$id);
    else savePost({ postId: post.$id, userId: user.id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    deletePost({ postId: post.$id, imageId: post.imageId });
  };

  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <Link to={creator?.$id ? `/profile/${creator.$id}` : '#'} className="flex items-center gap-3 min-w-0" onClick={(e) => e.stopPropagation()}>
          <UserAvatar name={creatorName} className="w-10 h-10 text-sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{creatorName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              {creatorUsername && <span>@{creatorUsername}</span>}
              {creatorUsername && <span>·</span>}
              <span>{formatTimeAgo(post.$createdAt)}</span>
            </div>
          </div>
        </Link>

        <div className="relative shrink-0">
          {isOwner && (
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          )}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-100 dark:border-slate-600 py-1 w-40">
                <button onClick={() => { setMenuOpen(false); navigate(`/update-post/${post.$id}`); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <Edit3 size={14} /> Edit Post
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Media */}
      {displayMedia.length > 0 && (
        <Link to={`/posts/${post.$id}`}>
          {displayMedia.length === 1 ? (
            <MediaItem url={displayMedia[0]} type={mediaTypes[0] ?? 'image'} idx={0} total={1} />
          ) : displayMedia.length === 2 ? (
            <div className="grid grid-cols-2 gap-0.5">
              {displayMedia.map((url, i) => (
                <MediaItem key={i} url={url} type={mediaTypes[i] ?? 'image'} idx={i} total={2} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              <div className="row-span-2">
                <MediaItem url={displayMedia[0]} type={mediaTypes[0] ?? 'image'} idx={0} total={displayMedia.length} />
              </div>
              {displayMedia.slice(1, 3).map((url, i) => (
                <MediaItem key={i + 1} url={url} type={mediaTypes[i + 1] ?? 'image'} idx={i + 1} total={displayMedia.length} />
              ))}
            </div>
          )}
          {/* Multi-file count indicator */}
          {mediaUrls.length > 1 && (
            <div className="px-5 pt-2 flex items-center gap-1.5">
              {Array.from({ length: Math.min(mediaUrls.length, 5) }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'w-4 bg-[#0057A8]' : 'w-1.5 bg-slate-200 dark:bg-slate-600'}`} />
              ))}
              {mediaUrls.length > 5 && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">+{mediaUrls.length - 5}</span>}
            </div>
          )}
        </Link>
      )}

      {/* Body */}
      <div className="px-5 pt-3 pb-1">
        {post.caption && (
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-2 line-clamp-3">{post.caption}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          {post.location && (
            <span className="flex items-center gap-1"><MapPin size={11} /> {post.location}</span>
          )}
          {Array.isArray(post.tags) && post.tags.filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.filter(Boolean).map((tag: string) => (
                <span key={tag} className="text-[#0057A8] font-medium">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 dark:border-slate-700 mt-2">
        <button onClick={handleLike} disabled={isLiking} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: isLiked ? '#ef4444' : '#94a3b8' }}>
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} className="transition-transform active:scale-125" />
          <span>{likes.length}</span>
        </button>
        <div className="flex items-center gap-2">
          <Link to={`/posts/${post.$id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={(e) => e.stopPropagation()}>
            View
          </Link>
          <button onClick={handleSave} disabled={isSaving || isDeletingSave} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: isSaved ? '#0057A8' : '#94a3b8' }} title={isSaved ? 'Unsave' : 'Save'}>
            <Bookmark size={16} fill={isSaved ? '#0057A8' : 'none'} className="transition-transform active:scale-125" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
