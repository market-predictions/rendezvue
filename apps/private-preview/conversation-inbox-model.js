const READ_STORAGE_PREFIX = 'rendezvue:conversation-read:';

function asMap(value) {
  if (value instanceof Map) return value;
  if (!value || typeof value !== 'object') return new Map();
  return new Map(Object.entries(value));
}

function timestampValue(value) {
  const timestamp = Date.parse(String(value ?? ''));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function otherParticipantId(match, currentUserId) {
  if (!match || !currentUserId) return null;
  if (match.user_a_id === currentUserId) return String(match.user_b_id ?? '') || null;
  if (match.user_b_id === currentUserId) return String(match.user_a_id ?? '') || null;
  return null;
}

export function conversationReadStorageKey(userId) {
  const id = String(userId ?? '').trim();
  return id ? `${READ_STORAGE_PREFIX}${id}` : null;
}

export function readConversationMarkers(storage, userId) {
  const key = conversationReadStorageKey(userId);
  if (!key || !storage?.getItem) return Object.freeze({});
  try {
    const parsed = JSON.parse(storage.getItem(key) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return Object.freeze({});
    const valid = Object.fromEntries(Object.entries(parsed)
      .filter(([conversationId, value]) => conversationId && timestampValue(value) > 0)
      .map(([conversationId, value]) => [conversationId, new Date(value).toISOString()]));
    return Object.freeze(valid);
  } catch {
    return Object.freeze({});
  }
}

export function markConversationRead(storage, userId, conversationId, timestamp) {
  const key = conversationReadStorageKey(userId);
  const id = String(conversationId ?? '').trim();
  const nextTime = timestampValue(timestamp);
  if (!key || !id || !nextTime || !storage?.setItem) return readConversationMarkers(storage, userId);
  const current = { ...readConversationMarkers(storage, userId) };
  if (nextTime > timestampValue(current[id])) current[id] = new Date(nextTime).toISOString();
  try {
    storage.setItem(key, JSON.stringify(current));
  } catch {
    // The inbox remains functional when browser storage is unavailable.
  }
  return Object.freeze(current);
}

export function truncateConversationPreview(value, maxLength = 78) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  const limit = Math.max(12, Number(maxLength) || 78);
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(1, limit - 1)).trimEnd()}…`;
}

export function formatConversationListTime(value, language = 'nl', now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = language === 'en' ? 'en-GB' : 'nl-NL';
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round((today - target) / 86_400_000);
  if (dayDifference === 0) {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  if (dayDifference > 0 && dayDifference < 7) {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  }
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
  }
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function buildConversationInbox({
  matches = [],
  conversations = [],
  profilesByUserId,
  portraitsByUserId,
  latestMessagesByConversationId,
  currentUserId,
  readMarkers = {}
} = {}) {
  const profiles = asMap(profilesByUserId);
  const portraits = asMap(portraitsByUserId);
  const latestMessages = asMap(latestMessagesByConversationId);
  const conversationByMatchId = new Map((conversations ?? []).map((conversation) => [conversation.match_id, conversation]));
  const markers = readMarkers && typeof readMarkers === 'object' ? readMarkers : {};

  const entries = (matches ?? []).map((match) => {
    const otherUserId = otherParticipantId(match, currentUserId);
    const profile = profiles.get(otherUserId)?.display ?? profiles.get(otherUserId) ?? {};
    const conversation = conversationByMatchId.get(match.id) ?? null;
    const latestMessage = conversation ? latestMessages.get(conversation.id) ?? null : null;
    const latestAt = latestMessage?.created_at ?? conversation?.opened_at ?? match.matched_at ?? null;
    const incoming = Boolean(latestMessage && latestMessage.sender_user_id !== currentUserId);
    const unread = Boolean(
      conversation?.status === 'open'
      && incoming
      && timestampValue(latestMessage?.created_at) > timestampValue(markers[conversation.id])
    );

    return Object.freeze({
      matchId: String(match.id ?? ''),
      matchStatus: String(match.status ?? ''),
      matchedAt: match.matched_at ?? null,
      otherUserId,
      nickname: String(profile.nickname ?? '').trim() || 'Rendezvue',
      city: String(profile.city ?? profile.city_region ?? '').trim(),
      lifeStage: String(profile.lifeStage ?? profile.primary_status ?? '').trim(),
      portraitUrl: portraits.get(otherUserId) ?? profile.portraitAsset ?? null,
      conversationId: conversation ? String(conversation.id ?? '') : null,
      conversationStatus: conversation ? String(conversation.status ?? '') : null,
      conversationOpenedAt: conversation?.opened_at ?? null,
      latestMessage,
      latestMessagePreview: truncateConversationPreview(latestMessage?.body ?? ''),
      latestAt,
      unread,
      sortAt: timestampValue(latestAt ?? match.matched_at)
    });
  });

  const byNewest = (left, right) => right.sortAt - left.sortAt || right.matchId.localeCompare(left.matchId);
  const conversationEntries = entries.filter((entry) => entry.conversationId).sort(byNewest);
  const newMatches = entries
    .filter((entry) => !entry.conversationId && entry.matchStatus === 'active')
    .sort(byNewest);
  const endedWithoutConversation = entries
    .filter((entry) => !entry.conversationId && entry.matchStatus !== 'active')
    .sort(byNewest);

  return Object.freeze({
    conversations: Object.freeze(conversationEntries),
    newMatches: Object.freeze(newMatches),
    endedWithoutConversation: Object.freeze(endedWithoutConversation),
    all: Object.freeze([...conversationEntries, ...newMatches, ...endedWithoutConversation])
  });
}

export function chooseInitialMatchId(inbox, currentMatchId) {
  const all = inbox?.all ?? [];
  const requested = String(currentMatchId ?? '').trim();
  if (requested && all.some((entry) => entry.matchId === requested)) return requested;
  return inbox?.conversations?.[0]?.matchId
    ?? inbox?.newMatches?.[0]?.matchId
    ?? inbox?.endedWithoutConversation?.[0]?.matchId
    ?? null;
}
