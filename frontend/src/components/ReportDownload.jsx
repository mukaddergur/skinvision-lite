export default function ReportDownload({ reportUrl }) {
  if (!reportUrl) return null;

  const href = reportUrl.startsWith('http')
    ? reportUrl
    : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${reportUrl}`;

  return (
    <div className="flex justify-center">
      <a
        href={href}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="btn-pill btn-pill--lg"
      >
        <span>📄</span>
        Detaylı PDF Raporu İndir
      </a>
    </div>
  );
}
