export default function ModeSelector({ mode, onModeChange }) {
  const tabs = [
    { id: 'upload', label: 'Fotoğraf Yükle', icon: '📷' },
    { id: 'camera', label: 'Kamera Kullan', icon: '🎥' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onModeChange(tab.id)}
          className={`btn-pill btn-pill--lg ${mode === tab.id ? 'btn-pill--active' : ''}`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
