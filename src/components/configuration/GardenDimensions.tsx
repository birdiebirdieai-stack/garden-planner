import React, { useState, useEffect } from 'react';
import { useGarden } from '../../context/GardenContext';

export const GardenDimensions: React.FC = () => {
  const { garden, updateGardenDimensions } = useGarden();

  const [width, setWidth] = useState(garden.dimensions.width.toString());
  const [length, setLength] = useState(garden.dimensions.length.toString());

  const area = (parseFloat(width) || 0) * (parseFloat(length) || 0);
  const areaInM2 = area / 10000;

  useEffect(() => {
    const timer = setTimeout(() => {
      const widthNum = parseFloat(width);
      const lengthNum = parseFloat(length);
      if (widthNum > 0 && lengthNum > 0) {
        updateGardenDimensions(widthNum, lengthNum);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [width, length, updateGardenDimensions]);

  return (
    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Dimensions</h3>
          <p className="text-xs text-slate-500">Taille de votre potager</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Largeur
          </label>
          <div className="relative">
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="input pr-12 font-medium"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              cm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Longueur
          </label>
          <div className="relative">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="input pr-12 font-medium"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              cm
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-800">{areaInM2.toFixed(1)}</span>
          <span className="text-sm text-slate-500 font-medium">m²</span>
        </div>
        <span className="badge badge-success">
          Surface totale
        </span>
      </div>
    </div>
  );
};
