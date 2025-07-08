import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../utils/Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from 'react-router-dom';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update document title when language changes
  useEffect(() => {
    document.title = `main.${getFileExtension(currentLanguage)} - Room ${roomId.slice(0, 8)} | SynCode`;
  }, [currentLanguage, roomId]);

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();
        
        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current.id);
          setIsConnected(true);
          toast.success('Connected to server');
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
          toast.error(`Disconnected from server: ${reason}`);
        });

        socketRef.current.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          setIsConnected(true);
          toast.success('Reconnected to server');
        });

        socketRef.current.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
          toast.error('Reconnection failed');
        });

        socketRef.current.on('reconnect_failed', () => {
          console.error('Reconnection failed after maximum attempts');
          toast.error('Could not reconnect to server');
          reactNavigator('/');
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          handleErrors(err);
        });
        
        socketRef.current.on('connect_failed', (err) => {
          console.error('Socket connection failed:', err);
          handleErrors(err);
        });

        socketRef.current.on('join_error', ({ message }) => {
          console.error('Join error:', message);
          toast.error(message);
          reactNavigator('/');
        });

        socketRef.current.on('username_taken', ({ message }) => {
          console.error('Username taken:', message);
          toast.error(message);
          reactNavigator('/');
        });

        function handleErrors(e) {
          console.log('socket error', e);
          toast.error('Socket connection failed, try again later.');
          reactNavigator('/');
        }

        localStorage.setItem('username', location.state?.username);

        // Wait for connection before joining
        if (socketRef.current.connected) {
          joinRoom();
        } else {
          socketRef.current.on('connect', joinRoom);
        }

        function joinRoom() {
          if (!location.state?.username) {
            toast.error('No username provided');
            reactNavigator('/');
            return;
          }

          console.log('Joining room:', roomId, 'with username:', location.state.username);
          socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username,
          });
        }

        socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, username, socketId, currentLanguage }) => {
            console.log('Successfully joined room:', { clients, username, socketId, currentLanguage });
            if (username !== location.state?.username) {
              toast.success(`${username} joined the room.`);
            }

            setClients(clients);
            if (currentLanguage) {
              setCurrentLanguage(currentLanguage);
            }
            
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        );

        socketRef.current.on(
          ACTIONS.DISCONNECTED,
          ({ socketId, username }) => {
            toast.success(`${username} left the room.`);
            setClients((prev) => {
              return prev.filter(
                (client) => client.socketId !== socketId
              );
            });
          }
        );

        socketRef.current.on('language_change', ({ language }) => {
          setCurrentLanguage(language);
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        toast.error('Failed to connect to server');
        reactNavigator('/');
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off('language_change');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_error');
        socketRef.current.off('reconnect_failed');
        socketRef.current.off('connect_error');
        socketRef.current.off('connect_failed');
        socketRef.current.off('join_error');
        socketRef.current.off('username_taken');
        socketRef.current = null;
      }
    };
  }, [roomId, location.state?.username]);

  const handleRunCode = async () => {
    setIsLoading(true);
    try {
      // Simulate code execution - replace with actual code execution logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput('Code executed successfully!\nHello, World!');
      setIsError(false);
      setShowOutput(true);
    } catch (error) {
      setOutput('Error: ' + error.message);
      setIsError(true);
      setShowOutput(true);
    } finally {
      setIsLoading(false);
    }
  };

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  const clearOutput = () => {
    setOutput('');
    setIsError(false);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
    };
    return extensions[lang] || lang;
  };

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

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <aside className="w-80 bg-slate-900/70 backdrop-blur-xl border-r border-slate-700/30 
                        flex flex-col shadow-2xl relative sticky top-0 h-screen">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        
        {/* Enhanced Header */}
        <div className="relative p-6 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 
                              rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">SC</span>
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full 
                              border-2 border-slate-900 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 
                             bg-clip-text text-transparent">
                SynCode
              </h1>
              <p className="text-xs text-slate-400">Collaborative Editor</p>
            </div>
          </div>
          
          {/* Room Info Card */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Room ID</p>
                <p className="text-sm font-mono text-slate-200">{roomId.slice(0, 12)}...</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} 
                               ${isConnected ? 'animate-pulse' : ''}`}></div>
            </div>
          </div>
        </div>

        {/* Connected Users - Scrollable */}
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
                    {client.username === location.state?.username && 
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

        {/* Enhanced Action Buttons */}
        <div className="relative p-6 border-t border-slate-700/30 space-y-3 flex-shrink-0">
          <button 
            onClick={copyRoomId}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-4 
                       rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
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
            onClick={leaveRoom}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 
                       hover:from-red-500 hover:to-red-600 text-white font-medium py-3 px-4 
                       rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
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

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col bg-slate-950/50 overflow-hidden">
        {/* Enhanced Header Bar */}
        <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30 
                         px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
          <div className="flex items-center space-x-6">
            {/* File Info */}
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                </svg>
                main.{getFileExtension(currentLanguage)}
              </h2>
            </div>
            
            {/* Language Selector */}
            <select 
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-slate-800/50 border border-slate-600/50 text-white rounded-lg 
                         px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent backdrop-blur-sm cursor-pointer
                         hover:bg-slate-700/50 transition-colors"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>

          {/* Enhanced Control Buttons */}
          <div className="flex items-center space-x-4">
            {/* Output Toggle */}
            <button 
              onClick={() => setShowOutput(!showOutput)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
                         border backdrop-blur-sm transform hover:scale-105 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
                         ${showOutput 
                           ? 'bg-gradient-to-r from-green-600 to-green-500 text-white border-green-500 focus:ring-green-500 shadow-lg shadow-green-500/25' 
                           : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-600/50 focus:ring-slate-500'
                         }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span>{showOutput ? 'Hide Output' : 'Show Output'}</span>
              </div>
            </button>

            {/* Run Code Button */}
            <button 
              onClick={handleRunCode}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 
                         hover:from-green-500 hover:via-emerald-500 hover:to-green-400 text-white 
                         font-semibold px-6 py-2 rounded-lg transition-all duration-300 
                         transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                         focus:ring-offset-slate-900 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                    <span>Run Code</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Editor Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className={`${showOutput ? 'flex-1' : 'w-full'} relative overflow-hidden`}>
            <div className="h-full overflow-auto hide-scrollbar">
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={(code) => {
                  codeRef.current = code;
                }}
                onLanguageChange={setCurrentLanguage}
                hideControls={true} // Pass prop to hide old controls
              />
            </div>
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="w-96 bg-slate-900/30 border-l border-slate-700/50 flex flex-col">
              {/* Output Header */}
              <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 
                            flex items-center justify-between flex-shrink-0">
                <h3 className="text-white font-medium">Output</h3>
                <button 
                  onClick={clearOutput}
                  className="text-slate-400 hover:text-red-500 text-sm 
                           transition-colors duration-200 px-2 py-1 rounded
                           hover:bg-slate-700/50"
                >
                  🗑️ Clear
                </button>
              </div>

              {/* Output Content */}
              <div className={`flex-1 p-4 overflow-auto hide-scrollbar ${isError ? 'bg-red-900/10' : ''}`}>
                <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap
                                ${isError ? 'text-red-400' : 'text-slate-300'}`}>
                  {output || `> Ready to execute your ${currentLanguage} code\n> Click "Run Code" to see output here`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditorPage;
