import { Link } from 'react-router-dom';
import { Heart, Bookmark } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';

type GridPostListProps = {
  posts: any[];
  showUser?: boolean;
};

const GridPostList = ({ posts, showUser = true }: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts || posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post: any) => {
        const likes: string[] = Array.isArray(post.likes) ? post.likes : [];
        const isLiked = likes.includes(user.id);
        const creator = typeof post.creator === 'object' ? post.creator : null;

        return (
          <Link
            key={post.$id}
            to={`/posts/${post.$id}`}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.caption || 'Post'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm px-4 text-center line-clamp-4">{post.caption}</p>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col justify-end p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'white'} />
                    {likes.length}
                  </span>
                </div>
                {showUser && creator && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: '#1e51f9' }}>
                      {creator.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default GridPostList;
