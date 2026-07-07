import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiGlobe, FiUsers } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/features/posts/usePostActions';
import { cn } from '@/lib/cn';

const MAX_IMAGES = 4;
const MAX_CHARS = 3000;

export default function PostComposer({ compact = false, onPosted }) {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const fileRef = useRef(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // { file, preview }
  const [visibility, setVisibility] = useState('public');
  const [focused, setFocused] = useState(!compact);

  const addFiles = (list) => {
    const incoming = Array.from(list).slice(0, MAX_IMAGES - files.length);
    const mapped = incoming.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setContent('');
    setFiles([]);
    setVisibility('public');
    setFocused(!compact);
  };

  const submit = async () => {
    if (!content.trim() && !files.length) return;
    const fd = new FormData();
    fd.append('content', content);
    fd.append('visibility', visibility);
    files.forEach((f) => fd.append('images', f.file));
    await createPost.mutateAsync(fd);
    reset();
    onPosted?.();
  };

  const over = content.length > MAX_CHARS;

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.name} size="md" />
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            rows={focused ? 3 : 1}
            className="w-full resize-none bg-transparent text-content placeholder:text-muted/70 outline-none"
          />

          {/* Image previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn('mt-2 grid gap-2', files.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}
              >
                {files.map((f, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-line">
                    <img src={f.preview} alt="" className="h-40 w-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center justify-between border-t border-line pt-3"
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={files.length >= MAX_IMAGES}
                    className="grid h-9 w-9 place-items-center rounded-lg text-brand-600 transition hover:bg-brand-600/10 disabled:opacity-40"
                    title="Add images"
                  >
                    <FiImage size={18} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVisibility((v) => (v === 'public' ? 'followers' : 'public'))}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-2"
                    title="Toggle visibility"
                  >
                    {visibility === 'public' ? <FiGlobe size={14} /> : <FiUsers size={14} />}
                    {visibility === 'public' ? 'Public' : 'Followers'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn('text-xs', over ? 'text-danger' : 'text-muted')}>
                    {content.length}/{MAX_CHARS}
                  </span>
                  <Button
                    size="sm"
                    variant="gradient"
                    loading={createPost.isPending}
                    disabled={(!content.trim() && !files.length) || over}
                    onClick={submit}
                  >
                    Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
