import React, { useState, useRef, useEffect } from 'react';
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
import ACTIONS from '../utils/Actions';

const Editor = ({ 
  socketRef, 
  roomId, 
  onCodeChange, 
  onLanguageChange,
  hideControls = false,
  language: parentLanguage,
}) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(parentLanguage || 'javascript');

  const languages = {
    javascript: 'javascript',
    python: 'python',
    java: 'text/x-java',
    cpp: 'text/x-c++src',
    html: 'xml',
    css: 'css',
  };

  const getExampleCode = (lang) => {
    const examples = {
      javascript: `// Welcome to SynCode!\nconsole.log("Hello, World!");`,
      python:     `# Welcome to SynCode!\nprint("Hello, World!")`,
      java:       `// Welcome to SynCode!\npublic class Main {\n  public static void main(String[] a){\n    System.out.println("Hello, World!");\n  }\n}`,
      cpp:        `// Welcome to SynCode!\n#include <iostream>\nint main(){ std::cout << "Hello, World!"; }`,
      html:       `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello, World!</h1>\n  </body>\n</html>`,
      css:        `body { font-family: Arial; color: #222; }`,
    };
    return examples[lang] || examples.javascript;
  };

  useEffect(() => {
    if (parentLanguage) {
      setLanguage(parentLanguage);
    }
  }, [parentLanguage]);

  useEffect(() => {
    async function init() {
      console.log('🔄 Initializing CodeMirror...');
      
      const textarea = document.getElementById('realtimeEditor');
      if (!textarea) {
        console.error('❌ Textarea not found');
        return;
      }

      // CRITICAL: Remove viewportMargin and set proper height
      editorRef.current = Codemirror.fromTextArea(textarea, {
        mode: languages[language],
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        styleActiveLine: false,
        scrollbarStyle: 'native', // Use native scrollbars
        lineWrapping: false,
        // DO NOT SET viewportMargin: Infinity - this breaks scrolling!
      });

      // Set content with lots of lines
      const exampleCode = getExampleCode(language);
      editorRef.current.setValue(exampleCode);
      setCode(exampleCode);

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const newCode = instance.getValue();
        setCode(newCode);
        if (onCodeChange) {
          onCodeChange(newCode);
        }

        if (origin !== 'setValue' && socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: newCode,
          });
        }
      });

      // Force refresh and check scroll
      setTimeout(() => {
        editorRef.current.refresh();
        
        const cmElement = document.querySelector('.CodeMirror');
        const cmScroll = document.querySelector('.CodeMirror-scroll');
        
        console.log('✅ CodeMirror initialized:', {
          cmElement: !!cmElement,
          cmScroll: !!cmScroll,
          scrollHeight: cmScroll?.scrollHeight,
          clientHeight: cmScroll?.clientHeight,
          isScrollable: cmScroll && cmScroll.scrollHeight > cmScroll.clientHeight
        });
      }, 200);
    }
    
    init();
  }, []);

  // Socket handlers
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          const cursor = editorRef.current.getCursor();
          editorRef.current.setValue(code);
          setCode(code);
          try {
            editorRef.current.setCursor(cursor);
          } catch (e) {
            console.log('Cursor positioning failed');
          }
        }
      });

      socketRef.current.on('language_change', ({ language: newLanguage, username }) => {
        setLanguage(newLanguage);
        if (editorRef.current) {
          editorRef.current.setOption('mode', languages[newLanguage]);
          const exampleCode = getExampleCode(newLanguage);
          editorRef.current.setValue(exampleCode);
          setCode(exampleCode);
        }
        if (onLanguageChange) {
          onLanguageChange(newLanguage);
        }
        toast.success(`${username} changed language to ${newLanguage}`);
      });
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
      socketRef.current?.off('language_change');
    };
  }, [socketRef.current]);

  // Language change handler
  useEffect(() => {
    if (parentLanguage && parentLanguage !== language) {
      setLanguage(parentLanguage);
      if (editorRef.current) {
        editorRef.current.setOption('mode', languages[parentLanguage]);
        const exampleCode = getExampleCode(parentLanguage);
        editorRef.current.setValue(exampleCode);
        setCode(exampleCode);
      }
      
      if (socketRef.current) {
        socketRef.current.emit('language_change', {
          roomId,
          language: parentLanguage,
          username: localStorage.getItem('username') || 'Anonymous'
        });
      }
    }
  }, [parentLanguage]);

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {!hideControls && (
        <div className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30 
                        px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-medium">Editor</h3>
          </div>
        </div>
      )}

      {/* CodeMirror container with full height */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <textarea
            id="realtimeEditor"
            className="w-full h-full resize-none border-none outline-none"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
