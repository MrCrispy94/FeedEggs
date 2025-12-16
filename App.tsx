import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BasketIcon, EggmanIcon } from './components/Icons';
import { GameModal } from './components/GameModal';
import { GamePhase, GameState, ModalConfig } from './types';

// Utility for random int
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export default function App() {
  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>({
    eggsFed: 0,
    inventoryCount: null,
    phase: GamePhase.PLAYING,
    runOutThreshold: 0,
    winThreshold: 0,
    isLinesRed: false,
  });

  // Eggman visual state
  const [isChewing, setIsChewing] = useState(false);
  const [eggmanOrientation, setEggmanOrientation] =
    useState<'front' | 'turning1' | 'turning2' | 'back'>('front');

  // Interaction
  const [holdingEgg, setHoldingEgg] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [randomModalTriggers, setRandomModalTriggers] = useState<Set<number>>(
    new Set()
  );

  const eggmanRef = useRef<HTMLDivElement>(null);

  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    show: false,
    text: '',
    type: 'NONE',
  });

  // --- Init ---
  const initGame = useCallback(() => {
    const runOut = randomInt(20, 40);
    const win = runOut + randomInt(10, 20);

    const triggers = new Set<number>();
    for (let i = 0; i < 5; i++) {
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

  // --- Input ---
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleBasketClick = () => {
    if (modalConfig.show) return;
    if (
      gameState.phase === GamePhase.OUT_OF_EGGS ||
      gameState.phase === GamePhase.NUDE_SCENE
    )
      return;

    setHoldingEgg(true);
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (!holdingEgg) return;

    if (eggmanRef.current) {
      const rect = eggmanRef.current.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside) feedEgg();
      else setHoldingEgg(false);
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

    if (newInventory !== null) newInventory--;

    if (gameState.phase === GamePhase.BOUGHT_EGGS) {
      newInventory = 40;
      setModalConfig({
        show: true,
        text: 'You now have 40 eggs',
        type: 'INFO',
        onConfirm: () =>
          setGameState((p) => ({ ...p, phase: GamePhase.HAS_40_EGGS })),
      });
      nextPhase = GamePhase.HAS_40_EGGS;
    }

    if (
      gameState.phase === GamePhase.PLAYING &&
      randomModalTriggers.has(newFedCount)
    ) {
      setModalConfig({
        show: true,
        text: `${randomInt(1, 300)} EGGS`,
        type: 'INFO',
      });
    }

    if (
      gameState.phase === GamePhase.PLAYING &&
      newFedCount >= gameState.runOutThreshold
    ) {
      setGameState((p) => ({
        ...p,
        eggsFed: newFedCount,
        inventoryCount: newInventory,
        isLinesRed: true,
        phase: GamePhase.OUT_OF_EGGS,
      }));

      setModalConfig({
        show: true,
        text: 'Dude, you ran out of eggs. Buy an 80 pack?',
        type: 'INPUT',
        inputPlaceholder: 'TYPE YES',
        onInputConfirm: (val) => {
          if (val === 'YES') {
            setGameState((p) => ({
              ...p,
              phase: GamePhase.BOUGHT_EGGS,
              inventoryCount: 80,
              isLinesRed: false,
            }));
            return true;
          }
          return false;
        },
      });
      return;
    }

    if (newFedCount === gameState.winThreshold) {
      setModalConfig({
        show: true,
        text: '41 eggs',
        type: 'INFO',
        onConfirm: () =>
          setTimeout(
            () =>
              setModalConfig({
                show: true,
                text: 'Congrats big boy',
                type: 'INFO',
                onConfirm: triggerFinale,
              }),
            200
          ),
      });
    }

    setGameState((p) => ({
      ...p,
      eggsFed: newFedCount,
      inventoryCount: newInventory,
      phase: nextPhase,
    }));
  };

  const triggerFinale = () => {
    setGameState((p) => ({ ...p, phase: GamePhase.WIN_SEQUENCE_START }));
    setTimeout(() => setEggmanOrientation('turning1'), 1000);
    setTimeout(() => setEggmanOrientation('turning2'), 1500);
    setTimeout(() => {
      setEggmanOrientation('back');
      setGameState((p) => ({ ...p, phase: GamePhase.NUDE_SCENE }));
      setModalConfig({
        show: true,
        text: "You're looking at a nude egg.",
        type: 'INFO',
      });
    }, 2000);
  };

  // --- Render ---
  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleGlobalClick}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#333',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Game Window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#9ca3af',
          border: `8px solid ${
            gameState.isLinesRed ? '#dc2626' : '#000'
          }`,
          boxSizing: 'border-box',
        }}
      >
        {/* Header lines */}
        <div
          style={{
            height: 16,
            borderBottom: `4px solid ${
              gameState.isLinesRed ? '#dc2626' : '#000'
            }`,
          }}
        />
        <div
          style={{
            height: 8,
            borderBottom: `2px solid ${
              gameState.isLinesRed ? '#dc2626' : '#000'
            }`,
          }}
        />

        <h1
          style={{
            position: 'absolute',
            top: 48,
            width: '100%',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          FEED EGGS
        </h1>

        {/* Eggman */}
        <div
          ref={eggmanRef}
          style={{
            position: 'absolute',
            bottom: 40,
            left:
              gameState.phase === GamePhase.WIN_SEQUENCE_START ||
              gameState.phase === GamePhase.NUDE_SCENE
                ? '50%'
                : 80,
            transform:
              gameState.phase === GamePhase.WIN_SEQUENCE_START ||
              gameState.phase === GamePhase.NUDE_SCENE
                ? 'translateX(-50%)'
                : undefined,
            width: 192,
            height: 256,
            transition: 'all 1s ease-in-out',
          }}
        >
          <EggmanIcon
            isChewing={isChewing}
            orientation={eggmanOrientation}
          />
        </div>

        {/* Basket */}
        {gameState.phase !== GamePhase.NUDE_SCENE &&
          gameState.phase !== GamePhase.WIN_SEQUENCE_START && (
            <div
              style={{
                position: 'absolute',
                bottom: 80,
                right: 80,
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleBasketClick();
              }}
            >
              <BasketIcon />
              {gameState.inventoryCount !== null && (
                <div style={{ marginTop: 16, fontWeight: 700 }}>
                  EGGS: {gameState.inventoryCount}
                </div>
              )}
            </div>
          )}

        {/* New Game */}
        {gameState.phase === GamePhase.NUDE_SCENE && (
          <button
            onClick={initGame}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: '8px 16px',
              border: '2px solid black',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            New Game
          </button>
        )}

        {/* Floating Egg */}
        {holdingEgg && (
          <div
            style={{
              position: 'fixed',
              left: cursorPos.x,
              top: cursorPos.y,
              width: 32,
              height: 40,
              background: '#bae6fd',
              border: '2px solid black',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
      </div>

      <GameModal
        config={modalConfig}
        onClose={() =>
          setModalConfig((c) => ({ ...c, show: false }))
        }
      />
    </div>
  );
}
