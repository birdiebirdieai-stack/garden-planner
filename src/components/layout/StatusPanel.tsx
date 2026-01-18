
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
                <aside className="w-[350px] flex-shrink-0 h-full apple-panel flex flex-col z-20 animate-in slide-in-from-right duration-300">
                    {/* Header with Back Button */}
                    <div className="p-6 border-b border-black/5 flex items-center gap-4 bg-white/50 backdrop-blur-md">
                        <button
                            onClick={() => setSelectedPlantId(null)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-apple-gray-100 text-apple-text-primary hover:bg-apple-gray-200 transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-apple-text-primary leading-tight">{vegetable?.name}</h2>
                            <p className="text-xs text-apple-text-secondary">{foundSegment.plantCount} plants</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {/* Vegetable Info */}
                        <div className="mb-6">
                            <div className="w-full h-32 rounded-2xl mb-4 shadow-sm overflow-hidden relative border border-black/5">
                                <div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: vegetable?.visualProperties.color }}
                                />
                                <div className="absolute bottom-3 left-4 text-white font-bold drop-shadow-md text-xl">
                                    {vegetable?.name}
                                </div>
                            </div>
                        </div>

                        {/* Companions Section */}
                        <h3 className="text-xs font-bold text-apple-text-secondary uppercase tracking-wider mb-4 pl-1">Voisinage</h3>

                        {foundSegment.companions.length > 0 ? (
                            <div className="space-y-3">
                                {foundSegment.companions.map((comp: any, idx: number) => {
                                    const neighbor = availableVegetables.find(v => v.id === comp.vegetableId);
                                    const isGood = comp.relationship === 'beneficial';
                                    const isBad = comp.relationship === 'antagonistic' || comp.relationship === 'avoid';

                                    return (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: neighbor?.visualProperties.color }}
                                                />
                                                <span className="font-semibold text-apple-text-primary">{neighbor?.name}</span>
                                                <span className={`
                                                    text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto
                                                    ${isGood ? 'bg-apple-green-light text-apple-green' :
                                                        isBad ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}
                                                `}>
                                                    {isGood ? 'AMI' : isBad ? 'ENNEMI' : 'NEUTRE'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-apple-text-secondary leading-relaxed">
                                                {comp.reason || 'Pas d\'interaction spécifique.'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-apple-text-tertiary italic text-center py-8 bg-apple-gray-50 rounded-xl border border-black/5">
                                Aucun voisin direct influant.
                            </p>
                        )}
                    </div>
                </aside>
            );
        }
    }

    // Default View: Global Stats & Overflow
    const unplacedVegetables = placementResult?.warnings
        .filter(w => w.type === 'insufficient_space')
        .flatMap(w => w.affectedVegetables || []) || [];

    return (
        <aside className="w-[350px] flex-shrink-0 h-full apple-panel flex flex-col z-20">
            <div className="p-6 border-b border-black/5 bg-white/50 backdrop-blur-md">
                <h2 className="text-xl font-bold text-apple-text-primary mb-1">État du Jardin</h2>
                <p className="text-sm text-apple-text-secondary">Métriques en temps réel</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Capacity Section */}
                <section className="mb-8">
                    <CapacityIndicator />
                </section>

                {/* Overflow Section - The "Reserve" */}
                {unplacedVegetables.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                        <h3 className="text-orange-600 font-bold mb-3 flex items-center gap-2">
                            <span>⚠️</span> Zone de Réserve
                        </h3>
                        <p className="text-xs text-orange-800/70 mb-3">
                            Manque d'espace pour :
                        </p>
                        <div className="space-y-2">
                            {unplacedVegetables.map((vegId, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded-lg text-sm text-orange-900 border border-orange-100/50">
                                    <span className="font-medium">{vegId}</span>
                                    <span className="text-xs opacity-60">En attente</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
