import React from 'react';
import { GardenDimensions } from '../configuration/GardenDimensions';
import { VegetableSelector } from '../configuration/VegetableSelector';
import { useOptimization } from '../../hooks/useOptimization';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';

export const Sidebar: React.FC = () => {
  const { isOptimizing, optimizationProgress, optimizationError, runOptimization } = useOptimization();
  const { selectedVegetables } = useVegetableSelection();

  const canOptimize = selectedVegetables.length > 0 && !isOptimizing;

  return (
    <aside className="w-[350px] flex-shrink-0 h-full apple-panel z-20 flex flex-col transition-all">
      <div className="p-6 pb-4 border-b border-black/5 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-apple-green rounded-xl flex items-center justify-center text-xl shadow-lg shadow-apple-green/20 text-white">
            🥗
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-apple-text-primary tracking-tight">
              Garden Planner
            </h1>
            <p className="text-xs text-apple-green font-medium uppercase tracking-wider">
              Mode Création
            </p>
          </div>
        </div>

        <GardenDimensions />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 custom-scrollbar">
        <VegetableSelector />
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-black/5 bg-white/50 backdrop-blur-md z-30">
        <button
          onClick={runOptimization}
          disabled={!canOptimize}
          className={`
            w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200
            flex items-center justify-center gap-3
            ${canOptimize
              ? 'apple-button shadow-apple-green/30 active:scale-[0.98]'
              : 'bg-apple-gray-200 text-apple-text-tertiary cursor-not-allowed shadow-none'
            }
          `}
        >
          {isOptimizing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Optimisation... {optimizationProgress}%</span>
            </>
          ) : (
            <>
              <span>⚡</span> Optimiser
            </>
          )}
        </button>

        {optimizationError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-xs text-red-600 font-medium">{optimizationError}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
