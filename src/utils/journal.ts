// Small helpers for the blog and the feed (the "journal" pages): dates, reading time, a plain-text
// excerpt and the day's highlights, all from the markdown body the loader keeps.

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dayNoYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });
const weekdayShort = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });

/** 4 Nov 2026 */
export const fmtDay = (d: Date) => day.format(d);
/** 4 Nov */
export const fmtDayShort = (d: Date) => dayNoYear.format(d);
/** November 2026 */
export const fmtMonth = (d: Date) => month.format(d);
/** Wednesday */
export const fmtWeekday = (d: Date) => weekday.format(d);
/** Wed */
export const fmtWeekdayShort = (d: Date) => weekdayShort.format(d);

/** 2026-11-04, in UTC, as the feed's URLs have it. */
export function isoDay(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g;

/** Minutes to read: words at 220 a minute, Chinese and Japanese characters at 400. Code is skipped. */
export function readingMinutes(markdown = '') {
  const text = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  const cjk = (text.match(CJK) ?? []).length;
  const words = text.replace(CJK, ' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return Math.max(1, Math.round(words / 220 + cjk / 400));
}

/** Markdown inline syntax to plain text. */
function plain(s: string) {
  return s
    .replace(/!\[[^\]]*\]\((?:[^()]|\([^)]*\))*\)/g, '')
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\S*%[0-9A-F]{2}\S*/gi, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_~`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A description from the frontmatter as one clean line (some migrated posts carry a file path). */
export function tidy(text = '') {
  return plain(text.replace(/\/[^/\s]*%[0-9A-F]{2}[\s\S]*$/i, ''));
}

/** The first lines of prose in a post, as plain text, cut at about `max` characters. */
export function excerpt(markdown = '', max = 170) {
  const body = markdown.replace(/```[\s\S]*?```/g, '\n').replace(/\$\$[\s\S]*?\$\$/g, '\n');
  const lines = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((b) => b && !/^(#|>|\||!\[|<|---|\* \* \*|- \[)/.test(b))
    .map((b) => plain(b.replace(/^[-*+]\s+|^\d+\.\s+/gm, '')))
    .filter((t) => t.length > 12);
  const text = lines.join(' ');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,.;:，。；：、\s]+$/, '')}…`;
}

/** The bold lead of each bullet under a briefing's "## 重点" heading. */
export function highlights(markdown = '', count = 5) {
  const section = markdown.match(/##\s*重点\s*\n([\s\S]*?)(?=\n---|\n##\s|$)/);
  if (!section) return [];
  return section[1]
    .split('\n')
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .slice(0, count)
    .map((l) => {
      const bold = l.match(/\*\*(.+?)\*\*/);
      return plain(bold ? bold[1] : l.replace(/^\s*[-*]\s+/, '')).replace(/[。.]$/, '');
    })
    .filter(Boolean);
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

/** Headings for the contents column: the top two levels the text uses below its title. */
export function contentsOf(headings: Heading[] = []) {
  const inside = headings.filter((h) => h.depth >= 2 && h.depth <= 4 && h.text.trim());
  if (!inside.length) return [];
  const top = Math.min(...inside.map((h) => h.depth));
  return inside.filter((h) => h.depth <= top + 1).map((h) => ({ ...h, sub: h.depth > top }));
}
