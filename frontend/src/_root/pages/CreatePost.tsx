import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PenSquare, Loader2, MapPin, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import { useCreatePost, useCreateNotification } from '@/lib/react-query/queriesAndMutations';
import { MediaUploader, MentionInput } from '@/components/shared';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const postSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(2200),
  files: z.custom<File[]>(),
  location: z.string().max(100).optional(),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const inputCls = "w-full pl-8 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009cd1]/20 focus:border-[#009cd1] transition-all";

const CreatePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const { t } = useTranslation();
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const { mutate: createNotif } = useCreateNotification();
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { caption: '', files: [], location: '', tags: '' },
  });

  const onSubmit = async (values: PostFormValues) => {
    if (!values.files || values.files.length === 0) {
      toast({ title: t('createPost.noFileError'), variant: 'destructive' });
      return;
    }

    const post = await createPost({
      ...values,
      userId: user.id,
      files: values.files,
      location: values.location || '',
    });

    if (!post) {
      toast({ title: t('createPost.submitError') });
      return;
    }

    mentionedUsers.forEach((uid) => {
      if (uid !== user.id) {
        createNotif({
          userId: uid,
          type: 'mention',
          actorId: user.id,
          actorName: user.name,
          postId: post.$id,
          message: `${user.name} đã nhắc đến bạn trong một bài viết`,
        });
      }
    });

    toast({ title: t('createPost.successMsg') });
    navigate('/explore');
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#009cd1]/10 flex items-center justify-center">
            <PenSquare size={18} className="text-[#009cd1]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('createPost.title')}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('createPost.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 block">
                      {t('createPost.media')}
                    </FormLabel>
                    <FormControl>
                      <MediaUploader onChange={field.onChange} maxFiles={5} />
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t('createPost.caption')}
                      <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
                        {t('createPost.captionHint')}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <MentionInput
                        value={field.value}
                        onChange={field.onChange}
                        onMentionedUsers={setMentionedUsers}
                        placeholder={t('createPost.captionPlaceholder')}
                        rows={4}
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('createPost.location')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input {...field} placeholder={t('createPost.locationPlaceholder')} className={inputCls} />
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
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('createPost.tags')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input {...field} placeholder={t('createPost.tagsPlaceholder')} className={inputCls} />
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
                {t('createPost.cancel')}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-colors disabled:opacity-60"
                style={{ background: '#2F398E' }}
              >
                {isPending ? (
                  <><Loader2 size={15} className="animate-spin" /> {t('createPost.publishing')}</>
                ) : (
                  t('createPost.publish')
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePost;
