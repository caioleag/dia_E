export default function OfflinePage() {
  return (
    <div className="h-screen bg-bg-deep flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
          Você está offline
        </h1>
        <p className="font-sans text-text-secondary text-sm">
          Conecte-se à internet para continuar jogando
        </p>
      </div>
    </div>
  );
}
