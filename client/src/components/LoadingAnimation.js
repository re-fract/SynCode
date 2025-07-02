import React from 'react';

const LoadingAnimation = ({ message = "Connecting to room..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center z-50">
      {/* Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>
      
      {/* Loading content */}
      <div className="relative flex flex-col items-center space-y-8 p-8">
        {/* Animated logo */}
        <div className="relative">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 
                          rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-2xl font-bold text-white">SC</span>
          </div>
          
          {/* Spinning rings */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-r-purple-500 rounded-full animate-spin" 
               style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SynCode
          </h2>
          <p className="text-slate-400 text-lg animate-pulse">{message}</p>
          
          {/* Dots animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
