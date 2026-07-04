import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiMail, FiUser } from 'react-icons/fi';

import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { loginSchema } from '@/features/auth/authValidators';
import { loginThunk, clearError } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  const from = location.state?.from?.pathname || '/app';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: true },
  });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(loginThunk(values));
    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || 'Sign in failed');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to ArtROOT Chat."
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email or username"
          placeholder="you@example.com"
          leftIcon={<FiUser />}
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
              {...register('remember')}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="gradient" fullWidth size="lg" loading={status === 'loading'}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-line bg-surface p-3 text-center text-xs text-muted">
        <FiMail className="mr-1 inline" />
        Demo tip: register a new account — verification & reset emails print to the server console in
        mock mode.
      </div>
    </AuthLayout>
  );
}
