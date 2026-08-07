from pathlib import Path

path = Path('.github/workflows/configure-cloudflare-staging.yml')
text = path.read_text(encoding='utf-8')
before = """          const primary = configs.filter((entry) => String(entry?.database_type ?? '').toUpperCase() === 'PRIMARY');
          const candidates = primary.length ? primary : configs;
          const selected = candidates.find((entry) => Number(entry?.db_port) === 5432)
            ?? candidates.find((entry) => String(entry?.pool_mode ?? '').toLowerCase() === 'session')
            ?? candidates[0];
"""
after = """          const primary = configs.filter((entry) => String(entry?.database_type ?? '').toUpperCase() === 'PRIMARY');
          if (!primary.length) {
            throw new Error('No PRIMARY database pooler configuration was returned');
          }
          const selected = primary.find((entry) => Number(entry?.db_port) === 5432)
            ?? primary.find((entry) => String(entry?.pool_mode ?? '').toLowerCase() === 'session');
          if (!selected) {
            throw new Error('No PRIMARY session-capable pooler configuration was returned');
          }
"""
if text.count(before) != 1:
    raise SystemExit(f'expected exactly one pooler selection block, found {text.count(before)}')
path.write_text(text.replace(before, after, 1), encoding='utf-8')
print('PRIMARY session pooler selection hardened.')
