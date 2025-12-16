import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BasketIcon, EggmanIcon } from './components/Icons';
import { GameModal } from './components/GameModal';
import { GamePhase, GameState, ModalConfig } from './types';

// Utility for random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export default function App() {
  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>({
    eggsFed: 0,
    inventoryCount: null,
    phase: GamePhase.PLAYING,
    runOutThreshold: 0, // Set in init
    winThreshold: 0, // Set in init
    isLinesRed: false,
  });

  // Eggman visual state
  const [isChewing, setIsChewing] = useState(false);
  const [eggmanOrientation, setEggmanOrientation] = useState<'front' | 'turning1' | 'turning2' | 'back'>('front');
  
  // Interaction State
  const [holdingEgg, setHoldingEgg] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [randomModalTriggers, setRandomModalTriggers] = useState<Set<number>>(new Set());

  // Refs for element detection
  const eggmanRef = useRef<HTMLDivElement>(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    show: false,
    text: '',
    type: 'NONE',
  });

  // --- Initialization ---
  const initGame = useCallback(() => {
    const runOut = randomInt(20, 40);
    const win = runOut + randomInt(10, 20); // Arbitrary amount after run out
    
    // Generate some random numbers for the "X Eggs" modal
    const triggers = new Set<number>();
    for(let i=0; i<5; i++) {
        triggers.add(randomInt(2, runOut - 2));
    }

    setGameState({
      eggsFed: 0,
      inventoryCount: null,
      phase: GamePhase.PLAYING,
      runOutThreshold: runOut,
      winThreshold: win,
      isLinesRed: false,
    });
    setRandomModalTriggers(triggers);
    setEggmanOrientation('front');
    setHoldingEgg(false);
    setIsChewing(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // --- Input Handlers ---

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleBasketClick = () => {
    if (modalConfig.show) return;
    if (gameState.phase === GamePhase.OUT_OF_EGGS || gameState.phase === GamePhase.NUDE_SCENE) return;
    
    setHoldingEgg(true);
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (!holdingEgg) return;
    
    // Check if clicked inside Eggman
    if (eggmanRef.current) {
      const rect = eggmanRef.current.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (isInside) {
        feedEgg();
      } else {
        // Drop egg (cancel)
        setHoldingEgg(false);
      }
    }
  };

  // --- Core Logic ---

  const feedEgg = () => {
    setHoldingEgg(false);
    setIsChewing(true);
    setTimeout(() => setIsChewing(false), 500);

    const newFedCount = gameState.eggsFed + 1;
    let newInventory = gameState.inventoryCount;
    let nextPhase = gameState.phase;

    // Logic: Reduce inventory if we have one
    if (newInventory !== null) {
      newInventory--;
    }

    // 1. Check for "Bought Eggs -> First Drop" transition
    if (gameState.phase === GamePhase.BOUGHT_EGGS) {
        newInventory = 40; // Immediate drop to 40
        setModalConfig({
            show: true,
            text: 'You now have 40 eggs',
            type: 'INFO',
            onConfirm: () => {
                 setGameState(prev => ({ ...prev, phase: GamePhase.HAS_40_EGGS }));
            }
        });
        nextPhase = GamePhase.HAS_40_EGGS; // Update phase logic immediately for state update
    }
    
    // 2. Random Popups (Only if not in a special event)
    if (gameState.phase === GamePhase.PLAYING && randomModalTriggers.has(newFedCount)) {
        setModalConfig({
            show: true,
            text: `${randomInt(1, 300)} EGGS`, // Increased variance to go "up or down" drastically
            type: 'INFO'
        });
    }

    // 3. Run Out Event
    if (gameState.phase === GamePhase.PLAYING && newFedCount >= gameState.runOutThreshold) {
        setGameState(prev => ({
            ...prev,
            eggsFed: newFedCount,
            inventoryCount: newInventory,
            isLinesRed: true,
            phase: GamePhase.OUT_OF_EGGS
        }));
        
        setModalConfig({
            show: true,
            text: 'Dude, you ran out of eggs. Would you like to buy an 80 pack of eggs?',
            type: 'INPUT',
            inputPlaceholder: 'TYPE YES',
            onInputConfirm: (val) => {
                if (val === 'YES') {
                    setGameState(prev => ({
                        ...prev,
                        phase: GamePhase.BOUGHT_EGGS,
                        inventoryCount: 80,
                        isLinesRed: false
                    }));
                    return true;
                }
                return false;
            }
        });
        return; // Stop execution here to let modal handle state transition
    }

    // 4. "Arbitrary Amount" -> Big Boy -> Nude Scene
    if (newFedCount === gameState.winThreshold) {
         setModalConfig({
            show: true,
            text: '41 eggs', // Prompt says "41 eggs" specifically at arbitrary amount
            type: 'INFO',
            onConfirm: () => {
                // Next modal immediately
                setTimeout(() => {
                    setModalConfig({
                        show: true,
                        text: 'Congrats big boy',
                        type: 'INFO',
                        onConfirm: () => triggerFinale()
                    });
                }, 200);
            }
        });
    }

    setGameState(prev => ({
        ...prev,
        eggsFed: newFedCount,
        inventoryCount: newInventory,
        phase: nextPhase
    }));
  };

  const triggerFinale = () => {
      setGameState(prev => ({ ...prev, phase: GamePhase.WIN_SEQUENCE_START }));
      
      // Animation Sequence
      setTimeout(() => setEggmanOrientation('turning1'), 1000);
      setTimeout(() => setEggmanOrientation('turning2'), 1500);
      setTimeout(() => {
          setEggmanOrientation('back');
          setGameState(prev => ({ ...prev, phase: GamePhase.NUDE_SCENE }));
          setModalConfig({
              show: true,
              text: "You're looking at a nude egg.",
              type: 'INFO'
          });
      }, 2000);
  };

  // --- Render Helpers ---

  const getContainerClass = () => {
    let base = "relative w-[800px] h-[600px] bg-[#9ca3af] border-[8px] transition-colors duration-300 ";
    if (gameState.isLinesRed) return base + "border-red-600";
    return base + "border-black";
  };

  const getEggmanClass = () => {
      // Centering logic for finale
      if (gameState.phase === GamePhase.WIN_SEQUENCE_START || gameState.phase === GamePhase.NUDE_SCENE) {
          return "absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out";
      }
      return "absolute bottom-10 left-20 transition-all duration-1000 ease-in-out";
  };

  return (
    <div 
        className="w-full h-full flex items-center justify-center bg-[#333]"
        onMouseMove={handleMouseMove}
        onClick={handleGlobalClick}
    >
      <div className={getContainerClass()}>
        {/* Header Lines (Window decoration) */}
        <div className={`w-full h-4 border-b-4 ${gameState.isLinesRed ? 'border-red-600' : 'border-black'} mb-1`}></div>
        <div className={`w-full h-2 border-b-2 ${gameState.isLinesRed ? 'border-red-600' : 'border-black'}`}></div>

        {/* FEED EGGS Text */}
        <div className="absolute top-12 w-full text-center">
            <h1 className="font-game text-2xl font-bold tracking-widest opacity-80">FEED EGGS</h1>
        </div>

        {/* EGGMAN */}
        <div ref={eggmanRef} className={`${getEggmanClass()} w-48 h-64`}>
            <EggmanIcon isChewing={isChewing} orientation={eggmanOrientation} />
        </div>

        {/* BASKET */}
        {gameState.phase !== GamePhase.NUDE_SCENE && gameState.phase !== GamePhase.WIN_SEQUENCE_START && (
            <div className="absolute bottom-20 right-20 flex flex-col items-center">
                <div 
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={(e) => { e.stopPropagation(); handleBasketClick(); }}
                >
                    <BasketIcon />
                </div>
                {gameState.inventoryCount !== null && (
                    <div className="mt-4 font-game font-bold text-lg">
                        EGGS: {gameState.inventoryCount}
                    </div>
                )}
            </div>
        )}

        {/* New Game Button (Only at end) */}
        {gameState.phase === GamePhase.NUDE_SCENE && (
            <button 
                onClick={initGame}
                className="absolute top-4 right-4 bg-white border-2 border-black px-4 py-2 font-game font-bold hover:bg-gray-200 text-black"
            >
                New Game
            </button>
        )}

        {/* Floating Cursor Egg */}
        {holdingEgg && (
            <div 
                className="fixed pointer-events-none z-50 w-8 h-10 bg-[#bae6fd] border-2 border-black rounded-[50%]"
                style={{ 
                    left: cursorPos.x, 
                    top: cursorPos.y, 
                    transform: 'translate(-50%, -50%)' 
                }}
            />
        )}
      </div>

      {/* Modals */}
      <GameModal 
        config={modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, show: false })} 
      />
    </div>
  );
}