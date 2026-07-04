import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import userService from '@/services/userService';
import { setUser } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/lib/axios';

export default function EditProfileModal({ open, onClose, user }) {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name || '',
      headline: user.headline || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      skills: (user.skills || []).join(', '),
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => userService.updateMe(payload),
    onSuccess: (updated) => {
      dispatch(setUser(updated));
      qc.setQueryData(['user', updated.username], (u) => ({ ...u, ...updated }));
      toast.success('Profile updated');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (values) => {
    mutation.mutate({
      ...values,
      skills: values.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
        <Input label="Headline" placeholder="e.g. Product Designer @ ArtROOT" {...register('headline')} />
        <Textarea label="Bio" placeholder="Tell the world about yourself…" maxLength={280} {...register('bio')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Location" placeholder="Mumbai, India" {...register('location')} />
          <Input label="Website" placeholder="https://…" {...register('website')} />
        </div>
        <Input label="Skills" hint="Comma-separated" placeholder="React, Node.js, UI/UX" {...register('skills')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
