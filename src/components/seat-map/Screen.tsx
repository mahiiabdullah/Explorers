export function Screen() {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative h-2 w-3/4 max-w-2xl rounded-[50%] bg-cinema-amber/40 blur-md" />
      <div
        className="screen-glow -mt-3 h-2 w-3/4 max-w-2xl rounded-[50%]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #F5A524 20%, #F5A524 80%, transparent 100%)',
        }}
      />
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-cinema-muted">Screen</p>
    </div>
  );
}
