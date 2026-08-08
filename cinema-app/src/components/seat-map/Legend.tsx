export function Legend() {
  const items = [
    { label: 'Available', color: 'bg-cinema-surface border-cinema-border' },
    { label: 'Premium', color: 'bg-cinema-gold/30 border-cinema-gold/50' },
    { label: 'Held', color: 'bg-cinema-amber/30 border-cinema-amber/70 animate-pulse-soft' },
    { label: 'Booked', color: 'bg-cinema-crimson/20 border-cinema-crimson/30' },
    { label: 'Your selection', color: 'bg-cinema-amber border-cinema-amber' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded border ${item.color}`} />
          <span className="text-cinema-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
