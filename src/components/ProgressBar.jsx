// ALTERNATIVE: src/components/ProgressBar.jsx (CSS Version)
const ProgressBar = ({ progress, label = null }) => {
  const containerStyle = {
    width: '100%',
    marginBottom: '1rem'
  };

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '0.5rem'
  };

  const barBackgroundStyle = {
    width: '100%',
    height: '16px',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden'
  };

  const barFillStyle = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: '#10b981', // green color
    borderRadius: 'inherit',
    transition: 'width 0.5s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    minWidth: '0%',
    maxWidth: '100%'
  };

  return (
    <div style={containerStyle}>
      {label && (
        <div style={labelStyle}>
          <span style={{fontWeight: '500'}}>{label}</span>
          <span style={{fontWeight: '700'}}>{progress}%</span>
        </div>
      )}
      <div style={barBackgroundStyle}>
        <div style={barFillStyle}>
          {progress > 25 && (
            <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>
              {progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;