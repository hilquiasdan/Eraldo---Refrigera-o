export function Spinner() {
  return <span className="spinner"/>;
}

export function LoadingOverlay({ text = 'Carregando...' }) {
  return (
    <div className="loading-overlay">
      <Spinner/>
      <span>{text}</span>
    </div>
  );
}
