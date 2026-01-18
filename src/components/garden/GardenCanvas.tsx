import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useGardenState } from '../../hooks/useGardenState';
import { PlantSegment, Row } from '../../data/types';

interface HoveredSegment {
  segment: PlantSegment;
  row: Row;
  x: number;
  y: number;
}

export const GardenCanvas: React.FC = () => {
  const { garden, layout, availableVegetables, setSelectedPlantId, selectedPlantId } = useGardenState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredSegment, setHoveredSegment] = useState<HoveredSegment | null>(null);

  // Responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate scale to fit garden in canvas
  const scale = Math.min(
    (dimensions.width - 40) / garden.dimensions.width,
    (dimensions.height - 40) / garden.dimensions.length
  );

  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const offsetX = (dimensions.width - garden.dimensions.width * safeScale) / 2;
  const offsetY = (dimensions.height - garden.dimensions.length * safeScale) / 2;

  // Get vegetable by ID
  const getVegetable = (id: string) =>
    availableVegetables.find(v => v.id === id);

  return (
    <div ref={containerRef} className="w-full h-full relative apple-canvas-bg" data-testid="garden-canvas">
      {!layout ? (
        // Empty state
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-10 rounded-3xl bg-white shadow-apple-card border border-black/5 max-w-md">
            <div className="w-20 h-20 bg-apple-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="h-10 w-10 text-apple-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-apple-text-primary mb-3">
              Votre potager
            </h3>
            <p className="text-apple-text-secondary leading-relaxed">
              Configurez les dimensions et sélectionnez vos plantes,<br />
              puis cliquez sur <span className="text-apple-green font-bold">"Optimiser"</span> pour générer le plan.
            </p>
          </div>
        </div>
      ) : dimensions.width > 0 && dimensions.height > 0 ? (
        // Garden visualization
        <>
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onClick={(e) => {
              // Deselect if clicking on empty space
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) setSelectedPlantId(null);
            }}
          >
            <Layer>
              {/* Garden background (Soil) */}
              <Rect
                x={offsetX}
                y={offsetY}
                width={garden.dimensions.width * safeScale}
                height={garden.dimensions.length * safeScale}
                fill="#e6ded9" // Lighter soil color
                stroke="#d7ccc8"
                strokeWidth={2}
                cornerRadius={12}
                shadowColor="black"
                shadowBlur={30}
                shadowOpacity={0.05}
              />

              {/* Grid lines (subtle) */}
              {Array.from({ length: Math.ceil(garden.dimensions.width / 50) }).map((_, i) => (
                <Rect
                  key={`grid-v-${i}`}
                  x={offsetX + i * 50 * scale}
                  y={offsetY}
                  width={1}
                  height={garden.dimensions.length * scale}
                  fill="rgba(0,0,0,0.03)"
                />
              ))}

              {/* Render rows and segments */}
              {layout.rows.map((row) => (
                <Group key={row.id}>
                  {row.segments.map((segment) => {
                    const vegetable = getVegetable(segment.vegetableId);
                    if (!vegetable) return null;

                    const x = offsetX + segment.xStart * safeScale;
                    const y = offsetY + row.yPosition * safeScale;
                    const width = (segment.xEnd - segment.xStart) * safeScale;
                    const height = row.height * safeScale;

                    const isSelected = selectedPlantId === segment.id;

                    return (
                      <Group
                        key={segment.id}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          setSelectedPlantId(segment.id);
                        }}
                        onMouseEnter={(e) => {
                          const stage = e.target.getStage();
                          if (stage) {
                            stage.container().style.cursor = 'pointer';
                          }
                          setHoveredSegment({
                            segment,
                            row,
                            x: e.evt.clientX,
                            y: e.evt.clientY,
                          });
                        }}
                        onMouseLeave={(e) => {
                          const stage = e.target.getStage();
                          if (stage) {
                            stage.container().style.cursor = 'default';
                          }
                          setHoveredSegment(null);
                        }}
                      >
                        {/* Segment background */}
                        <Rect
                          x={x + 2} // Gap
                          y={y + 2}
                          width={width - 4}
                          height={height - 4}
                          fill={vegetable.visualProperties.color}
                          opacity={isSelected ? 1 : 0.9}
                          cornerRadius={8}
                          stroke={isSelected ? '#34c759' : 'transparent'}
                          strokeWidth={isSelected ? 3 : 0}
                          shadowColor="black"
                          shadowBlur={isSelected ? 10 : 2}
                          shadowOpacity={isSelected ? 0.2 : 0.1}
                        />

                        {/* Vegetable name */}
                        <Text
                          x={x}
                          y={y + height / 2 - 8}
                          width={width}
                          text={vegetable.name}
                          fontSize={Math.max(11, Math.min(14, width / 10))}
                          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                          fontStyle="bold"
                          fill="white"
                          align="center"
                        />

                        {/* Plant count */}
                        {height > 30 && (
                          <Text
                            x={x}
                            y={y + height / 2 + 8}
                            width={width}
                            text={`${segment.plantCount}`}
                            fontSize={Math.max(9, Math.min(11, width / 12))}
                            fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                            fill="rgba(255,255,255,0.9)"
                            align="center"
                          />
                        )}
                      </Group>
                    );
                  })}
                </Group>
              ))}
            </Layer>
          </Stage>

          {/* Simple Hover Tooltip (Light Theme) */}
          {hoveredSegment && !selectedPlantId && (
            <div
              className="absolute bg-white/90 backdrop-blur-md text-apple-text-primary px-4 py-3 rounded-xl text-sm pointer-events-none transform -translate-y-full -translate-x-1/2 mt-[-15px] shadow-apple-hover border border-white/20"
              style={{
                left: hoveredSegment.x,
                top: hoveredSegment.y,
              }}
            >
              <p className="font-bold flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: getVegetable(hoveredSegment.segment.vegetableId)?.visualProperties.color }}
                ></span>
                {getVegetable(hoveredSegment.segment.vegetableId)?.name}
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
