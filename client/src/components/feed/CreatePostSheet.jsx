import Modal from '@/components/ui/Modal';
import PostComposer from './PostComposer';

/**
 * Bottom-sheet wrapper around the existing PostComposer, opened from the
 * mobile bottom-nav "+" button. Closes itself once a post is published.
 */
export default function CreatePostSheet({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Create post" size="xl">
      <PostComposer onPosted={onClose} />
    </Modal>
  );
}
