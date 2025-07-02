import React from 'react';

const Client = ({ username }) => {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getBackgroundColor = (name) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
    ];
    
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center p-3 bg-slate-800/50 rounded-xl 
                    border border-slate-700/30 hover:bg-slate-700/50 
                    transition-colors duration-200">
      <div className={`w-10 h-10 bg-gradient-to-br ${getBackgroundColor(username)} 
                       rounded-full flex items-center justify-center text-white font-medium`}>
        {getInitial(username)}
      </div>
      <span className="ml-3 text-slate-300 font-medium">
        {username}
      </span>
    </div>
  );
};

export default Client;
