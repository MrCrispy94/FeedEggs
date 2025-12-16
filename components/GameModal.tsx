import React, { useState, useEffect, useRef } from 'react';
import { ModalConfig } from '../types';

interface GameModalProps {
  config: ModalConfig;
  onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ config, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config.show && config.type === 'INPUT') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setInputValue('');
  }, [config.show, config.type]);

  if (!config.show) return null;

  const handleOk = () => {
    if (config.onConfirm) config.onConfirm();
    onClose();
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (config.onInputConfirm) {
      const isValid = config.onInputConfirm(inputValue);
      if (isValid) {
        onClose();
      } else {
        setInputValue(''); // Clear on wrong answer
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
      <div className="bg-[#bae6fd] border-4 border-black p-6 w-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        {/* Double border effect style from image */}
        <div className="absolute top-1 left-1 right-1 h-[2px] bg-black opacity-20"></div>
        <div className="absolute top-2 left-1 right-1 h-[2px] bg-black opacity-20"></div>

        <div className="mt-6 mb-6 text-center font-game text-xl font-bold uppercase tracking-wider text-black">
          {config.text}
        </div>

        {config.type === 'INPUT' ? (
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border-2 border-black bg-white p-2 font-game uppercase text-center outline-none focus:bg-gray-50 text-black placeholder:text-gray-400"
              placeholder={config.inputPlaceholder}
              autoComplete="off"
            />
            {/* The prompt implies pressing enter, but visual consistency suggests buttons usually exist, though hidden in prompt for input. Adding hidden submit for enter key */}
          </form>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleOk}
              className="border-2 border-black px-6 py-2 bg-white hover:bg-gray-100 font-game font-bold uppercase active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-black"
            >
              {config.okText || 'OK'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};