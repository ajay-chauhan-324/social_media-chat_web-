import { useState } from 'react';
import { FiCpu, FiAlertCircle } from 'react-icons/fi';
import Tabs from '@/components/ui/Tabs';
import Spinner from '@/components/ui/Spinner';
import AssistantChat from '@/components/ai/AssistantChat';
import ContentTools from '@/components/ai/ContentTools';
import { useAITools } from '@/features/ai/useAI';

const TABS = [
  { value: 'assistant', label: 'Assistant' },
  { value: 'tools', label: 'Content Tools' },
];

export default function AIStudio() {
  const [tab, setTab] = useState('assistant');
  const { data, isLoading } = useAITools();

  return (
    <div className="container-app py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
          <FiCpu size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold text-content">AI Studio</h1>
          <p className="text-sm text-muted">Chat, create, and generate — powered by AI</p>
        </div>
      </div>

      {!isLoading && data && !data.aiEnabled && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-content">
          <FiAlertCircle className="shrink-0 text-warning" />
          Running in demo mode — add <code className="mx-1 rounded bg-surface-2 px-1.5 py-0.5">OPENAI_API_KEY</code> to the
          server to enable real AI responses. History &amp; tools work either way.
        </div>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      {isLoading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Spinner size={26} className="text-brand-600" />
        </div>
      ) : tab === 'assistant' ? (
        <AssistantChat />
      ) : (
        <ContentTools tools={data?.tools || []} />
      )}
    </div>
  );
}
