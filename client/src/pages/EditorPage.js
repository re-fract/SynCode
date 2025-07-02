import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

import ACTIONS from '../utils/Actions';
import { initSocket } from '../socket';
import { executeCode } from '../utils/codeExecutor';
import EditorSidebar from '../components/EditorLayout/EditorSidebar';
import EditorHeader from '../components/EditorLayout/EditorHeader';
import OutputPanel from '../components/EditorLayout/OutputPanel';
import LoadingAnimation from '../components/LoadingAnimation';
import Editor from '../components/Editor';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [previewData, setPreviewData] = useState(null);
  const [isJoining, setIsJoining] = useState(true);

  // State management
  const [clients, setClients] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update document title when language changes
  useEffect(() => {
    const getFileExtension = (lang) => {
      const extensions = {
        javascript: 'js', python: 'py', java: 'java',
        cpp: 'cpp', html: 'html', css: 'css',
      };
      return extensions[lang] || lang;
    };

    document.title = `main.${getFileExtension(currentLanguage)} - Room ${roomId.slice(0, 8)} | SynCode`;
  }, [currentLanguage, roomId]);

  // Socket initialization
  useEffect(() => {
    const init = async () => {
      setIsJoining(true);
      
      socketRef.current = await initSocket();

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        toast.error('Disconnected from server');
      });

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        setIsJoining(false);
        reactNavigator('/');
      }

      localStorage.setItem('username', location.state?.username);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId, currentLanguage }) => {
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

        // Hide loading after successful join with animation delay
        setTimeout(() => {
          setIsJoining(false);
        }, 1500);
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });

      socketRef.current.on('language_change', ({ language }) => {
        setCurrentLanguage(language);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.off('language_change');
    };
  }, []);

  // Event handlers
  const handleRunCode = async (userInput = '') => {
    console.log('=== EditorPage: handleRunCode called ===');
    console.log('User input received:', JSON.stringify(userInput));
    console.log('Input length:', userInput.length);
    
    setIsLoading(true);
    setIsError(false);
    setOutput('');
    setPreviewData(null);

    try {
      if (!showOutput) setShowOutput(true);

      const currentCode = codeRef.current || '';
      if (!currentCode.trim()) {
        setOutput('No code to execute. Please write some code first.');
        setIsLoading(false);
        return;
      }

      console.log('Executing code:', currentLanguage, currentCode.length, 'characters');
      console.log('User input being passed to executeCode:', JSON.stringify(userInput));
      
      const result = await executeCode(currentCode, currentLanguage, userInput);

      setOutput(result.output);
      setIsError(result.isError);

      // Handle preview data for HTML/CSS
      if (result.isPreview) {
        setPreviewData({
          isPreview: true,
          htmlContent: result.htmlContent,
          previewType: result.previewType
        });
      }

      if (!result.isError) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Code execution failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Execution Error: ' + error.message);
      setIsError(true);
      toast.error('Code execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit('language_change', {
        roomId,
        language: newLanguage,
        username: localStorage.getItem('username') || 'Anonymous'
      });
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Could not copy the Room ID');
    }
  };

  const leaveRoom = () => {
    reactNavigator('/');
  };

  const clearOutput = () => {
    setOutput('');
    setIsError(false);
    setPreviewData(null);
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  // Show loading animation while joining
  if (isJoining) {
    return <LoadingAnimation message="Joining room..." />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex overflow-hidden">
      <EditorSidebar 
        clients={clients}
        isConnected={isConnected}
        roomId={roomId}
        currentUser={location.state?.username}
        onCopyRoomId={copyRoomId}
        onLeaveRoom={leaveRoom}
      />

      <main className="flex-1 flex flex-col bg-slate-950/50 overflow-hidden relative">
        <div className="relative z-50">
          <EditorHeader
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            showOutput={showOutput}
            onToggleOutput={() => setShowOutput(!showOutput)}
            onRunCode={handleRunCode}
            isLoading={isLoading}
          />
        </div>

        {/* ───────────────── Editor + Output (with proper animations) ───────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {/* CODE-EDITOR pane - Dynamic width based on output state */}
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ease-in-out bg-slate-950
              ${showOutput ? 'right-96' : 'right-0'}
            `}
          >
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => { codeRef.current = code; }}
              onLanguageChange={setCurrentLanguage}
              hideControls={true}
              language={currentLanguage}
            />
          </div>

          {/* OUTPUT drawer - Absolutely positioned to slide in from right */}
          <div
            className={`absolute top-0 right-0 h-full w-96 bg-slate-900/30 border-l border-slate-700/50 flex flex-col
              transform transition-all duration-300 ease-in-out
              ${showOutput ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
          >
            <OutputPanel
              output={output}
              isError={isError}
              currentLanguage={currentLanguage}
              onClear={clearOutput}
              previewData={previewData}
              onRunWithInput={handleRunCode}
            />
          </div>
        </div>


      </main>
    </div>
  );
};

export default EditorPage;
