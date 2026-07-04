import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { forgotSchema } from '@/features/auth/authValidators';
import authService from '@/services/authService';
import { getErrorMessage } from '@/lib/axios';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="We’ve sent you a password reset link.">
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <FiCheckCircle className="mx-auto mb-3 text-success" size={40} />
          <p className="text-content">
            If an account exists for <span className="font-semibold">{getValues('email')}</span>, a
            reset link is on its way.
          </p>
          <p className="mt-2 text-sm text-muted">
            In mock mode (no SMTP configured), the link is printed to the server console.
          </p>
          <Button as={Link} to="/login" variant="secondary" className="mt-5" fullWidth>
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we’ll send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<FiMail />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" variant="gradient" fullWidth size="lg" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
