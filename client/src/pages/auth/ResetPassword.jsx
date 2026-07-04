import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import AuthLayout from '@/components/layout/AuthLayout';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { resetSchema } from '@/features/auth/authValidators';
import authService from '@/services/authService';
import { getErrorMessage } from '@/lib/axios';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema), defaultValues: { password: '', confirm: '' } });

  const onSubmit = async ({ password }) => {
    try {
      await authService.resetPassword({ token, password });
      toast.success('Password updated — please sign in');
      navigate('/login', { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing or malformed.">
        <Button as={Link} to="/forgot-password" variant="gradient" fullWidth>
          Request a new link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven’t used before."
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          placeholder="••••••••"
          hint="8+ characters with upper, lower & a number"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="••••••••"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <Button type="submit" variant="gradient" fullWidth size="lg" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
