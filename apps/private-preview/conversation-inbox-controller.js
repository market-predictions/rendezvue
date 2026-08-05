import { profileDisplayValue, projectDiscoveryProfile } from './product-model.js';
import {
  buildConversationInbox,
  chooseInitialMatchId,
  formatConversationListTime,
  markConversationRead,
  readConversationMarkers
} from './conversation-inbox-model.js';

function initials(name) {
  return String(name ?? 'R')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'R';
}

function createAvatar(entry, className) {
  const avatar = document.createElement('span');
  avatar.className = className;
  if (entry?.portraitUrl) {
    const image = document.createElement('img');
    image.src = entry.portraitUrl;
    image.alt = '';
    avatar.append(image);
  } else {
    avatar.textContent = initials(entry?.nickname);
  }
  return avatar;
}

function isMobileLayout() {
  return globalThis.matchMedia?.('(max-width: 760px)').matches === true;
}

export function createConversationInboxController({
  supabase,
  getLanguage,
  translate,
  setStatus,
  errorMessage,
  contactOpenErrorMessage
}) {
  const elements = {
    status: document.querySelector('#rv-match-status'),
    shell: document.querySelector('#rv-messaging-shell'),
    conversationSection: document.querySelector('#rv-conversation-section'),
    conversationList: document.querySelector('#rv-conversation-list'),
    newMatchSection: document.querySelector('#rv-new-match-section'),
    newMatchList: document.querySelector('#rv-new-match-list'),
    endedSection: document.querySelector('#rv-ended-match-section'),
    endedList: document.querySelector('#rv-ended-match-list'),
    panel: document.querySelector('#rv-conversation-panel'),
    header: document.querySelector('#rv-conversation-header'),
    chatList: document.querySelector('#rv-chat-list'),
    chatForm: document.querySelector('#rv-chat-form'),
    messageBody: document.querySelector('#rv-message-body'),
    safetyCard: document.querySelector('#rv-safety-card'),
    safetyStatus: document.querySelector('#rv-safety-status'),
    endContact: document.querySelector('#rv-end-contact'),
    blockUser: document.querySelector('#rv-block-user'),
    toggleReport: document.querySelector('#rv-toggle-report'),
    reportForm: document.querySelector('#rv-report-form'),
    reportCategory: document.querySelector('#rv-report-category'),
    reportDescription: document.querySelector('#rv-report-description'),
    refresh: document.querySelector('#rv-refresh-match')
  };

  const state = {
    user: null,
    matches: [],
    conversations: [],
    profilesByUserId: new Map(),
    portraitsByUserId: new Map(),
    latestMessagesByConversationId: new Map(),
    readMarkers: {},
    inbox: buildConversationInbox(),
    selectedMatchId: null,
    messages: [],
    realtimeChannel: null,
    mobileConversationOpen: false,
    loading: false
  };

  function t(key, replacements) {
    return translate(key, replacements);
  }

  function unwrap(result, operation) {
    if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'unknown error'}`);
    return result?.data ?? null;
  }

  function selectedEntry() {
    return state.inbox.all.find((entry) => entry.matchId === state.selectedMatchId) ?? null;
  }

  function selectedMatch() {
    return state.matches.find((match) => String(match.id) === state.selectedMatchId) ?? null;
  }

  function selectedConversation() {
    const entry = selectedEntry();
    if (!entry?.conversationId) return null;
    return state.conversations.find((conversation) => String(conversation.id) === entry.conversationId) ?? null;
  }

  function rebuildInbox() {
    state.inbox = buildConversationInbox({
      matches: state.matches,
      conversations: state.conversations,
      profilesByUserId: state.profilesByUserId,
      portraitsByUserId: state.portraitsByUserId,
      latestMessagesByConversationId: state.latestMessagesByConversationId,
      currentUserId: state.user?.id,
      readMarkers: state.readMarkers
    });
    state.selectedMatchId = chooseInitialMatchId(state.inbox, state.selectedMatchId);
  }

  function renderThreadSection(section, list, entries, emptyKey, kind) {
    if (!section || !list) return;
    section.hidden = entries.length === 0;
    list.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'rv-thread-empty';
      empty.textContent = t(emptyKey);
      list.append(empty);
      return;
    }

    for (const entry of entries) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `rv-thread-row rv-thread-row-${kind}`;
      const selected = entry.matchId === state.selectedMatchId;
      row.classList.toggle('selected', selected);
      row.classList.toggle('unread', entry.unread);
      row.dataset.matchId = entry.matchId;
      row.setAttribute('aria-pressed', String(selected));
      row.setAttribute('aria-label', entry.unread
        ? `${entry.nickname}, ${t('matches.unread')}`
        : entry.nickname);

      const avatar = createAvatar(entry, 'rv-thread-avatar');
      const content = document.createElement('span');
      content.className = 'rv-thread-content';
      const top = document.createElement('span');
      top.className = 'rv-thread-topline';
      const name = document.createElement('strong');
      name.textContent = entry.nickname;
      const time = document.createElement('time');
      time.dateTime = String(entry.latestAt ?? entry.matchedAt ?? '');
      time.textContent = formatConversationListTime(
        entry.latestAt ?? entry.matchedAt,
        getLanguage()
      );
      top.append(name, time);

      const bottom = document.createElement('span');
      bottom.className = 'rv-thread-bottomline';
      const preview = document.createElement('span');
      preview.className = 'rv-thread-preview';
      if (kind === 'conversation') {
        preview.textContent = entry.latestMessagePreview || t('matches.noMessages');
      } else if (kind === 'new') {
        preview.textContent = t('matches.newMatchHint');
      } else {
        preview.textContent = t('safety.ended');
      }
      bottom.append(preview);
      if (entry.unread) {
        const unread = document.createElement('span');
        unread.className = 'rv-unread-dot';
        unread.title = t('matches.unread');
        unread.setAttribute('aria-hidden', 'true');
        bottom.append(unread);
      }

      content.append(top, bottom);
      row.append(avatar, content);
      row.addEventListener('click', () => selectMatch(entry.matchId, { openOnMobile: true }));
      list.append(row);
    }
  }

  function renderLists() {
    renderThreadSection(
      elements.conversationSection,
      elements.conversationList,
      state.inbox.conversations,
      'matches.noConversations',
      'conversation'
    );
    renderThreadSection(
      elements.newMatchSection,
      elements.newMatchList,
      state.inbox.newMatches,
      'matches.noNewMatches',
      'new'
    );
    renderThreadSection(
      elements.endedSection,
      elements.endedList,
      state.inbox.endedWithoutConversation,
      'matches.none',
      'ended'
    );
  }

  function renderHeader(entry) {
    if (!elements.header) return;
    elements.header.replaceChildren();
    if (!entry) {
      const empty = document.createElement('div');
      empty.className = 'rv-conversation-header-empty';
      const heading = document.createElement('h2');
      heading.textContent = t('matches.selectConversation');
      const copy = document.createElement('p');
      copy.textContent = t('matches.selectConversationHint');
      empty.append(heading, copy);
      elements.header.append(empty);
      return;
    }

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'rv-conversation-back secondary';
    back.textContent = `← ${t('chat.back')}`;
    back.addEventListener('click', () => {
      state.mobileConversationOpen = false;
      render();
      elements.conversationList?.querySelector(`[data-match-id="${CSS.escape(entry.matchId)}"]`)?.focus();
    });

    const avatar = createAvatar(entry, 'rv-conversation-avatar');
    const copy = document.createElement('div');
    copy.className = 'rv-conversation-identity';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'rv-conversation-eyebrow';
    eyebrow.textContent = entry.conversationId ? t('chat.activeWith') : t('matches.newMatch');
    const heading = document.createElement('h2');
    heading.textContent = entry.nickname;
    const meta = document.createElement('p');
    const lifeStage = profileDisplayValue(getLanguage(), 'lifeStage', entry.lifeStage);
    const status = entry.matchStatus === 'active'
      ? (entry.conversationId ? t('matches.conversationActive') : t('matches.active'))
      : t('matches.contactEnded');
    meta.textContent = [entry.city, lifeStage, status].filter(Boolean).join(' · ');
    copy.append(eyebrow, heading, meta);
    elements.header.append(back, avatar, copy);
  }

  function renderMessages(entry) {
    if (!elements.chatList) return;
    elements.chatList.replaceChildren();
    if (!entry) {
      const empty = document.createElement('div');
      empty.className = 'rv-chat-empty';
      empty.textContent = t('matches.selectConversationHint');
      elements.chatList.append(empty);
      return;
    }

    if (!entry.conversationId) {
      const start = document.createElement('div');
      start.className = 'rv-conversation-start';
      const heading = document.createElement('h3');
      heading.textContent = t('matches.active');
      const copy = document.createElement('p');
      copy.textContent = t('matches.contactNote');
      start.append(heading, copy);
      if (entry.matchStatus === 'active') {
        const open = document.createElement('button');
        open.type = 'button';
        open.textContent = t('matches.contact');
        open.addEventListener('click', () => openConversation(open));
        start.append(open);
      }
      elements.chatList.append(start);
      return;
    }

    if (!state.messages.length) {
      const empty = document.createElement('div');
      empty.className = 'rv-chat-empty';
      empty.textContent = t('chat.empty');
      elements.chatList.append(empty);
      return;
    }

    for (const row of state.messages) {
      const bubble = document.createElement('article');
      const mine = row.sender_user_id === state.user?.id;
      bubble.className = `rv-bubble${mine ? ' mine' : ''}`;
      const body = document.createElement('p');
      body.textContent = row.body;
      const meta = document.createElement('small');
      meta.textContent = `${mine ? t('chat.you') : entry.nickname} · ${new Date(row.created_at).toLocaleTimeString(
        getLanguage() === 'nl' ? 'nl-NL' : 'en-GB',
        { hour: '2-digit', minute: '2-digit' }
      )}`;
      bubble.append(body, meta);
      elements.chatList.append(bubble);
    }
    elements.chatList.scrollTop = elements.chatList.scrollHeight;
  }

  function renderComposer(entry) {
    if (!elements.chatForm) return;
    const canSend = entry?.conversationId && entry.conversationStatus === 'open' && entry.matchStatus === 'active';
    elements.chatForm.hidden = !canSend;
    const send = elements.chatForm.querySelector('button');
    if (send) send.disabled = !canSend;
  }

  function renderSafety(entry) {
    if (!elements.safetyCard) return;
    elements.safetyCard.hidden = !entry;
    if (!entry) return;
    if (elements.endContact) elements.endContact.disabled = entry.matchStatus !== 'active';
    if (elements.blockUser) elements.blockUser.disabled = !entry.otherUserId;
    if (elements.toggleReport) elements.toggleReport.disabled = !entry.otherUserId;
  }

  function render() {
    rebuildInbox();
    renderLists();
    const entry = selectedEntry();
    renderHeader(entry);
    renderMessages(entry);
    renderComposer(entry);
    renderSafety(entry);
    elements.shell?.classList.toggle('conversation-open', state.mobileConversationOpen && Boolean(entry));
    elements.panel?.classList.toggle('has-selection', Boolean(entry));
  }

  function markSelectedRead() {
    const entry = selectedEntry();
    if (!entry?.conversationId || !entry.latestMessage?.created_at) return;
    state.readMarkers = markConversationRead(
      globalThis.localStorage,
      state.user?.id,
      entry.conversationId,
      entry.latestMessage.created_at
    );
    rebuildInbox();
  }

  async function subscribeSelectedConversation() {
    if (state.realtimeChannel) {
      await supabase.removeChannel(state.realtimeChannel);
      state.realtimeChannel = null;
    }
    const conversation = selectedConversation();
    if (!conversation) return;
    state.realtimeChannel = supabase
      .channel(`product-conversation-${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, () => loadSelectedMessages({ markRead: !isMobileLayout() || state.mobileConversationOpen }))
      .subscribe();
  }

  async function loadSelectedMessages({ markRead = true } = {}) {
    const conversation = selectedConversation();
    state.messages = [];
    if (!conversation) {
      render();
      return [];
    }
    const rows = unwrap(await supabase
      .from('messages')
      .select('id,conversation_id,sender_user_id,body,created_at')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true }), 'message load') ?? [];
    state.messages = rows;
    const latest = rows.at(-1) ?? null;
    if (latest) state.latestMessagesByConversationId.set(conversation.id, latest);
    rebuildInbox();
    if (markRead) markSelectedRead();
    render();
    return rows;
  }

  async function selectMatch(matchId, { openOnMobile = false } = {}) {
    const id = String(matchId ?? '');
    if (!state.inbox.all.some((entry) => entry.matchId === id)) return;
    state.selectedMatchId = id;
    state.mobileConversationOpen = openOnMobile && isMobileLayout();
    await loadSelectedMessages({ markRead: !isMobileLayout() || state.mobileConversationOpen });
    await subscribeSelectedConversation();
    render();
  }

  async function loadLatestMessages(conversations) {
    const pairs = await Promise.all((conversations ?? []).map(async (conversation) => {
      const rows = unwrap(await supabase
        .from('messages')
        .select('id,conversation_id,sender_user_id,body,created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1), 'conversation preview load') ?? [];
      return [conversation.id, rows[0] ?? null];
    }));
    return new Map(pairs.filter(([, message]) => Boolean(message)));
  }

  async function loadPortraits(entries) {
    const pairs = await Promise.all(entries.map(async ([match, otherUserId]) => {
      if (!otherUserId || match.status !== 'active') return [otherUserId, null];
      try {
        const objectPath = unwrap(await supabase.rpc('get_matched_portrait_path', {
          p_other_user_id: otherUserId
        }), 'matched portrait access');
        if (!objectPath) return [otherUserId, null];
        const signed = unwrap(await supabase.storage
          .from('privacy-portraits')
          .createSignedUrl(objectPath, 300), 'matched portrait URL');
        return [otherUserId, signed.signedUrl ?? null];
      } catch {
        return [otherUserId, null];
      }
    }));
    return new Map(pairs.filter(([userId, portrait]) => userId && portrait));
  }

  async function load(user = state.user) {
    state.user = user ?? null;
    if (!state.user || state.loading) {
      if (!state.user) reset();
      return state.inbox;
    }
    state.loading = true;
    setStatus(elements.status, t('status.loading'), 'info');
    try {
      const matches = unwrap(await supabase
        .from('matches')
        .select('id,user_a_id,user_b_id,status,matched_at,ended_at')
        .order('matched_at', { ascending: false }), 'match load') ?? [];
      const participantPairs = matches.map((match) => [
        match,
        match.user_a_id === state.user.id ? match.user_b_id : match.user_a_id
      ]);
      const otherUserIds = [...new Set(participantPairs.map(([, userId]) => userId).filter(Boolean))];
      const matchIds = matches.map((match) => match.id).filter(Boolean);

      const [profileRows, conversations, portraits] = await Promise.all([
        otherUserIds.length
          ? Promise.resolve(unwrap(await supabase
            .from('discovery_profiles')
            .select('user_id,nickname,sex,city_region,relationship_intent,bio,primary_status,published_at')
            .in('user_id', otherUserIds), 'matched profile load') ?? [])
          : Promise.resolve([]),
        matchIds.length
          ? Promise.resolve(unwrap(await supabase
            .from('conversations')
            .select('id,match_id,status,opened_at,ended_at')
            .in('match_id', matchIds), 'conversation list load') ?? [])
          : Promise.resolve([]),
        loadPortraits(participantPairs)
      ]);

      state.matches = matches;
      state.conversations = conversations;
      state.profilesByUserId = new Map(profileRows.map((row) => [row.user_id, projectDiscoveryProfile(row)]));
      state.portraitsByUserId = portraits;
      state.latestMessagesByConversationId = await loadLatestMessages(conversations);
      state.readMarkers = readConversationMarkers(globalThis.localStorage, state.user.id);
      rebuildInbox();
      state.selectedMatchId = chooseInitialMatchId(state.inbox, state.selectedMatchId);
      state.mobileConversationOpen = false;
      await loadSelectedMessages({ markRead: !isMobileLayout() });
      await subscribeSelectedConversation();
      setStatus(elements.status, '', 'info');
      return state.inbox;
    } catch (error) {
      setStatus(elements.status, errorMessage(error), 'error');
      throw error;
    } finally {
      state.loading = false;
    }
  }

  async function openConversation(button) {
    const match = selectedMatch();
    if (!match) return;
    button.disabled = true;
    try {
      unwrap(await supabase.rpc('claim_private_proof_entitlement'), 'contact entitlement activation');
      unwrap(await supabase.rpc('open_match_conversation', {
        p_match_id: match.id,
        p_idempotency_key: `product-shell-${match.id}`
      }), 'conversation open');
      await load(state.user);
      state.selectedMatchId = String(match.id);
      state.mobileConversationOpen = isMobileLayout();
      await selectMatch(match.id, { openOnMobile: true });
      setStatus(elements.status, t('matches.open'), 'success');
    } catch (error) {
      setStatus(elements.status, contactOpenErrorMessage(error, getLanguage()), 'error');
    } finally {
      button.disabled = false;
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const button = event.submitter;
    const conversation = selectedConversation();
    const entry = selectedEntry();
    button.disabled = true;
    try {
      if (!conversation || conversation.status !== 'open' || entry?.matchStatus !== 'active') {
        throw new Error(t('safety.ended'));
      }
      const body = elements.messageBody?.value.trim() ?? '';
      if (!body) return;
      unwrap(await supabase
        .from('messages')
        .insert({ conversation_id: conversation.id, sender_user_id: state.user.id, body })
        .select('id')
        .single(), 'message send');
      elements.messageBody.value = '';
      await loadSelectedMessages({ markRead: true });
    } catch (error) {
      setStatus(elements.status, errorMessage(error), 'error');
    } finally {
      button.disabled = selectedEntry()?.conversationStatus !== 'open';
    }
  }

  async function endContact() {
    const match = selectedMatch();
    if (!match) return;
    elements.endContact.disabled = true;
    try {
      unwrap(await supabase.rpc('end_match_contact', { p_match_id: match.id }), 'contact end');
      await load(state.user);
      setStatus(elements.safetyStatus, t('safety.ended'), 'success');
    } catch (error) {
      setStatus(elements.safetyStatus, errorMessage(error), 'error');
    } finally {
      renderSafety(selectedEntry());
    }
  }

  async function blockUser() {
    const entry = selectedEntry();
    if (!entry?.otherUserId) return;
    elements.blockUser.disabled = true;
    try {
      unwrap(await supabase.rpc('block_user', {
        p_blocked_user_id: entry.otherUserId,
        p_reason_code: 'synthetic_product_shell'
      }), 'user block');
      await load(state.user);
      setStatus(elements.safetyStatus, t('safety.blocked'), 'success');
    } catch (error) {
      setStatus(elements.safetyStatus, errorMessage(error), 'error');
    } finally {
      renderSafety(selectedEntry());
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    const button = event.submitter;
    const entry = selectedEntry();
    button.disabled = true;
    try {
      if (!entry?.otherUserId) throw new Error(t('matches.none'));
      unwrap(await supabase.rpc('create_safety_report', {
        p_subject_user_id: entry.otherUserId,
        p_match_id: entry.matchId,
        p_category: elements.reportCategory?.value,
        p_description: elements.reportDescription?.value.trim() || null
      }), 'safety report');
      setStatus(elements.safetyStatus, t('safety.reported'), 'success');
      elements.reportForm?.classList.remove('open');
      if (elements.reportDescription) elements.reportDescription.value = '';
    } catch (error) {
      setStatus(elements.safetyStatus, errorMessage(error), 'error');
    } finally {
      button.disabled = false;
    }
  }

  function bindEvents() {
    elements.refresh?.addEventListener('click', () => load(state.user));
    elements.chatForm?.addEventListener('submit', sendMessage);
    elements.endContact?.addEventListener('click', endContact);
    elements.blockUser?.addEventListener('click', blockUser);
    elements.toggleReport?.addEventListener('click', () => elements.reportForm?.classList.toggle('open'));
    elements.reportForm?.addEventListener('submit', submitReport);
  }

  async function reset() {
    if (state.realtimeChannel) await supabase.removeChannel(state.realtimeChannel);
    state.user = null;
    state.matches = [];
    state.conversations = [];
    state.profilesByUserId = new Map();
    state.portraitsByUserId = new Map();
    state.latestMessagesByConversationId = new Map();
    state.readMarkers = {};
    state.inbox = buildConversationInbox();
    state.selectedMatchId = null;
    state.messages = [];
    state.realtimeChannel = null;
    state.mobileConversationOpen = false;
    render();
  }

  async function setUser(user) {
    if (!user) return reset();
    state.user = user;
    return state.user;
  }

  function applyLanguage() {
    render();
  }

  async function destroy() {
    if (state.realtimeChannel) await supabase.removeChannel(state.realtimeChannel);
    state.realtimeChannel = null;
  }

  bindEvents();
  render();

  return Object.freeze({
    applyLanguage,
    destroy,
    load,
    selectMatch,
    setUser
  });
}
