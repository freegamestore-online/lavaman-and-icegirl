// MobileControls.tsx
import { useEffect, useRef } from 'react';

interface MobileControlsProps {
  onControl: (direction: { left: boolean; right: boolean; jump: boolean }) => void;
  onToggleCharacter: () => void;
  activeCharacter: 'fire' | 'water';
}

export function MobileControls({ 
  onControl, 
  onToggleCharacter,
  activeCharacter 
}: MobileControlsProps) {
  const touchRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Clean up on unmount
  useEffect(() => {
    return () => {
      onControl({ left: false, right: false, jump: false });
    };
  }, []);

  // Helper to create touch handlers
  const createTouchHandler = (direction: 'left' | 'right' | 'jump') => {
    const getCurrentState = () => {
      const state = { left: false, right: false, jump: false };
      state[direction] = true;
      return state;
    };

    const getResetState = () => {
      return { left: false, right: false, jump: false };
    };

    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onControl(getCurrentState());
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onControl(getResetState());
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onControl(getResetState());
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onControl(getCurrentState());
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onControl(getResetState());
      },
      onMouseLeave: (e: React.MouseEvent) => {
        onControl(getResetState());
      }
    };
  };

  // Ref callback that returns void
  const setRef = (key: string) => (el: HTMLButtonElement | null) => {
    touchRefs.current[key] = el;
  };

  
  return (
    <div className="h-full w-full flex items-start justify-start gap-8 md:gap-12 px-4 pt-2 select-none touch-none">
      {/* Character Toggle Button — thinner rounded rectangle */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onToggleCharacter}
          className={`bg-gradient-to-r ${
            activeCharacter === 'fire' 
              ? 'from-orange-500 to-red-600' 
              : 'from-cyan-500 to-blue-600'
          } text-white px-5 py-2 rounded-lg
            border-2 border-white/30 shadow-lg active:scale-95 text-base font-bold
            hover:scale-105 transition-all touch-none select-none min-w-[64px]`}
        >
          {activeCharacter === 'fire' ? '🔥' : '💧'}
        </button>
        <div className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
          {activeCharacter === 'fire' ? 'Controlling Fire' : 'Controlling Water'}
        </div>
      </div>

      {/* Control Pad — top-left, arrows centered, up arrow raised */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-1">
          {activeCharacter === 'fire' ? '🔥 Fire' : '💧 Water'}
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-2 w-[160px] place-items-center">
          {/* Jump — centered on top row, spans middle column */}
          <button
            ref={setRef('jump')}
            {...createTouchHandler('jump')}
            className="col-start-2 row-start-1 bg-white text-blue-900 p-4 rounded-xl 
                      text-2xl font-bold shadow-lg active:scale-95 touch-none select-none
                      border border-gray-200 min-h-[52px] min-w-[52px] aspect-square
                      flex items-center justify-center -mb-2"
          >
            ▲
          </button>
          {/* Left */}
          <button
            ref={setRef('left')}
            {...createTouchHandler('left')}
            className="col-start-1 row-start-2 bg-white text-blue-900 p-4 rounded-xl 
                      text-2xl font-bold shadow-lg active:scale-95 touch-none select-none
                      border border-gray-200 min-h-[52px] min-w-[52px] aspect-square
                      flex items-center justify-center"
          >
            ◀
          </button>
          {/* Right */}
          <button
            ref={setRef('right')}
            {...createTouchHandler('right')}
            className="col-start-3 row-start-2 bg-white text-blue-900 p-4 rounded-xl 
                      text-2xl font-bold shadow-lg active:scale-95 touch-none select-none
                      border border-gray-200 min-h-[52px] min-w-[52px] aspect-square
                      flex items-center justify-center"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}