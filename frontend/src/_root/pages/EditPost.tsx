import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3, Loader2, MapPin, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetPostById, useUpdatePost } from '@/lib/react-query/queriesAndMutations';
import { FileUploader } from '@/components/shared';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const postSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(2200),
  file: z.custom<File[]>(),
  location: z.string().max(100).optional(),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const inputCls = "w-full pl-8 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0068FF]/20 focus:border-[#0068FF] transition-all";

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: post, isPending: isLoadingPost } = useGetPostById(id || '');
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    values: {
      caption: post?.caption || '',
      file: [],
      location: post?.location || '',
      tags: Array.isArray(post?.tags) ? post.tags.join(', ') : (post?.tags || ''),
    },
  });

  const onSubmit = async (values: PostFormValues) => {
    if (!post) return;

    const updated = await updatePost({
      postId: post.$id,
      caption: values.caption,
      imageUrl: post.imageUrl,
      imageId: post.imageId,
      file: values.file || [],
      location: values.location,
      tags: values.tags,
    });

    if (!updated) {
      toast({ title: 'Failed to update post.' });
      return;
    }

    toast({ title: 'Post updated!' });
    navigate(`/posts/${post.$id}`);
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#0068FF]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0068FF]/10 flex items-center justify-center">
            <Edit3 size={18} className="text-[#0068FF]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Edit Post</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Update your post</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 block">
                      Image <span className="font-normal text-slate-400 dark:text-slate-500">(leave empty to keep current)</span>
                    </FormLabel>
                    <FormControl>
                      <FileUploader fieldChange={field.onChange} mediaUrl={post.imageUrl} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-5">
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">Caption</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0068FF]/20 focus:border-[#0068FF] transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input {...field} className={inputCls} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tags</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input {...field} className={inputCls} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-colors disabled:opacity-60"
                style={{ background: '#2F398E' }}
              >
                {isUpdating ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditPost;
