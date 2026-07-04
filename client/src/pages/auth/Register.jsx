import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiUser, FiAtSign, FiMail } from 'react-icons/fi';

import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { registerSchema } from '@/features/auth/authValidators';
import { registerThunk, clearError } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', email: '', password: '' },
  });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(registerThunk(values));
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Account created — welcome to ArtROOT Chat!');
      navigate('/app', { replace: true });
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of creators. It’s free forever."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="Ajay Chauhan"
          leftIcon={<FiUser />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Username"
          placeholder="ajay"
          leftIcon={<FiAtSign />}
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<FiMail />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          hint="8+ characters with upper, lower & a number"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="gradient" fullWidth size="lg" loading={status === 'loading'}>
          Create account
        </Button>
        <p className="text-center text-xs text-muted">
          By signing up you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
