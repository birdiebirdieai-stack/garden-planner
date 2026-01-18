import React, { useState, useMemo } from 'react';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';
import { Vegetable } from '../../data/types';

// Catégories de légumes basées sur leur type
const CATEGORIES: Record<string, { label: string; icon: string; ids: string[] }> = {
  leafy: {
    label: 'Feuilles',
    icon: '🥬',
    ids: ['lettuce', 'epinard', 'lambs-lettuce', 'chicory', 'chard', 'cabbage', 'brussels-sprout']
  },
  fruit: {
    label: 'Fruits',
    icon: '🍅',
    ids: ['tomato', 'eggplant', 'zucchini', 'cucumber', 'gherkin', 'squash', 'pumpkin', 'melon', 'chili', 'strawberry']
  },
  root: {
    label: 'Racines',
    icon: '🥕',
    ids: ['carrot', 'beet', 'radish', 'turnip', 'parsnip', 'potato', 'horseradish', 'jerusalem-artichoke']
  },
  legume: {
    label: 'Légumineuses',
    icon: '🫛',
    ids: ['bean', 'pole-bean', 'pea', 'pole-pea', 'broad-bean']
  },
  bulb: {
    label: 'Bulbes',
    icon: '🧅',
    ids: ['garlic', 'onion', 'shallot', 'leek']
  },
  other: {
    label: 'Autres',
    icon: '🌿',
    ids: ['asparagus', 'broccoli', 'cauliflower', 'celery', 'chervil', 'fennel', 'corn', 'thyme', 'sunflower', 'panais']
  }
};

const getCategoryForVegetable = (vegId: string): string => {
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    if (cat.ids.includes(vegId)) return catKey;
  }
  return 'other';
};

export const VegetableSelector: React.FC = () => {
  const {
    availableVegetables,
    selectedVegetables,
    addVegetable,
    removeVegetable,
    updateVegetablePriority,
  } = useVegetableSelection();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedVegId, setExpandedVegId] = useState<string | null>(null);

  // Grouper les légumes par catégorie
  const vegetablesByCategory = useMemo(() => {
    const grouped: Record<string, Vegetable[]> = {};
    availableVegetables.forEach(veg => {
      const cat = getCategoryForVegetable(veg.id);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(veg);
    });
    return grouped;
  }, [availableVegetables]);

  // Filtrer les légumes
  const filteredVegetables = useMemo(() => {
    let vegs = availableVegetables;

    if (searchTerm) {
      vegs = vegs.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (activeCategory) {
      vegs = vegs.filter(v => getCategoryForVegetable(v.id) === activeCategory);
    }

    return vegs;
  }, [availableVegetables, searchTerm, activeCategory]);

  const selectedVegsData = selectedVegetables.map(sv => ({
    ...sv,
    vegetable: availableVegetables.find(v => v.id === sv.vegetableId)
  })).filter(sv => sv.vegetable);

  return (
    <div className="flex flex-col h-full">
      {/* Section des légumes sélectionnés */}
      {selectedVegsData.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-200/50 bg-primary-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sélection ({selectedVegsData.length})
            </span>
            <button
              onClick={() => selectedVegsData.forEach(sv => removeVegetable(sv.vegetableId))}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Tout effacer
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedVegsData.map(({ vegetableId, vegetable, priority }) => (
              <div
                key={vegetableId}
                className="group flex items-center gap-1.5 bg-white rounded-full pl-1 pr-2 py-1 border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: vegetable?.visualProperties.color }}
                >
                  {vegetable?.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
                  {vegetable?.name}
                </span>
                <button
                  onClick={() => setExpandedVegId(expandedVegId === vegetableId ? null : vegetableId)}
                  className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeVegetable(vegetableId)}
                  className="w-5 h-5 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Menu de quantité */}
                {expandedVegId === vegetableId && (
                  <div className="absolute mt-24 ml-0 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-fade-in">
                    <p className="text-xs text-slate-500 mb-2 px-2">Quantité</p>
                    <div className="flex gap-1">
                      {[
                        { val: 1, label: 'Peu' },
                        { val: 3, label: 'Moyen' },
                        { val: 5, label: 'Beaucoup' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            updateVegetablePriority(vegetableId, opt.val);
                            setExpandedVegId(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            priority === opt.val
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="px-5 py-3 border-b border-slate-200/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="px-5 py-3 border-b border-slate-200/50">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !activeCategory
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === key
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des légumes */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3">
          {filteredVegetables.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Aucun résultat</p>
              <p className="text-sm text-slate-400 mt-1">Essayez un autre terme</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredVegetables.map((veg) => {
                const isSelected = selectedVegetables.some(sv => sv.vegetableId === veg.id);

                return (
                  <button
                    key={veg.id}
                    onClick={() => isSelected ? removeVegetable(veg.id) : addVegetable(veg.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'bg-white hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: veg.visualProperties.color,
                        boxShadow: `0 2px 8px -2px ${veg.visualProperties.color}66`
                      }}
                    >
                      {veg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                        {veg.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {veg.spacing.plantSpacing}×{veg.spacing.rowSpacing} cm
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
