type Props = {
  codes: string[];
  maxInline?: number;
};

export function NaicsInline({ codes, maxInline = 2 }: Props) {
  const clean = (codes ?? []).map((c) => c.trim()).filter(Boolean);
  if (clean.length === 0)
    return <span className="text-wizard-text-muted">—</span>;

  const inline = clean.slice(0, maxInline);
  const overflow = clean.length - inline.length;
  const all = clean.join(", ");

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      <span>{inline.join(", ")}</span>
      {overflow > 0 ? (
        <span
          className="cursor-help rounded-sm px-1 text-sm text-wizard-text-muted underline decoration-dotted"
          title={all}
          aria-label={`NAICS codes: ${all}`}
        >
          +{overflow} more
        </span>
      ) : null}
    </span>
  );
}
