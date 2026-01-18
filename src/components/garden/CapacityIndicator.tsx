
import React, { useMemo } from 'react';
import { useGarden } from '../../context/GardenContext';
import { useVegetableSelection } from '../../hooks/useVegetableSelection';
import { Vegetable } from '../../data/types';
import { vegetables } from '../../data/vegetables.json';

// Create a map for faster lookups
const vegetableMap = new Map<string, Vegetable>(
    vegetables.map((v) => [v.id, v as Vegetable])
);

export const CapacityIndicator: React.FC = () => {
    const { garden } = useGarden();
    const { selectedVegetables } = useVegetableSelection();

    // Theoretical area calculation
    const { totalArea, usedArea, utilizationPercentage } = useMemo(() => {
        // Ensure numeric dimensions
        const width = Number(garden.dimensions?.width) || 0;
        const length = Number(garden.dimensions?.length) || 0;

        // Total garden area in sq meters (cm * cm / 10000)
        const totalAreaSqM = (width * length) / 10000;

        // Used area based on selected vegetables
        let usedAreaSqCm = 0;

        selectedVegetables.forEach((selection) => {
            const veg = vegetableMap.get(selection.vegetableId);
            if (veg && veg.spacing) {
                // Explicitly cast to Number to avoid string arithmetic or NaNs
                const rowSpacing = Number(veg.spacing.rowSpacing) || 0;
                const plantSpacing = Number(veg.spacing.plantSpacing) || 0;
                const quantity = Number(selection.quantity) || 0;

                // Area per plant = row spacing * plant spacing
                const plantArea = rowSpacing * plantSpacing;

                usedAreaSqCm += plantArea * quantity;
            }
        });

        const usedAreaSqM = usedAreaSqCm / 10000;
        // Protect against division by zero if garden has no area
        const percent = totalAreaSqM > 0 ? (usedAreaSqM / totalAreaSqM) * 100 : 0;

        return {
            totalArea: totalAreaSqM,
            usedArea: usedAreaSqM,
            utilizationPercentage: percent
        };
    }, [garden.dimensions, selectedVegetables]);

    // Determine status color
    const statusColor =
        utilizationPercentage > 100 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
            utilizationPercentage > 90 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';

    const textColor =
        utilizationPercentage > 100 ? 'text-red-400' :
            utilizationPercentage > 90 ? 'text-amber-400' :
                'text-emerald-400';

    // Format numbers safely
    const formattedPercent = !isNaN(utilizationPercentage) ? utilizationPercentage.toFixed(0) : '0';
    const formattedUsed = !isNaN(usedArea) ? usedArea.toFixed(1) : '0.0';
    const formattedTotal = !isNaN(totalArea) ? totalArea.toFixed(1) : '0.0';

    return (
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm mb-6">
            <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-apple-text-secondary uppercase tracking-wider">
                    Occupation
                </span>
                <span className={`text-xl font-bold ${textColor}`}>
                    {formattedPercent}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-apple-gray-100 rounded-full h-3 overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${statusColor}`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                ></div>
            </div>

            <div className="flex justify-between text-xs text-apple-text-secondary font-medium">
                <div className="flex flex-col">
                    <span className="text-apple-text-tertiary text-[10px]">Surface</span>
                    <span>{formattedUsed}m² / {formattedTotal}m²</span>
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-apple-text-tertiary text-[10px]">Total</span>
                    <span>{formattedPercent}%</span>
                </div>
            </div>

            {utilizationPercentage > 100 && (
                <div className="mt-4 text-xs bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Surface insuffisante ! Certains légumes ne seront pas placés.</span>
                </div>
            )}
        </div>
    );
};
