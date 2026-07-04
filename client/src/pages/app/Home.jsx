import { useState } from 'react';
import PostComposer from '@/components/feed/PostComposer';
import PostList from '@/components/feed/PostList';
import RightRail from '@/components/feed/RightRail';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { usePostFeed } from '@/features/posts/usePosts';

const TABS = [
  { value: 'feed', label: 'For You' },
  { value: 'explore', label: 'Explore' },
];

export default function Home() {
  const [tab, setTab] = useState('feed');
  // Only fetch the active tab; the other initializes lazily on switch.
  const feedQuery = usePostFeed('feed', undefined, { enabled: tab === 'feed' });
  const exploreQuery = usePostFeed('explore', undefined, { enabled: tab === 'explore' });
  const query = tab === 'feed' ? feedQuery : exploreQuery;

  return (
    <div className="container-app flex gap-6 py-6">
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-2xl space-y-4">
          <PostComposer compact />

          <div className="sticky top-16 z-20 -mx-1 rounded-xl bg-surface/80 px-1 backdrop-blur-xl">
            <Tabs tabs={TABS} value={tab} onChange={setTab} />
          </div>

          <PostList
            query={query}
            emptyTitle={tab === 'feed' ? 'Your feed is quiet' : 'Nothing to explore yet'}
            emptyDescription={
              tab === 'feed'
                ? 'Follow people or switch to Explore to discover posts from across ArtROOT Chat.'
                : 'Be the first to share something with the community!'
            }
            emptyAction={
              tab === 'feed' ? (
                <Button variant="gradient" size="sm" onClick={() => setTab('explore')}>
                  Explore posts
                </Button>
              ) : null
            }
          />
        </div>
      </div>
      <RightRail />
    </div>
  );
}
