import { FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';

const GROUPS = [
  {
    title: 'Product',
    links: ['Features', 'AI Assistant', 'Pricing', 'Roadmap'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press'],
  },
  {
    title: 'Resources',
    links: ['Help Center', 'Community', 'API Docs', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
];

const SOCIALS = [FiTwitter, FiInstagram, FiLinkedin, FiGithub];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Connect • Create • Collaborate. The premium AI-powered social platform built for
              creators, professionals, and communities.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-brand-500 hover:text-brand-600"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-content">{g.title}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted transition hover:text-brand-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} ArtROOT Chat. All rights reserved.</p>
          <p>Built with the MERN stack • Powered by AI</p>
        </div>
      </div>
    </footer>
  );
}
