import gdgLogo from '@/assets/gdg-logo5.png';

const GdgLogo = ({ height = 36, className = '' }: { height?: number; className?: string }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ height }}>
      <img 
        src={gdgLogo} 
        alt="GDGoC Logo" 
        style={{ 
          height: '100%', 
          width: 'auto', 
          objectFit: 'contain', 
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.2))' 
        }} 
      />
    </div>
  );
};

export default GdgLogo;
