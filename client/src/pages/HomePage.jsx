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
                    flex items-center justify-center p-4">
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
                placeholder="Enter room ID"
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
              Don't have a room ID?
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
