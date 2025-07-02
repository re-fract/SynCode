import React from 'react';

const EditorSidebar = ({ 
  clients, 
  isConnected, 
  roomId, 
  currentUser, 
  onCopyRoomId, 
  onLeaveRoom 
}) => {
  const getAvatarGradient = (username) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-green-600',
      'from-orange-500 to-red-600',
    ];
    
    if (!username) return gradients[0];
    const index = username.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <aside className="w-80 bg-slate-900/70 backdrop-blur-xl border-r border-slate-700/30 
                      flex flex-col shadow-2xl relative sticky top-0 h-screen">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
      
      {/* Enhanced Header - REMOVED GREEN DOT */}
      <div className="relative p-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 
                            rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">SC</span>
            </div>
            {/* REMOVED: Green dot indicator */}
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              SynCode
            </h1>
            <p className="text-xs text-slate-400">Collaborative Editor</p>
          </div>
        </div>
        
        {/* Room Info Card - IMPROVED ROOM ID DISPLAY */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0"> {/* Added flex-1 and min-w-0 for proper truncation */}
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Room ID</p>
              <p className="text-sm font-mono text-slate-200 truncate" title={roomId}>
                {roomId}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ml-3 flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-red-500'} 
                             ${isConnected ? 'animate-pulse' : ''}`}></div>
          </div>
        </div>
      </div>

      {/* Connected Users */}
      <div className="relative flex-1 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Connected Users
          </h3>
          <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
            {clients.length}
          </span>
        </div>
        
        <div className="space-y-3 overflow-y-auto hide-scrollbar" style={{maxHeight: 'calc(100vh - 400px)'}}>
          {clients.map((client, index) => (
            <div key={client.socketId} 
                 className="group flex items-center p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 
                            rounded-xl border border-slate-700/20 hover:border-slate-600/40 
                            transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10
                            hover:transform hover:scale-[1.02]"
                 style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold
                              shadow-lg ring-2 ring-slate-700/20 group-hover:ring-blue-500/30 transition-all
                              bg-gradient-to-br ${getAvatarGradient(client.username)}`}>
                {client.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4 flex-1">
                <span className="text-slate-200 font-medium block">
                  {client.username}
                  {client.username === currentUser && 
                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  }
                </span>
                <span className="text-xs text-slate-400">Active now</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full opacity-80"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative p-6 border-t border-slate-700/30 space-y-3 flex-shrink-0">
        <button 
          onClick={onCopyRoomId}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 
                     hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-4 
                     rounded-xl transition-all duration-1200 transform hover:scale-[1.02] 
                     hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <div className="relative flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
            </svg>
            <span>Copy Room ID</span>
          </div>
        </button>
        
        <button 
          onClick={onLeaveRoom}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 
                     hover:from-red-500 hover:to-red-600 text-white font-medium py-3 px-4 
                     rounded-xl transition-all duration-1200 transform hover:scale-[1.02] 
                     hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 
                     focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <div className="relative flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            <span>Leave Room</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default EditorSidebar;
