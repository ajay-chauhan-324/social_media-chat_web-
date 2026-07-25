import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import userService from '@/services/userService';
import { setAccessToken, getErrorMessage } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import { forceLogout } from '@/features/auth/authSlice';

const CONFIRM_WORD = 'DELETE';

export default function DeleteAccountModal({ open, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      setAccessToken(null);
      queryClient.clear();
      dispatch(forceLogout());
      toast.success('Your account has been permanently deleted');
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    setConfirmText('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Delete account" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3.5">
          <FiAlertTriangle className="mt-0.5 shrink-0 text-danger" size={20} />
          <p className="text-sm text-content">
            This <strong>permanently deletes</strong> your account — profile, posts, comments,
            messages, follows, and AI history. This action cannot be undone.
          </p>
        </div>

        <Input
          label={`Type "${CONFIRM_WORD}" to confirm`}
          placeholder={CONFIRM_WORD}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={confirmText !== CONFIRM_WORD}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete my account
          </Button>
        </div>
      </div>
    </Modal>
  );
}
