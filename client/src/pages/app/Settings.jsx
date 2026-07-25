import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiChevronRight, FiInfo, FiLogOut, FiTrash2, FiUser } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import EditProfileModal from '@/components/users/EditProfileModal';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import { useAuth } from '@/hooks/useAuth';
import { logoutThunk } from '@/features/auth/authSlice';

export default function Settings() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h1 className="font-display text-xl font-extrabold text-content">Settings</h1>
          <p className="text-sm text-muted">Manage your account, appearance, and more</p>
        </div>

        {/* Account */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-muted">Account</h2>
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-content">{user?.name}</p>
              <p className="truncate text-sm text-muted">@{user?.username}</p>
              <p className="truncate text-sm text-muted">{user?.email}</p>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<FiUser size={15} />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </div>
          <div className="flex justify-end border-t border-line pt-4">
            <Button variant="ghost" size="sm" leftIcon={<FiLogOut size={15} />} onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted">Appearance</h2>
            <p className="mt-0.5 text-sm text-content">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </Card>

        {/* More */}
        <Card className="p-0">
          <Link
            to="/app/settings/about"
            className="flex items-center gap-3 px-5 py-4 transition hover:bg-surface-2"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
              <FiInfo size={17} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-content">About & Support</span>
              <span className="block text-sm text-muted">App info, privacy policy, terms, help</span>
            </span>
            <FiChevronRight className="text-muted" />
          </Link>
        </Card>

        {/* Danger zone */}
        <Card className="space-y-3 border-danger/30">
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          <p className="text-sm text-muted">
            Deleting your account is permanent and cannot be undone. All your posts, messages, and
            data will be removed.
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<FiTrash2 size={15} />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </Card>
      </div>

      {user && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />}
      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
