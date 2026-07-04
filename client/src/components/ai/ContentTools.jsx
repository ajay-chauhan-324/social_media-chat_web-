import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiImage, FiHash, FiUser, FiType, FiCheckSquare, FiGlobe,
  FiFileText, FiEdit3, FiMessageSquare, FiBriefcase, FiZap, FiCopy, FiArrowLeft,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { useRunTool } from '@/features/ai/useAI';
import { cn } from '@/lib/cn';

const META = {
  caption: { icon: FiImage, desc: 'Turn an idea into a scroll-stopping caption', placeholder: 'Describe your photo or post…' },
  hashtags: { icon: FiHash, desc: 'Get relevant, trending hashtags', placeholder: 'What is your post about?' },
  bio: { icon: FiUser, desc: 'Craft a memorable profile bio', placeholder: 'A few words about you…' },
  headline: { icon: FiType, desc: 'Write a punchy professional headline', placeholder: 'Your role / focus…' },
  grammar: { icon: FiCheckSquare, desc: 'Fix grammar & spelling instantly', placeholder: 'Paste text to correct…' },
  translate: { icon: FiGlobe, desc: 'Translate to any language', placeholder: 'e.g. "to Hindi: Good morning"' },
  summarize: { icon: FiFileText, desc: 'Summarize long text in seconds', placeholder: 'Paste text to summarize…' },
  improve: { icon: FiEdit3, desc: 'Polish your writing for impact', placeholder: 'Paste text to improve…' },
  post: { icon: FiZap, desc: 'Generate a full social post', placeholder: 'What do you want to post about?' },
  comment: { icon: FiMessageSquare, desc: 'Write the perfect comment', placeholder: 'What is the post about?' },
  resume: { icon: FiBriefcase, desc: 'Sharpen your resume bullets', placeholder: 'Paste a resume bullet…' },
  imageprompt: { icon: FiImage, desc: 'Craft vivid AI image prompts', placeholder: 'Describe the image you imagine…' },
};

export default function ContentTools({ tools }) {
  const [active, setActive] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const run = useRunTool();

  const toolList = tools.filter((t) => t.key !== 'assistant' && META[t.key]);

  const generate = async () => {
    if (!input.trim()) return;
    setResult('');
    const content = await run.mutateAsync({ tool: active.key, input, save: true });
    setResult(content);
  };

  const copy = () => {
    navigator.clipboard?.writeText(result);
    toast.success('Copied to clipboard');
  };

  if (active) {
    const Icon = META[active.key].icon;
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => { setActive(null); setInput(''); setResult(''); }}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
        >
          <FiArrowLeft /> All tools
        </button>

        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-content">{active.label}</h2>
              <p className="text-sm text-muted">{META[active.key].desc}</p>
            </div>
          </div>

          <Textarea
            className="mt-4"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={META[active.key].placeholder}
          />
          <Button variant="gradient" className="mt-3" loading={run.isPending} disabled={!input.trim()} onClick={generate} leftIcon={<FiZap />}>
            Generate
          </Button>

          {result && (
            <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Result</span>
                <button onClick={copy} className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                  <FiCopy size={14} /> Copy
                </button>
              </div>
              <p className="text-[15px] leading-relaxed text-content" style={{ whiteSpace: 'pre-wrap' }}>
                {result}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {toolList.map((t) => {
        const Icon = META[t.key].icon;
        return (
          <button
            key={t.key}
            onClick={() => setActive(t)}
            className={cn(
              'card group p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-soft'
            )}
          >
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-600/10 text-brand-600 transition group-hover:bg-brand-gradient group-hover:text-white">
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-content">{t.label}</h3>
            <p className="mt-1 text-sm text-muted">{META[t.key].desc}</p>
          </button>
        );
      })}
    </div>
  );
}
