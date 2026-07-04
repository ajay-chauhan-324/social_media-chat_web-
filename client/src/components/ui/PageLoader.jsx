import Spinner from './Spinner';
import Logo from './Logo';

export default function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-2">
      <div className="flex flex-col items-center gap-4">
        <Logo withText={false} />
        <Spinner size={28} className="text-brand-600" />
        <p className="text-sm text-muted">Loading ArtROOT Chat…</p>
      </div>
    </div>
  );
}
