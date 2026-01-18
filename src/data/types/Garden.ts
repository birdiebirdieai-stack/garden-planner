import { CompanionRelationship } from './CompanionRule';

export interface Garden {
  id: string;
  dimensions: {
    width: number;          // cm
    length: number;         // cm
  };
  selectedVegetables: SelectedVegetable[];
  layout?: GardenLayout;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    name?: string;
  };
}

export interface SelectedVegetable {
  vegetableId: string;
  quantity?: number;        // Optional: desired quantity
  priority?: number;        // 1-10: how important to include
}

export interface GardenLayout {
  rows: Row[];
  score: number;            // Overall optimization score
  metrics: {
    utilisationRate: number;  // % of garden used
    companionScore: number;
    spacingScore: number;
    diversityScore: number;
  };
}

export interface Row {
  id: string;
  yPosition: number;        // Position from top in cm
  height: number;           // Row height in cm
  segments: PlantSegment[];
}

export interface PlantSegment {
  id: string;
  vegetableId: string;
  xStart: number;           // Start position in cm
  xEnd: number;             // End position in cm
  plantCount: number;
  companions: CompanionInfo[];  // For tooltip
}

export interface CompanionInfo {
  vegetableId: string;
  relationship: CompanionRelationship;
  direction: 'north' | 'south' | 'east' | 'west';
  reason: string;
}
