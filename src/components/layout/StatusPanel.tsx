import React from 'react';
import { useGarden } from '../../context/GardenContext';
import { CapacityIndicator } from '../garden/CapacityIndicator';

export const StatusPanel: React.FC = () => {
  const { placementResult, selectedPlantId, setSelectedPlantId, layout, availableVegetables } = useGarden();

  // If a plant is selected, show its details
  if (selectedPlantId && layout) {
    let foundSegment: any = null;
    for (const row of layout.rows) {
      const seg = row.segments.find(s => s.id === selectedPlantId);
      if (seg) {
        foundSegment = seg;
        break;
      }
    }

    if (foundSegment) {
      const vegetable = availableVegetables.find(v => v.id === foundSegment.vegetableId);

      return (
        <aside className="w-[340px] flex-shrink-0 h-full glass-panel flex flex-col animate-fade-in">
          {/* Header with Back Button */}
          <div className="p-6 border-b border-slate-200/50">
            <button
              onClick={() => setSelectedPlantId(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Retour</span>
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{
                  backgroundColor: vegetable?.visualProperties.color,
                  boxShadow: `0 8px 24px -4px ${vegetable?.visualProperties.color}55`
                }}
              >
                {vegetable?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{vegetable?.name}</h2>
                <p className="text-sm text-slate-500">{foundSegment.plantCount} plants</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Companions Section */}
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Voisinage
            </h3>

            {foundSegment.companions.length > 0 ? (
              <div className="space-y-3">
                {foundSegment.companions.map((comp: any, idx: number) => {
                  const neighbor = availableVegetables.find(v => v.id === comp.vegetableId);
                  const isGood = comp.relationship === 'beneficial';
                  const isBad = comp.relationship === 'antagonistic' || comp.relationship === 'avoid';

                  return (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                          style={{ backgroundColor: neighbor?.visualProperties.color }}
                        >
                          {neighbor?.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700 flex-1">{neighbor?.name}</span>
                        <span className={`badge ${isGood ? 'badge-success' : isBad ? 'badge-danger' : 'bg-slate-100 text-slate-600'}`}>
                          {isGood ? 'Ami' : isBad ? 'Ennemi' : 'Neutre'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {comp.reason || 'Pas d\'interaction spécifique.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-slate-500 font-medium">Aucun voisin direct</p>
                <p className="text-sm text-slate-400 mt-1">Cette plante est isolée</p>
              </div>
            )}
          </div>
        </aside>
      );
    }
  }

  // Default View: Global Stats
  const unplacedVegetables = placementResult?.warnings
    .filter(w => w.type === 'insufficient_space')
    .flatMap(w => w.affectedVegetables || []) || [];

  return (
    <aside className="w-[340px] flex-shrink-0 h-full glass-panel flex flex-col">
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">État du Jardin</h2>
            <p className="text-sm text-slate-500">Métriques en temps réel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Capacity Section */}
        <CapacityIndicator />

        {/* Overflow Section */}
        {unplacedVegetables.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Zone de Réserve</h3>
                <p className="text-xs text-amber-600">Manque d'espace</p>
              </div>
            </div>

            <div className="space-y-2">
              {unplacedVegetables.map((vegId, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-amber-100">
                  <span className="font-medium text-amber-900">{vegId}</span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">En attente</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no layout */}
        {!layout && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">En attente d'optimisation</p>
            <p className="text-sm text-slate-400 mt-2">
              Sélectionnez des plantes et<br />cliquez sur "Optimiser"
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
