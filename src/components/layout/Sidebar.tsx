import React, { useState } from 'react';
import { GardenDimensions } from '../configuration/GardenDimensions';
import { VegetableSelector } from '../configuration/VegetableSelector';
import { useOptimization } from '../../hooks/useOptimization';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';

type TabType = 'dimensions' | 'plants';

export const Sidebar: React.FC = () => {
  const { isOptimizing, optimizationProgress, optimizationError, runOptimization } = useOptimization();
  const { selectedVegetables } = useVegetableSelection();
  const [activeTab, setActiveTab] = useState<TabType>('plants');

  const canOptimize = selectedVegetables.length > 0 && !isOptimizing;

  return (
    <aside className="w-[400px] flex-shrink-0 h-full glass-panel flex flex-col">
      {/* Header compact */}
      <div className="px-5 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800">Garden Planner</h1>
          </div>
          {/* Bouton Optimiser compact */}
          <button
            onClick={runOptimization}
            disabled={!canOptimize}
            className={`
              px-4 py-2 rounded-xl font-semibold text-sm
              flex items-center gap-2 transition-all duration-200
              ${canOptimize
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isOptimizing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{optimizationProgress}%</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Optimiser</span>
              </>
            )}
          </button>
        </div>

        {optimizationError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{optimizationError}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-5 py-3 border-b border-slate-200/50">
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dimensions'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Dimensions
          </button>
          <button
            onClick={() => setActiveTab('plants')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'plants'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Plantes
            {selectedVegetables.length > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {selectedVegetables.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dimensions' ? (
          <div className="p-5 h-full overflow-y-auto custom-scrollbar">
            <GardenDimensions />
          </div>
        ) : (
          <VegetableSelector />
        )}
      </div>
    </aside>
  );
};
