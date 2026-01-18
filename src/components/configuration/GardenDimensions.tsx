import React, { useState, useEffect } from 'react';
import { useGarden } from '../../context/GardenContext';

export const GardenDimensions: React.FC = () => {
  const { garden, updateGardenDimensions } = useGarden();

  const [width, setWidth] = useState(garden.dimensions.width.toString());
  const [length, setLength] = useState(garden.dimensions.length.toString());

  const area = (parseFloat(width) || 0) * (parseFloat(length) || 0);
  const areaInM2 = area / 10000;

  // Debounced update or effect-based
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

  const handleDimensionChange = (dimension: 'width' | 'length', value: string) => {
    if (dimension === 'width') setWidth(value);
    else setLength(value);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-apple-text-primary mb-4 flex items-center gap-2">
        <span className="text-xl">📏</span> Dimensions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-apple-text-secondary uppercase tracking-wide mb-2 pl-1">
            Largeur
          </label>
          <div className="relative group">
            <input
              type="number"
              value={width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="apple-input w-full font-mono text-sm"
              placeholder="0"
            />
            <span className="absolute right-3 top-3 text-apple-text-tertiary text-xs font-medium">cm</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-apple-text-secondary uppercase tracking-wide mb-2 pl-1">
            Longueur
          </label>
          <div className="relative group">
            <input
              type="number"
              value={length}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className="apple-input w-full font-mono text-sm"
              placeholder="0"
            />
            <span className="absolute right-3 top-3 text-apple-text-tertiary text-xs font-medium">cm</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-black/5 flex justify-between items-end">
        <div>
          <span className="text-3xl font-bold text-apple-text-primary">{areaInM2.toFixed(1)}</span>
          <span className="text-sm text-apple-text-secondary ml-1">m²</span>
        </div>
        <div className="text-xs text-apple-green font-medium bg-apple-green/10 px-2 py-1 rounded-full">
          Surface totale
        </div>
      </div>
    </div>
  );
};
