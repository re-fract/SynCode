import React, { useState, useEffect } from 'react';

const CustomScrollbar = ({ showOutput }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollTarget, setScrollTarget] = useState(null);

  useEffect(() => {
    const findCodeMirrorScroll = () => {
      const codeMirrorScroll = document.querySelector('.CodeMirror-scroll');
      if (codeMirrorScroll) {
        console.log('✅ Found CodeMirror scroll element!');
        setScrollTarget(codeMirrorScroll);
        return codeMirrorScroll;
      }
      console.log('❌ CodeMirror scroll element not found');
      return null;
    };

    let target = findCodeMirrorScroll();
    
    if (!target) {
      const interval = setInterval(() => {
        target = findCodeMirrorScroll();
        if (target) {
          clearInterval(interval);
        }
      }, 500);
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, []);

  useEffect(() => {
    if (!scrollTarget) return;

    const updateScrollInfo = () => {
      const scrollTop = scrollTarget.scrollTop;
      const scrollHeight = scrollTarget.scrollHeight;
      const clientHeight = scrollTarget.clientHeight;
      
      setScrollPosition(scrollTop);
      setScrollHeight(scrollHeight);
      setClientHeight(clientHeight);
      setIsVisible(scrollHeight > clientHeight);
      
      console.log('📊 Scroll info:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isScrollable: scrollHeight > clientHeight
      });
    };

    const handleScroll = () => {
      setScrollPosition(scrollTarget.scrollTop);
    };

    updateScrollInfo();
    scrollTarget.addEventListener('scroll', handleScroll);
    
    const resizeObserver = new ResizeObserver(updateScrollInfo);
    resizeObserver.observe(scrollTarget);

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [scrollTarget]);

  const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * clientHeight);
  const thumbTop = scrollHeight > clientHeight 
    ? (scrollPosition / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight)
    : 0;

  const handleTrackClick = (e) => {
    if (!scrollTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollRatio = clickY / rect.height;
    const newScrollTop = scrollRatio * (scrollHeight - clientHeight);
    
    scrollTarget.scrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight));
  };

  // Always show for testing
  const shouldShow = true;

  if (!shouldShow) {
    return (
      <div className="fixed top-20 right-4 w-12 h-12 bg-red-500 rounded z-50 flex items-center justify-center text-white text-xs">
        No CM
      </div>
    );
  }

  return (
    <div
      className="fixed top-20 bottom-4 w-4 bg-slate-800/50 hover:bg-slate-800/70 
                 transition-all duration-200 cursor-pointer z-50 rounded-lg border border-slate-600/30"
      style={{
        right: showOutput ? '420px' : '20px',
        transition: 'right 0.3s ease-in-out',
      }}
      onClick={handleTrackClick}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-700/30">
        <div
          className="absolute left-0 w-full bg-gradient-to-b from-blue-500 to-purple-600 
                     rounded-lg cursor-grab transition-all duration-150
                     hover:from-blue-400 hover:to-purple-500 shadow-lg"
          style={{
            height: `${thumbHeight}px`,
            top: `${thumbTop}px`,
            minHeight: '40px',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-lg" />
        </div>
      </div>
      
      <div className="absolute -left-40 top-0 text-white text-xs bg-black/80 p-2 rounded pointer-events-none">
        <div>Target: {scrollTarget ? '✅' : '❌'}</div>
        <div>H: {scrollHeight}</div>
        <div>C: {clientHeight}</div>
        <div>Visible: {isVisible ? '✅' : '❌'}</div>
        <div>Pos: {Math.round(scrollPosition)}</div>
      </div>
    </div>
  );
};

export default CustomScrollbar;
