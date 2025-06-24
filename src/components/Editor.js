import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('javascript');

  const languages = {
    javascript: { name: 'javascript', json: true },
    python: 'python',
    java: 'text/x-java',
    cpp: 'text/x-c++src',
    html: 'xml',
    css: 'css',
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

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: languages[language],
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          styleActiveLine: false, // Disable active line highlighting
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);

        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          const cursor = editorRef.current.getCursor();
          const scrollInfo = editorRef.current.getScrollInfo();
          
          editorRef.current.setValue(code);
          
          try {
            editorRef.current.setCursor(cursor);
            editorRef.current.scrollTo(scrollInfo.left, scrollInfo.top);
          } catch (e) {
            const lastLine = editorRef.current.lastLine();
            const lastLineLength = editorRef.current.getLine(lastLine).length;
            editorRef.current.setCursor({ line: lastLine, ch: lastLineLength });
          }
        }
      });

      // Listen for language changes from other users
      socketRef.current.on('language_change', ({ language: newLanguage, username }) => {
        setLanguage(newLanguage);
        if (editorRef.current) {
          editorRef.current.setOption('mode', languages[newLanguage]);
        }
        
        toast.success(`${username} changed language to ${newLanguage}`, {
          duration: 2000,
          style: {
            background: '#161b22',
            color: '#f0f6fc',
            border: '1px solid #30363d',
            borderLeft: '4px solid #58a6ff',
          },
        });
      });

      // Sync initial language when joining
      socketRef.current.on(ACTIONS.JOINED, ({ currentLanguage }) => {
        if (currentLanguage && currentLanguage !== language) {
          setLanguage(currentLanguage);
          if (editorRef.current) {
            editorRef.current.setOption('mode', languages[currentLanguage]);
          }
        }
      });
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
      socketRef.current?.off('language_change');
    };
  }, [socketRef.current]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    
    if (editorRef.current) {
      editorRef.current.setOption('mode', languages[newLanguage]);
    }

    // Emit language change to all users in the room
    if (socketRef.current) {
      socketRef.current.emit('language_change', {
        roomId,
        language: newLanguage,
        username: localStorage.getItem('username') || 'Anonymous'
      });
    }

    toast.success(`Language changed to ${newLanguage}`, {
      duration: 1500,
      style: {
        background: '#161b22',
        color: '#f0f6fc',
        border: '1px solid #30363d',
        borderLeft: '4px solid #56d364',
      },
    });
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="editor-title">
          main.{getFileExtension(language)}
        </span>
        
        <select 
          className="language-selector"
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>

      <textarea id="realtimeEditor"></textarea>
    </div>
  );
};

export default Editor;
