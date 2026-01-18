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

  const scale = Math.min(
    (dimensions.width - 80) / garden.dimensions.width,
    (dimensions.height - 80) / garden.dimensions.length
  );

  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const offsetX = (dimensions.width - garden.dimensions.width * safeScale) / 2;
  const offsetY = (dimensions.height - garden.dimensions.length * safeScale) / 2;

  const getVegetable = (id: string) =>
    availableVegetables.find(v => v.id === id);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gradient-to-br from-slate-50 to-slate-100" data-testid="garden-canvas">
      {!layout ? (
        // Empty state
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-500/10">
              <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Votre Potager
            </h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Configurez les dimensions de votre jardin, sélectionnez vos plantes favorites,
              puis cliquez sur <span className="text-primary-600 font-semibold">"Optimiser"</span> pour
              générer un plan optimisé.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">1</span>
                </div>
                <span>Dimensions</span>
              </div>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">2</span>
                </div>
                <span>Plantes</span>
              </div>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg text-primary-600">3</span>
                </div>
                <span className="text-primary-600 font-medium">Optimiser</span>
              </div>
            </div>
          </div>
        </div>
      ) : dimensions.width > 0 && dimensions.height > 0 ? (
        // Garden visualization
        <>
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onClick={(e) => {
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
                fill="#f5f0e8"
                stroke="#e8dfd2"
                strokeWidth={3}
                cornerRadius={16}
                shadowColor="black"
                shadowBlur={40}
                shadowOpacity={0.08}
                shadowOffsetY={4}
              />

              {/* Subtle grid pattern */}
              {Array.from({ length: Math.ceil(garden.dimensions.width / 50) + 1 }).map((_, i) => (
                <Rect
                  key={`grid-v-${i}`}
                  x={offsetX + i * 50 * safeScale}
                  y={offsetY}
                  width={1}
                  height={garden.dimensions.length * safeScale}
                  fill="rgba(0,0,0,0.04)"
                />
              ))}
              {Array.from({ length: Math.ceil(garden.dimensions.length / 50) + 1 }).map((_, i) => (
                <Rect
                  key={`grid-h-${i}`}
                  x={offsetX}
                  y={offsetY + i * 50 * safeScale}
                  width={garden.dimensions.width * safeScale}
                  height={1}
                  fill="rgba(0,0,0,0.04)"
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
                    const isHovered = hoveredSegment?.segment.id === segment.id;

                    return (
                      <Group
                        key={segment.id}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          setSelectedPlantId(segment.id);
                        }}
                        onMouseEnter={(e) => {
                          const stage = e.target.getStage();
                          if (stage) stage.container().style.cursor = 'pointer';
                          setHoveredSegment({
                            segment,
                            row,
                            x: e.evt.clientX,
                            y: e.evt.clientY,
                          });
                        }}
                        onMouseLeave={(e) => {
                          const stage = e.target.getStage();
                          if (stage) stage.container().style.cursor = 'default';
                          setHoveredSegment(null);
                        }}
                      >
                        {/* Segment background */}
                        <Rect
                          x={x + 3}
                          y={y + 3}
                          width={width - 6}
                          height={height - 6}
                          fill={vegetable.visualProperties.color}
                          opacity={isSelected || isHovered ? 1 : 0.85}
                          cornerRadius={12}
                          stroke={isSelected ? '#22c55e' : isHovered ? 'rgba(255,255,255,0.5)' : 'transparent'}
                          strokeWidth={isSelected ? 4 : isHovered ? 2 : 0}
                          shadowColor={vegetable.visualProperties.color}
                          shadowBlur={isSelected ? 20 : isHovered ? 15 : 8}
                          shadowOpacity={isSelected ? 0.4 : isHovered ? 0.3 : 0.2}
                        />

                        {/* Vegetable name */}
                        <Text
                          x={x}
                          y={y + height / 2 - 10}
                          width={width}
                          text={vegetable.name}
                          fontSize={Math.max(12, Math.min(15, width / 8))}
                          fontFamily="Inter, -apple-system, sans-serif"
                          fontStyle="bold"
                          fill="white"
                          align="center"
                          shadowColor="rgba(0,0,0,0.3)"
                          shadowBlur={2}
                          shadowOffsetY={1}
                        />

                        {/* Plant count */}
                        {height > 40 && (
                          <Text
                            x={x}
                            y={y + height / 2 + 8}
                            width={width}
                            text={`${segment.plantCount} plants`}
                            fontSize={Math.max(10, Math.min(12, width / 10))}
                            fontFamily="Inter, -apple-system, sans-serif"
                            fill="rgba(255,255,255,0.85)"
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

          {/* Hover Tooltip */}
          {hoveredSegment && !selectedPlantId && (
            <div
              className="tooltip animate-fade-in"
              style={{
                left: hoveredSegment.x + 15,
                top: hoveredSegment.y - 10,
                transform: 'translateY(-100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: getVegetable(hoveredSegment.segment.vegetableId)?.visualProperties.color }}
                >
                  {getVegetable(hoveredSegment.segment.vegetableId)?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {getVegetable(hoveredSegment.segment.vegetableId)?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {hoveredSegment.segment.plantCount} plants
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Cliquez sur une zone pour voir les détails
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
};
