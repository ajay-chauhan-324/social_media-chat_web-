import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import authService from '@/services/authService';
import { getErrorMessage } from '@/lib/axios';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18 StrictMode double-invoke
    ran.current = true;
    if (!token) {
      setState('error');
      setMessage('Verification token is missing.');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((e) => {
        setState('error');
        setMessage(getErrorMessage(e));
      });
  }, [token]);

  const content = {
    loading: {
      icon: <Spinner size={40} className="text-brand-600" />,
      title: 'Verifying your email…',
      body: 'Hang tight while we confirm your account.',
    },
    success: {
      icon: <FiCheckCircle size={44} className="text-success" />,
      title: 'Email verified!',
      body: 'Your account is now verified. You can enjoy everything ArtROOT Chat offers.',
    },
    error: {
      icon: <FiXCircle size={44} className="text-danger" />,
      title: 'Verification failed',
      body: message || 'This verification link is invalid or has expired.',
    },
  }[state];

  return (
    <AuthLayout title="Email verification">
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mb-4 flex justify-center">{content.icon}</div>
        <h2 className="text-xl font-bold text-content">{content.title}</h2>
        <p className="mt-2 text-muted">{content.body}</p>
        <Button as={Link} to="/app" variant="gradient" className="mt-6" fullWidth>
          Continue to app
        </Button>
      </div>
    </AuthLayout>
  );
}
