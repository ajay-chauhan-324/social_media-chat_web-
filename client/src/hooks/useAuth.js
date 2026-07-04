import { useSelector } from 'react-redux';
import { selectAuth } from '@/features/auth/authSlice';

/** Convenience selector hook for auth state. */
export const useAuth = () => useSelector(selectAuth);
