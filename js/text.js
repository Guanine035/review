export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('∼', '~')
    .replaceAll('¬', '~')
    .replaceAll('−', '-')
    .replaceAll('–', '-')
    .replaceAll('≤', '<=')
    .replaceAll('≥', '>=')
    .replaceAll('≠', '!=')
    .replaceAll('\u00a0', ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/<>,()])\s*/g, '$1');
}

export function answerMatches(input, question) {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  const accepted = [question.answer, ...(question.accept || [])].filter((v) => v !== undefined && v !== null);
  return accepted.some((candidate) => normalizeAnswer(candidate) === normalized);
}

export function formatPercent(correct, total) {
  if (!total) return '0%';
  return `${Math.round((correct / total) * 100)}%`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
