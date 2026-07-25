import { Link } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiHelpCircle, FiInfo, FiMail, FiShield } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import Logo from '@/components/ui/Logo';

const APP_VERSION = '1.0.0';

const SECTIONS = [
  {
    icon: FiInfo,
    title: 'About ArtROOT',
    body: 'ArtROOT is a place to share your work, chat with your network, and get help from an AI creative assistant — all in one app.',
  },
  {
    icon: FiShield,
    title: 'Privacy Policy',
    body: 'We only collect what’s needed to run your account and feed: profile info, posts, and messages you send. We never sell your data. You can delete your account and all associated data at any time from Settings.',
  },
  {
    icon: FiFileText,
    title: 'Terms & Conditions',
    body: 'By using ArtROOT you agree to keep your account activity respectful and lawful. Content you post is yours — you’re responsible for what you share. We may suspend accounts that violate community guidelines.',
  },
  {
    icon: FiHelpCircle,
    title: 'Help & Support',
    body: 'Having trouble with your account, posts, or messages? Check that you’re on the latest version of the app first, then reach out — we usually respond within a day.',
  },
];

export default function SettingsAbout() {
  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/app/settings"
            aria-label="Back to Settings"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-content transition hover:bg-surface-2"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-extrabold text-content">About & Support</h1>
            <p className="text-sm text-muted">App info, policies, and how to get help</p>
          </div>
        </div>

        <Card className="flex items-center gap-3">
          <Logo to="/app" />
          <div>
            <p className="font-semibold text-content">ArtROOT</p>
            <p className="text-sm text-muted">Version {APP_VERSION}</p>
          </div>
        </Card>

        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
                <Icon size={17} />
              </span>
              <h2 className="font-semibold text-content">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </Card>
        ))}

        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
              <FiMail size={17} />
            </span>
            <div>
              <p className="font-semibold text-content">Still need help?</p>
              <p className="text-sm text-muted">Contact our support team directly</p>
            </div>
          </div>
          <a
            href="mailto:support@artroot.app"
            className="btn-base h-10 rounded-xl border border-line px-4 text-sm font-medium text-content hover:bg-surface-2"
          >
            support@artroot.app
          </a>
        </Card>
      </div>
    </div>
  );
}
