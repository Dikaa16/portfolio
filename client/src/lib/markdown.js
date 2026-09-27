import MarkdownIt from 'markdown-it';
import abbr from 'markdown-it-abbr';
import deflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
// Common subset (~35 languages) instead of all ~190 keeps the bundle small
import hljs from 'highlight.js/lib/common';
import DOMPurify from 'dompurify';

// =============================================
// Admonition icons
// =============================================
const ADMONITION_ICONS = {
  note: 'ℹ️', info: 'ℹ️',
  tip: '💡', success: '✅', hint: '💡',
  warning: '⚠️', caution: '⚠️', attention: '⚠️',
  danger: '🚨', error: '❌', bug: '🐛',
  example: '📝', abstract: '📋', question: '❓',
  quote: '💬', failure: '❗'
};

const ADMONITION_TYPES = Object.keys(ADMONITION_ICONS);

// =============================================
// Pre-process markdown to convert admonition
// syntax into HTML before passing to marked.
// Supports:
//   :::warning Title Here       !!! warning Title Here
//   Content goes here           Content goes here
//   :::                         !!!
// =============================================
function preprocessAdmonitions(markdown) {
  // Match both ::: and !!! delimiters
  const regex = /^(?::::|!!!) *(\w+)(?: +(.+))?\n([\s\S]*?)(?::::|!!!)\s*$/gm;
  
  return markdown.replace(regex, (match, type, title, body) => {
    const typeLower = type.toLowerCase();
    if (!ADMONITION_TYPES.includes(typeLower)) return match;
    
    const displayTitle = title || typeLower.charAt(0).toUpperCase() + typeLower.slice(1);
    const icon = ADMONITION_ICONS[typeLower] || 'ℹ️';
    
    // Return a placeholder that won't be parsed as markdown structure
    // We use a unique marker that we'll replace after marked processes everything
    const id = Math.random().toString(36).substring(2, 10);
    return `\n<div class="admonition admonition-${typeLower}" data-admonition="${id}"><p class="admonition-title">${icon} ${displayTitle}</p>\n\n${body.trim()}\n\n</div>\n`;
  });
}

// =============================================
// markdown-it with the standard syntax plugins:
// emoji, footnotes, definition lists, abbreviations,
// ==mark==, ++ins++, ~sub~ and ^sup^
// =============================================
const md = new MarkdownIt({
  html: true,        // raw HTML is allowed; DOMPurify sanitizes the output
  linkify: true,     // bare URLs become links
  typographer: true, // smart quotes, dashes, (c) -> ©
  breaks: true       // a single newline is a line break, as posts were written
})
  .use(emoji)
  .use(footnote)
  .use(deflist)
  .use(abbr)
  .use(mark)
  .use(ins)
  .use(sub)
  .use(sup);

const escapeHtml = md.utils.escapeHtml;

const highlight = (code, lang) => {
  try {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
};

// Fenced and indented code: highlighted, with a language label
const renderCode = (code, lang) => {
  const label = lang ? `<span class="code-lang-label">${escapeHtml(lang)}</span>` : '';
  const langClass = lang ? ` language-${escapeHtml(lang)}` : '';
  return `<div class="code-block-wrapper">${label}<pre><code class="hljs${langClass}">${highlight(code, lang)}</code></pre></div>\n`;
};

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  return renderCode(token.content, token.info.trim().split(/\s+/)[0]);
};
md.renderer.rules.code_block = (tokens, idx) => renderCode(tokens[idx].content, '');

// Images become figures, with the alt text as the caption
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  const alt = escapeHtml(token.content);
  const title = token.attrGet('title');
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<figure class="blog-figure"><img src="${escapeHtml(token.attrGet('src'))}" alt="${alt}"${titleAttr} loading="lazy" />` +
    `${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
};

// Wide tables scroll inside a wrapper instead of stretching the page
md.renderer.rules.table_open = () => '<div class="blog-table-wrapper"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';

md.renderer.rules.blockquote_open = () => '<blockquote class="blog-blockquote">\n';

// Embedded video iframes are allowed only from these hosts
const IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  try {
    const { protocol, hostname } = new URL(node.getAttribute('src') || '');
    if (protocol === 'https:' && IFRAME_HOSTS.includes(hostname)) return;
  } catch {}
  node.parentNode?.removeChild(node);
});

// Wrapper: preprocess admonitions, parse, then strip scripts/unsafe HTML
export function parseMarkdown(content) {
  return DOMPurify.sanitize(md.render(preprocessAdmonitions(content)), {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['loading', 'allow', 'allowfullscreen', 'frameborder'],
  });
}
