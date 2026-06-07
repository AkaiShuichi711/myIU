import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserById, useUpdateUser } from '@/lib/react-query/queriesAndMutations';
import { FileUploader } from '@/components/shared';
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
  const { user, setUser } = useUserContext();

  const userId = id || user.id;
  const { data: profile, isPending: isLoadingProfile } = useGetUserById(userId);
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || user.name || '',
      bio: profile?.bio || user.bio || '',
      file: [],
    },
  });

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
      toast({ title: 'Failed to update profile.' });
      return;
    }

    setUser({ ...user, name: values.name, bio: values.bio || '' });
    toast({ title: 'Profile updated!' });
    navigate(`/profile/${userId}`);
  };

  const displayName = profile?.name || user.name || '';
  const initials = getInitials(displayName);

  if (isLoadingProfile) {
    return (
      <div className="min-h-full bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#009cd1]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F398E]/10 flex items-center justify-center">
            <UserCog size={18} className="text-[#2F398E]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Edit Profile</h1>
            <p className="text-xs text-slate-400">Update your public information</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-700 mb-4">Profile Photo</p>
              <div className="flex items-center gap-5 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}
                >
                  {profile?.imageUrl && !profile.imageUrl.includes('avatars') ? (
                    <img src={profile.imageUrl} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{displayName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{profile?.email || user.email}</p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader fieldChange={field.onChange} mediaUrl={profile?.imageUrl} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Display Name</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009cd1]/20 focus:border-[#009cd1] transition-all"
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
                    <FormLabel className="text-sm font-semibold text-slate-700">Bio</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Write a short bio..."
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009cd1]/20 focus:border-[#009cd1] transition-all resize-none placeholder:text-slate-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
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
