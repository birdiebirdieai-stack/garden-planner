import React, { useState } from 'react';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Vegetable } from '../../data/types';

export const VegetableSelector: React.FC = () => {
  const {
    availableVegetables,
    selectedVegetables,
    addVegetable,
    removeVegetable,
    updateVegetableQuantity,
    updateVegetablePriority,
  } = useVegetableSelection();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredVegetables = availableVegetables.filter(veg =>
    veg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (vegetableId: string) =>
    selectedVegetables.some(sv => sv.vegetableId === vegetableId);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 relative px-1">
        <input
          type="text"
          placeholder="Rechercher une plante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-3 text-sm"
        />
        <span className="absolute left-4 top-3.5 text-sage-400 opacity-70">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-20 px-1 overflow-y-auto custom-scrollbar">
        {filteredVegetables.map((veg) => {
          const selection = selectedVegetables.find(sv => sv.vegetableId === veg.id);
          const isSelected = !!selection;
          const priority = selection?.priority || 3;

          return (
            <div
              key={veg.id}
              onClick={() => !isSelected ? addVegetable(veg.id) : null}
              className={`
                relative p-3 rounded-2xl cursor-pointer transition-all duration-300 group
                ${isSelected
                  ? 'bg-sage-900/40 border border-sage-500/50 shadow-[0_0_15px_rgba(132,181,139,0.1)]'
                  : 'glass-card border border-transparent hover:border-white/10'}
              `}
            >
              {/* Header: Color + Name */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-white/90 border border-white/10"
                  style={{
                    backgroundColor: veg.visualProperties.color,
                    boxShadow: isSelected ? `0 0 12px ${veg.visualProperties.color}55` : 'none'
                  }}
                >
                  {veg.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-sage-300' : 'text-cream-200'}`}>
                    {veg.name}
                  </h3>
                </div>

                {/* Close Button (only if selected) */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVegetable(veg.id);
                    }}
                    className="text-white/20 hover:text-clay-400 transition-colors -mr-1 p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Selection Controls (only if selected) */}
              {isSelected ? (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex bg-black/40 rounded-lg p-1 gap-1">
                    {[
                      { val: 1, label: 'Peu' },
                      { val: 3, label: 'Moy' },
                      { val: 5, label: '++' }
                    ].map((opt) => {
                      const active = priority === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateVegetablePriority(veg.id, opt.val);
                          }}
                          className={`
                              flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all text-center
                              ${active
                              ? 'bg-sage-600 text-white shadow-sm ring-1 ring-white/10'
                              : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                            `}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Hint text when not selected
                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] text-sage-400 font-medium bg-sage-900/30 px-2 py-0.5 rounded-full border border-sage-500/20">
                    Ajouter +
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredVegetables.length === 0 && (
          <div className="col-span-2 text-center py-12 opacity-50">
            <p className="text-cream-300 text-sm">Aucune plante trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};
