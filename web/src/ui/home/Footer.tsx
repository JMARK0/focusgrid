import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const SHARE_TEXT = 'Can you beat my time on FocusGrid, a fast-paced focus trainer?';

interface SocialLink {
  name: string;
  glyph: ReactNode;
  color: string;
  buildHref: (url: string, text: string) => string;
}

// Speech-bubble and paper-plane glyphs, drawn once as plain SVG paths — not a
// Unicode/emoji character. The ☎ / ➤ glyphs they replaced depend on each
// platform's own emoji font (the same problem that broke the pause button on
// iOS): a telephone receiver doesn't read as "WhatsApp" at all, and drawing
// it ourselves means it renders pixel-identical on every device instead of
// varying by OS.
function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#fff"
        d="M12 3C6.9 3 2.8 6.7 2.8 11.3c0 2.1 1 4 2.6 5.5l-1 3.9c-.1.4.3.8.7.6l4-1.6c.9.3 1.9.4 2.9.4 5.1 0 9.2-3.7 9.2-8.3S17.1 3 12 3z"
      />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#fff"
        d="M3 11.5 20.5 4c.8-.3 1.6.4 1.3 1.2l-4.2 15c-.3.9-1.5 1.1-2 .3l-3.4-4.9-3 2.8c-.3.3-.8.1-.8-.3l.2-4-5-1.7c-.8-.3-.9-1.4 0-1.9z"
      />
    </svg>
  );
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'X',
    glyph: '𝕏',
    color: '#000000',
    buildHref: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    glyph: 'f',
    color: '#1877f2',
    buildHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    glyph: <ChatBubbleIcon />,
    color: '#25d366',
    buildHref: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'Telegram',
    glyph: <PaperPlaneIcon />,
    color: '#229ed9',
    buildHref: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Reddit',
    glyph: 'R',
    color: '#ff4500',
    buildHref: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
];

export default function Footer() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(timeout);
  }, [status]);

  const url = window.location.href;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setStatus('Link copied!');
      }
    } catch {
      // clipboard permission denied — silently ignore
    }
  };

  const handleMoreShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: 'FocusGrid', text: SHARE_TEXT, url });
    } catch {
      // user cancelled the native share sheet
    }
  };

  return (
    <footer className="app-footer">
      <div className="social-label">SHARE</div>
      <div className="social-row">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            className="social-btn"
            style={{ background: link.color }}
            href={link.buildHref(url, SHARE_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
          >
            {link.glyph}
          </a>
        ))}
        {'share' in navigator && (
          <button className="social-btn social-more" onClick={handleMoreShare} aria-label="More share options">
            ⋯
          </button>
        )}
      </div>
      <button className="copy-link-btn" onClick={handleCopyLink}>
        🔗 Copy link
      </button>
      {status && <span className="share-status">{status}</span>}
      <div className="copyright">© 2026–2029 Created by Janard</div>
    </footer>
  );
}
