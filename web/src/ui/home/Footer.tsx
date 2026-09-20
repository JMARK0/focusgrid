import { useEffect, useState } from 'react';

const SHARE_TEXT = 'Can you beat my time on FocusGrid, a fast-paced focus trainer?';

interface SocialLink {
  name: string;
  glyph: string;
  color: string;
  buildHref: (url: string, text: string) => string;
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
    glyph: '☎',
    color: '#25d366',
    buildHref: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'Telegram',
    glyph: '➤',
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
    </footer>
  );
}
