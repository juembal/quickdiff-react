import React from 'react';

const Minimap = ({ changes, currentChangeIndex, onChangeClick }) => {
  if (!changes || changes.length === 0) {
    return (
      <div className="minimap-container">
        <div className="minimap-content">
          <div className="minimap-title">Overview</div>
          <div className="minimap-canvas">
            <div className="minimap-empty">No changes to display</div>
          </div>
        </div>
      </div>
    );
  }

  const minimapHeight = 200;
  const totalLines = Math.max(...changes.map(change => change.lineNumber || 0)) || 100;
  
  console.log('Minimap - Changes:', changes, 'Total Lines:', totalLines); // Debug log

  return (
    <div className="minimap-container">
      <div className="minimap-content">
        <div className="minimap-title">Overview</div>
        <div className="minimap-canvas" style={{ position: 'relative', height: minimapHeight }}>
          {changes.map((change, index) => {
            const position = ((change.lineNumber || index) / totalLines) * minimapHeight;
            const isCurrentChange = index === currentChangeIndex;
            
            let backgroundColor = '#28a745'; // added
            if (change.type === 'removed') backgroundColor = '#dc3545';
            if (change.type === 'modified') backgroundColor = '#6f42c1';
            
            return (
              <div
                key={index}
                className={`minimap-bar minimap-${change.type} ${isCurrentChange ? 'current' : ''}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: isCurrentChange ? '5px' : '3px',
                  top: `${position}px`,
                  backgroundColor,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isCurrentChange ? 0.8 : 1,
                  zIndex: isCurrentChange ? 2 : 1
                }}
                onClick={() => onChangeClick && onChangeClick(index)}
                onMouseEnter={(e) => {
                  e.target.style.height = '5px';
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  if (index !== currentChangeIndex) {
                    e.target.style.height = '3px';
                    e.target.style.opacity = '1';
                  }
                }}
              />
            );
          })}
          
          {/* Viewport indicator */}
          {currentChangeIndex >= 0 && (
            <div
              className="minimap-viewport"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '20px',
                background: 'rgba(79, 172, 254, 0.2)',
                border: '2px solid #4facfe',
                borderRadius: '3px',
                top: `${((changes[currentChangeIndex]?.lineNumber || 0) / totalLines) * minimapHeight - 10}px`,
                pointerEvents: 'none',
                transition: 'top 0.3s ease'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Minimap;