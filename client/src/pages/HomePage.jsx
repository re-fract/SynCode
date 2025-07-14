import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId && username) {
      navigate(`/editor/${roomId}`, { state: { username } });
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15);
    setRoomId(newRoomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 
                    flex items-center justify-center p-4 relative">
      {/* GitHub Icon - Top Right */}
      <a
        href="https://github.com/re-fract/SynCode"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 p-3 rounded-full bg-slate-800/50 backdrop-blur-sm
                   border border-slate-700/50 hover:border-slate-600 hover:bg-slate-700/50
                   transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12
                   group shadow-lg hover:shadow-xl"
        aria-label="View on GitHub"
      >
        <svg
          className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors duration-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-green-500 
                          rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">SC</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to SynCode
          </h1>
          <p className="text-slate-400 text-lg">
            Collaborative code editing made simple
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleJoinRoom} className="space-y-6">
            {/* Room ID Input */}
            <div className="space-y-2">
              <label 
                htmlFor="roomId" 
                className="block text-sm font-medium text-slate-300"
              >
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="input-field"
                required
              />
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-slate-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field"
                required
              />
            </div>

            {/* Join Button */}
            <button type="submit" className="btn-primary w-full">
              Join Room
            </button>
          </form>

          {/* Create New Room Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">
              Don't have a Room ID?
            </p>
            <button 
              onClick={handleCreateRoom}
              className="text-blue-500 hover:text-blue-400 font-medium 
                         transition-colors duration-200 underline underline-offset-2"
            >
              Create New Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
