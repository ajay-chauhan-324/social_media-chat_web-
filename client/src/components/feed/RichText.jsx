import { Link } from 'react-router-dom';

/** Render post/comment text with #hashtags, @mentions, and URLs as links. */
const TOKEN = /(#[\p{L}0-9_]+|@[a-z0-9_.]+|https?:\/\/[^\s]+)/giu;

export default function RichText({ text = '', className }) {
  const parts = text.split(TOKEN);
  return (
    <p className={className} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('#')) {
          return (
            <Link
              key={i}
              to={`/app/hashtag/${part.slice(1).toLowerCase()}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith('@')) {
          return (
            <Link
              key={i}
              to={`/app/profile/${part.slice(1).toLowerCase()}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith('http')) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
