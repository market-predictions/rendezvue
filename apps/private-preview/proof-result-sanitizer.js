const output = document.querySelector('#result-output');
const textTargets = [
  document.querySelector('#user-summary'),
  document.querySelector('#interaction-match-summary'),
  document.querySelector('#conversation-summary')
].filter(Boolean);

const sensitiveKey = /(^id$|_id$|user|email|token|secret|password|path|url|redirect|object|session)/i;
const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const jwtPattern = /\beyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\b/g;
const tokenFragmentPattern = /(?:access_token|refresh_token|code)=[^&#\s]+/gi;
let rewriting = false;

function redactString(value) {
  return String(value)
    .replace(jwtPattern, '[redacted-token]')
    .replace(tokenFragmentPattern, '[redacted-auth-value]')
    .replace(uuidPattern, '[redacted-id]');
}

function sanitize(value, key = '') {
  if (sensitiveKey.test(key)) {
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
    return '[redacted]';
  }
  if (Array.isArray(value)) return value.map((entry) => sanitize(entry));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      sanitize(childValue, childKey)
    ]));
  }
  if (typeof value === 'string') return redactString(value);
  return value;
}

function sanitizeOutput() {
  if (!output || rewriting) return;
  const raw = output.textContent ?? '';
  try {
    const parsed = JSON.parse(raw);
    const next = JSON.stringify(sanitize(parsed), null, 2);
    if (next === raw) return;
    rewriting = true;
    output.textContent = next;
    rewriting = false;
  } catch {
    const next = redactString(raw);
    if (next === raw) return;
    rewriting = true;
    output.textContent = next;
    rewriting = false;
  }
}

function sanitizeTextTarget(target) {
  if (rewriting) return;
  const raw = target.textContent ?? '';
  const next = redactString(raw);
  if (next === raw) return;
  rewriting = true;
  target.textContent = next;
  rewriting = false;
}

if (output) {
  new MutationObserver(sanitizeOutput).observe(output, { childList: true, characterData: true, subtree: true });
  sanitizeOutput();
}

for (const target of textTargets) {
  new MutationObserver(() => sanitizeTextTarget(target)).observe(target, { childList: true, characterData: true, subtree: true });
  sanitizeTextTarget(target);
}
