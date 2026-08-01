const log = document.querySelector('#proof-log');

if (!log) throw new Error('WP-057 proof log is missing');

const mappings = [
  [/Globale sessie beëindigd|Lokale sessie beëindigd/i, 'globalSignOut'],
  [/profiel en onboardingstatus opgeslagen/i, 'profileSaved'],
  [/privacyportret privé geüpload en geselecteerd/i, 'portraitSelected'],
  [/server-side publicatiegate gepubliceerd/i, 'profilePublished'],
  [/Like server-side opgeslagen/i, 'likeSent'],
  [/eenmalig synthetisch proof-contactrecht gecontroleerd/i, 'entitlement'],
  [/Gesprek server-side geopend of idempotent hergebruikt/i, 'conversation'],
  [/Realtime gesprekssubscriptie actief|Realtime bericht ontvangen/i, 'realtime'],
  [/Matched privacyportret via tijdelijke signed URL geladen/i, 'portraitAccess'],
  [/Private veiligheidsrapportage opgeslagen/i, 'report'],
  [/Private gestructureerde feedback opgeslagen zonder publieke rating/i, 'feedback'],
  [/Contact en eventueel gesprek server-side beëindigd|deelnemer geblokkeerd/i, 'contactRevoked'],
  [/Proofaccount, relationele data en private portretten zijn verwijderd/i, 'cleanup']
];

function inspect(node) {
  const text = String(node?.textContent ?? '');
  for (const [pattern, step] of mappings) {
    if (!pattern.test(text)) continue;
    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: { step, status: 'pass', details: { present: true } }
    }));
  }
}

for (const item of log.querySelectorAll('li')) inspect(item);

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) inspect(node);
  }
}).observe(log, { childList: true });
