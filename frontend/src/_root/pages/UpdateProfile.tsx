import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Loader2, Camera, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserById, useUpdateUser } from '@/lib/react-query/queriesAndMutations';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  bio: z.string().max(300).optional(),
  file: z.custom<File[]>(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, checkAuthUser } = useUserContext();

  const userId = id || user.id;
  const { data: profile, isPending: isLoadingProfile } = useGetUserById(userId);
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  // Local preview of newly selected avatar
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || user.name || '',
      bio: profile?.bio || user.bio || '',
      file: [],
    },
  });

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      form.setValue('file', [file]);
      // Show immediate local preview
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    },
    [form],
  );

  const clearAvatar = () => {
    setPreviewUrl(null);
    form.setValue('file', []);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    const updated = await updateUser({
      userId,
      name: values.name,
      bio: values.bio || '',
      imageId: profile?.imageId,
      imageUrl: profile?.imageUrl,
      file: values.file || [],
    });

    if (!updated) {
      toast({ title: 'Failed to update profile. Please try again.', variant: 'destructive' });
      return;
    }

    await checkAuthUser();
    toast({ title: 'Profile updated!' });
    navigate(`/profile/${userId}`);
  };

  const currentAvatarUrl = previewUrl || profile?.imageUrl || user.imageUrl || '';
  const displayName = profile?.name || user.name || '';
  const initials = getInitials(displayName || '?');

  if (isLoadingProfile && !profile) {
    return (
      <div className="min-h-full bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1e51f9]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F398E]/10 flex items-center justify-center">
            <UserCog size={18} className="text-[#2F398E]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Edit Profile</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Update your public information</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* ── Avatar section ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Profile Photo</p>

              <div className="flex items-center gap-5">
                {/* Avatar preview */}
                <div className="relative shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-md"
                    style={{ background: '#1e51f9' }}
                  >
                    {currentAvatarUrl ? (
                      <img
                        src={currentAvatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Camera button overlay */}
                  <label
                    htmlFor="avatar-input"
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#2F398E] hover:bg-[#1e2a6e] text-white flex items-center justify-center cursor-pointer shadow-md transition-colors"
                    title="Change photo"
                  >
                    <Camera size={13} />
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Info + actions */}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{profile?.email || user.email}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <label
                      htmlFor="avatar-input"
                      className="text-xs font-medium text-[#2F398E] dark:text-blue-400 cursor-pointer hover:underline"
                    >
                      {previewUrl ? 'Change photo' : 'Upload photo'}
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={clearAvatar}
                        className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={11} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">JPG, PNG, WebP · max 10 MB</p>
                </div>
              </div>

              {/* New photo selected indicator */}
              {previewUrl && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5">
                  <Camera size={11} />
                  New photo selected — will be uploaded when you save
                </div>
              )}
            </div>

            {/* ── Info fields ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Display Name
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e51f9]/20 focus:border-[#1e51f9] transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Bio
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        ({(field.value?.length ?? 0)}/300)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Write a short bio about yourself..."
                        maxLength={300}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e51f9]/20 focus:border-[#1e51f9] transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Actions ── */}
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
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
