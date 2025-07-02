import React from 'react';

const Avatar = ({ 
  name, 
  src, 
  size = 40, 
  className = '',
  ...props 
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-red-500 to-red-600',
    ];
    
    if (!name) return colors[0];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarStyle = {
    width: size,
    height: size,
    fontSize: size * 0.4,
  };

  return (
    <div 
      style={avatarStyle} 
      className={`
        ${getBackgroundColor(name)}
        rounded-full flex items-center justify-center
        text-white font-bold border-2 border-slate-600/50
        shadow-lg ${className}
      `}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

export default Avatar;
