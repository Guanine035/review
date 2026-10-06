import { escapeHtml } from './text.js';

function formatPlain(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

const katex = globalThis.katex;

function renderTex(tex, displayMode) {
  if (!katex) return `<code>${escapeHtml(tex)}</code>`;
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      strict: false,
      trust: false,
      output: 'htmlAndMathml'
    });
  } catch (error) {
    return `<code>${escapeHtml(tex)}</code>`;
  }
}

// Renders authored text containing $...$ (inline) and $$...$$ (display) math.
// Non-math text is escaped, so question content can never inject markup.
export function rich(text) {
  const source = String(text ?? '');
  let out = '';
  let i = 0;
  while (i < source.length) {
    const start = source.indexOf('$', i);
    if (start === -1) {
      out += formatPlain(source.slice(i));
      break;
    }
    out += formatPlain(source.slice(i, start));
    const display = source.startsWith('$$', start);
    const marker = display ? '$$' : '$';
    const close = source.indexOf(marker, start + marker.length);
    if (close === -1) {
      out += formatPlain(source.slice(start));
      break;
    }
    const tex = source.slice(start + marker.length, close);
    out += renderTex(tex, display);
    i = close + marker.length;
  }
  return out;
}

export function mathBlock(tex) {
  return `<div class="math-line">${renderTex(tex, true)}</div>`;
}

export function richList(items, className = 'steps') {
  if (!items || !items.length) return '';
  return `<ol class="${className}">${items.map((item) => `<li>${rich(item)}</li>`).join('')}</ol>`;
}
