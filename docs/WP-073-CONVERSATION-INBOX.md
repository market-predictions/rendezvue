# WP-073 scalable conversation inbox

**Date:** 2026-08-05  
**Issue:** #104  
**Status:** implementation in review; canonical owner confirmation pending

## Owner finding

The original Matches view was understandable with one match and one conversation, but did not scale. The match card identified the other participant while the conversation below was titled only `Gesprek`. Once multiple matches existed—or once the selected match card scrolled out of view—the user could not reliably determine which conversation was active or where each conversation had stopped.

## Product structure

WP-073 separates the messaging surface into three concepts:

1. **Gesprekken / Conversations** — matches with an existing conversation, ordered by most recent activity.
2. **Nieuwe matches / New matches** — active mutual matches for which no conversation has been opened yet.
3. **Eerdere contacten / Previous contacts** — retained, non-active match history where applicable.

Every conversation row exposes the other participant’s portrait or initials, name, latest message preview, latest activity time and an unread indicator. Selecting a row binds the complete right-hand panel to that match and conversation.

## Selected-conversation context

The selected conversation has a persistent header containing:

- portrait or initials;
- participant name;
- city and life-stage context where available;
- active/new/ended contact state.

Messages use the selected participant’s name in incoming-message metadata. Sending, realtime subscription, blocking, reporting and contact termination are all resolved from the selected match rather than from a single global match assumption.

## Responsive behaviour

Desktop uses a two-column inbox: the thread list on the left and the selected conversation on the right. On narrow screens, the list is shown first. Selecting a row opens the conversation panel and exposes a clear back control to return to the conversation list.

## Unread boundary

Unread state is derived from the latest incoming message and a local read timestamp per conversation. Browser storage contains only conversation identifiers and timestamps—never message bodies, profile prose or portraits. Opening a selected conversation advances the local read marker. This is an MVP participant-device convenience, not a server-synchronised read-receipt system.

## Data and privacy boundaries

- No new database tables, message columns or participant permissions are introduced.
- Existing match, conversation, message, portrait and safety RLS remain authoritative.
- Portrait access remains server-gated and time-limited.
- Realtime listens only to the currently selected conversation.
- Contact-right activation is still validated before opening a new conversation.
- Real-user admission remains unauthorized.

## Regression contract

The implementation includes:

- pure inbox-model tests for grouping, sorting, participant resolution, previews and unread markers;
- integration tests for distinct list/panel regions, selection scoping, responsive behaviour and bilingual copy;
- the existing contact-entitlement regression updated to follow the conversation-opening logic into the dedicated controller;
- syntax checks for the shell, inbox controller and inbox model;
- generated Cloudflare artifact checks;
- commit-matched canonical checks for the delivered shell, controller, model and styling.

## Acceptance boundary

Technical validation proves that the multi-conversation architecture is present and delivered. Issue #104 remains open until the owner visually confirms that multiple conversations are understandable on representative desktop and mobile widths and that switching conversations preserves the correct participant, messages and safety target.
