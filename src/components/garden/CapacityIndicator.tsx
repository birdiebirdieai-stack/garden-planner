import React, { useMemo } from 'react';
import { useGarden } from '../../context/GardenContext';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';
import { Vegetable } from '../../data/types';
import { vegetables } from '../../data/vegetables.json';

const vegetableMap = new Map<string, Vegetable>(
  vegetables.map((v) => [v.id, v as Vegetable])
);

export const CapacityIndicator: React.FC = () => {
  const { garden } = useGarden();
  const { selectedVegetables } = useVegetableSelection();

  const { totalArea, usedArea, utilizationPercentage } = useMemo(() => {
    const width = Number(garden.dimensions?.width) || 0;
    const length = Number(garden.dimensions?.length) || 0;
    const totalAreaSqM = (width * length) / 10000;

    let usedAreaSqCm = 0;
    selectedVegetables.forEach((selection) => {
      const veg = vegetableMap.get(selection.vegetableId);
      if (veg && veg.spacing) {
        const rowSpacing = Number(veg.spacing.rowSpacing) || 0;
        const plantSpacing = Number(veg.spacing.plantSpacing) || 0;
        const quantity = Number(selection.quantity) || 0;
        const plantArea = rowSpacing * plantSpacing;
        usedAreaSqCm += plantArea * quantity;
      }
    });

    const usedAreaSqM = usedAreaSqCm / 10000;
    const percent = totalAreaSqM > 0 ? (usedAreaSqM / totalAreaSqM) * 100 : 0;

    return {
      totalArea: totalAreaSqM,
      usedArea: usedAreaSqM,
      utilizationPercentage: percent
    };
  }, [garden.dimensions, selectedVegetables]);

  const getStatusColor = () => {
    if (utilizationPercentage > 100) return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
    if (utilizationPercentage > 90) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' };
    return { bg: 'bg-primary-500', text: 'text-primary-600', light: 'bg-primary-100' };
  };

  const colors = getStatusColor();
  const formattedPercent = !isNaN(utilizationPercentage) ? utilizationPercentage.toFixed(0) : '0';
  const formattedUsed = !isNaN(usedArea) ? usedArea.toFixed(1) : '0.0';
  const formattedTotal = !isNaN(totalArea) ? totalArea.toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colors.light} rounded-xl flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Occupation</h3>
            <p className="text-xs text-slate-500">Espace utilisé</p>
          </div>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>
          {formattedPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <div
          className={`progress-bar-fill ${colors.bg}`}
          style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <span className="text-slate-400 text-xs block">Utilisé</span>
          <span className="font-semibold text-slate-700">{formattedUsed} m²</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-xs block">Total</span>
          <span className="font-semibold text-slate-700">{formattedTotal} m²</span>
        </div>
      </div>

      {utilizationPercentage > 100 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Surface insuffisante</p>
            <p className="text-xs text-red-600 mt-0.5">Certains légumes ne seront pas placés</p>
          </div>
        </div>
      )}
    </div>
  );
};
