import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
];

const EditorHeader = ({
  currentLanguage,
  onLanguageChange,
  showOutput,
  onToggleOutput,
  onRunCode,
  isLoading
}) => {
  const selectedLanguage = languages.find(lang => lang.id === currentLanguage) || languages[0];
  
  return (
    <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30 
                     px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
      <div className="flex items-center space-x-6">
        {/* File Info */}
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
            main.{selectedLanguage.id === 'javascript' ? 'js' : 
                  selectedLanguage.id === 'python' ? 'py' : 
                  selectedLanguage.id === 'java' ? 'java' : 
                  selectedLanguage.id === 'cpp' ? 'cpp' : 
                  selectedLanguage.id === 'html' ? 'html' : 
                  'css'}
          </h2>
        </div>
        
        {/* Language Selector */}
        <Listbox value={selectedLanguage} onChange={(lang) => onLanguageChange(lang.id)}>
          <div className="relative min-w-[140px]">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 py-2.5 pl-4 pr-10 text-left text-sm font-medium text-white border border-slate-600/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all hover:from-slate-700/80 hover:to-slate-600/80">
              <span className="block truncate">{selectedLanguage.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-2 w-full rounded-xl bg-slate-800 backdrop-blur-xl py-2 shadow-2xl ring-1 ring-black/20 focus:outline-none">
                {languages.map((lang) => (
                  <Listbox.Option
                    key={lang.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600/20 text-blue-200' : 'text-slate-200'
                      }`
                    }
                    value={lang}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {lang.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Show Output Button */}
        <button 
          onClick={onToggleOutput}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
                     border backdrop-blur-sm focus:outline-none transform
                     focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 
                     ${showOutput 
                       ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-500 focus:ring-yellow-500 shadow-lg shadow-green-500/25' 
                       : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-600/50 focus:ring-slate-500 hover:scale-105 active:scale-98'
                     }`}
        >
          <div className="flex items-center space-x-2">
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${showOutput ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>{showOutput ? 'Hide Output' : 'Show Output'}</span>
          </div>
        </button>

        {/* Run Code Button */}
        <button 
          onClick={() => onRunCode()}
          disabled={isLoading}
          className="group relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 
                     hover:from-green-500 hover:via-emerald-500 hover:to-green-400 text-white 
                     font-semibold px-6 py-2 rounded-lg transition-all duration-300 
                     hover:scale-105 active:scale-98
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                     focus:ring-offset-slate-900 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed transform"
        >
          <div className="relative flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="animate-pulse">Running...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                <span>Run Code</span>
              </>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;
