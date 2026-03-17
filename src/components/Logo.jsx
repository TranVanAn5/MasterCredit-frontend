import React from 'react';

const Logo = ({ className = "w-8 h-8", showText = true, textSize = "text-lg" }) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/Logo.png"
        alt="MasterCredit Logo"
        className={`${className} object-contain`}
        onError={(e) => {
          // Fallback to original logo if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback logo */}
      <div className={`${className} bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center hidden`}>
        <span className="text-white font-bold text-sm">M</span>
      </div>
      {showText && (
        <span className={`${textSize} font-bold text-orange-400`}>
          MasterCredit
        </span>
      )}
    </div>
  );
};

export default Logo;