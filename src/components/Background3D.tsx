import React from 'react';

interface Background3DProps {
  theme: 'light' | 'dark';
}

const Background3D: React.FC<Background3DProps> = ({ theme }) => {
  return (
    <div className={`background-3d ${theme}`}>
      <div className="orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="grid-container">
        <div className="grid"></div>
      </div>
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default Background3D;
