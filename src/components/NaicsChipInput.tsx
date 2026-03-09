import { useMemo, useState } from 'react';

const NAICS_REGEX = /^\d{2,6}$/;

function splitTokens(raw: string): string[] {
  return raw
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function NaicsChipInput(props: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  error?: string;
  onErrorChange?: (msg: string) => void;
}) {
  const { value, onChange, max = 10, error, onErrorChange } = props;
  const [text, setText] = useState('');

  const cleanValue = useMemo(
    () => (value ?? []).map((v) => v.trim()).filter(Boolean),
    [value]
  );

  const commit = (raw: string) => {
    const tokens = splitTokens(raw);
    if (tokens.length === 0) return;

    const existing = new Set(cleanValue);
    const invalid: string[] = [];
    const duplicates: string[] = [];
    const accepted: string[] = [];

    for (const t of tokens) {
      if (!NAICS_REGEX.test(t)) invalid.push(t);
      else if (existing.has(t)) duplicates.push(t);
      else {
        accepted.push(t);
        existing.add(t);
      }
    }

    const spaceLeft = Math.max(0, max - cleanValue.length);
    const toAdd = accepted.slice(0, spaceLeft);
    const overflow = accepted.slice(spaceLeft);

    const next = [...cleanValue, ...toAdd];
    onChange(next);

    const msgs: string[] = [];
    if (invalid.length) msgs.push(`Invalid: ${invalid.join(', ')}`);
    if (duplicates.length) msgs.push(`Duplicate ignored: ${duplicates.join(', ')}`);
    if (overflow.length) msgs.push(`Max ${max} reached; ignored: ${overflow.join(', ')}`);

    onErrorChange?.(msgs.length ? msgs.join(' • ') : '');
  };

  const removeAt = (idx: number) => {
    const next = cleanValue.filter((_, i) => i !== idx);
    onChange(next);
    onErrorChange?.('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-wizard-border bg-white p-2">
        {cleanValue.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-wizard-text"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="rounded-full px-1 hover:bg-wizard-bg"
              aria-label={`Remove NAICS ${chip}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={cleanValue.length >= max ? `Max ${max} codes` : 'Type code and press Enter'}
          disabled={cleanValue.length >= max}
          className="min-w-[180px] flex-1 bg-transparent p-2 text-sm text-gray-900 outline-none placeholder:text-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(text);
              setText('');
            }
            if (e.key === 'Backspace' && text.length === 0 && cleanValue.length > 0) {
              removeAt(cleanValue.length - 1);
            }
          }}
          onPaste={(e) => {
            const paste = e.clipboardData.getData('text');
            if (!paste) return;
            if (/[,\s]/.test(paste)) {
              e.preventDefault();
              commit(paste);
              setText('');
            }
          }}
        />
      </div>

      {error ? (
        <p className="text-error text-sm mt-1">{error}</p>
      ) : (
        <p className="text-wizard-text-muted text-xs mt-1">
          Add 2–6 digit NAICS codes. Paste comma/space separated. Max {max}.
        </p>
      )}
    </div>
  );
}