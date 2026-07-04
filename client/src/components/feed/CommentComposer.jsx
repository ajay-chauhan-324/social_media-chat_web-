import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function CommentComposer({ onSubmit, isPending, autoFocus, placeholder = 'Write a comment…', compact }) {
  const { user } = useAuth();
  const [value, setValue] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    await onSubmit(text);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex items-start gap-2.5">
      <Avatar src={user?.avatar} name={user?.name} size={compact ? 'xs' : 'sm'} />
      <div className="flex flex-1 items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
          className="input-base min-h-[42px] resize-none py-2.5"
        />
        <Button type="submit" size="sm" variant="gradient" loading={isPending} disabled={!value.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
