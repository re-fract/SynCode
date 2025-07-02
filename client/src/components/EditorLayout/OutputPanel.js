import React, { useState } from 'react';

const OutputPanel = ({ output, isError, currentLanguage, onClear, previewData, onRunWithInput }) => {
  const [userInput, setUserInput] = useState('');
  const [showInputSection, setShowInputSection] = useState(false);

  const needsInput = ['python', 'cpp', 'java'].includes(currentLanguage);

  const handleRunWithInput = () => {
    console.log('=== OutputPanel: Running code with input ===');
    console.log('Input value:', JSON.stringify(userInput));
    console.log('Input length:', userInput.length);
    console.log('Input lines:', userInput.split('\n'));
    
    if (onRunWithInput) {
      onRunWithInput(userInput);
    } else {
      console.error('onRunWithInput function not provided');
    }
  };

  const clearOutput = () => {
    if (onClear) {
      onClear();
      setUserInput(''); // Clear input when clearing output
    }
  };

  return (
    <div className="w-full h-full bg-slate-900/30 flex flex-col">
      {/* Output Header */}
      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 
                    flex items-center justify-between flex-shrink-0">
        <h3 className="text-white font-medium flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          {previewData?.isPreview ? 'Preview' : 'Output'}
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded ${
            previewData?.isPreview 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {previewData?.isPreview ? 'LIVE' : currentLanguage.toUpperCase()}
          </span>

          {needsInput && (
            <button 
              onClick={() => setShowInputSection(!showInputSection)}
              className={`text-xs px-2 py-1 rounded transition-all duration-200 flex items-center space-x-1
                         ${showInputSection 
                           ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                           : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
                         }`}
            >
              <svg className="w-3 h-3 pt-[2px]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
              <span>Input</span>
            </button>
          )}
          
          <button 
            onClick={clearOutput}
            className="text-slate-400 hover:text-red-500 text-sm 
                     transition-colors duration-200 px-2 py-1 rounded
                     hover:bg-slate-700/50 flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      {needsInput && showInputSection && (
        <div className="bg-slate-800/30 border-b border-slate-700/50 p-4 flex-shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 font-medium">Program Input</label>
            </div>
            <div className="flex space-x-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your input here (each line will be treated as separate input)..."
                className="flex-1 bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 
                         text-slate-200 text-sm font-mono placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         custom-scrollbar resize-none"
                rows={3}
              />
              <button
                onClick={handleRunWithInput}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                         text-white text-sm font-medium rounded-lg transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                         whitespace-nowrap flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                <span>Run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Output Content */}
      <div className={`flex-1 overflow-hidden flex flex-col ${isError ? 'bg-red-900/10' : 'bg-slate-950/20'}`}>
        {/* Text Output */}
        {output && (
          <div className="p-4 border-b border-slate-700/30 overflow-y-auto max-h-full custom-scrollbar">
            <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap
                            ${isError ? 'text-red-400' : 'text-slate-300'}`}>
              {output}
            </pre>
          </div>
        )}

        {/* HTML/CSS Preview */}
        {previewData?.isPreview && previewData.htmlContent ? (
          <div className="flex-1 bg-white overflow-hidden">
            <iframe
              srcDoc={previewData.htmlContent}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
              title={`${previewData.previewType} Preview`}
            />
          </div>
        ) : !output ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">No output yet</p>
              <p className="text-xs mt-1">
                {currentLanguage === 'html' || currentLanguage === 'css' 
                  ? 'Write some code and click "Run Code" to see live preview'
                  : 'Write some code and click "Run Code"'
                }
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OutputPanel;
