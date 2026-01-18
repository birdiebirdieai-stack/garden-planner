export type VegetableCategory =
  | 'leafy-greens'
  | 'root-vegetables'
  | 'fruiting-vegetables'
  | 'legumes'
  | 'alliums'
  | 'brassicas'
  | 'cucurbits';

export type NutrientLevel = 'low' | 'medium' | 'high';
export type GrowthRate = 'fast' | 'medium' | 'slow';

export interface Vegetable {
  id: string;
  name: string;
  scientificName?: string;
  category: VegetableCategory;
  spacing: {
    rowSpacing: number;      // cm between rows
    plantSpacing: number;    // cm between plants in same row
    minSpacing?: number;     // minimum spacing if flexible
  };
  growthCharacteristics: {
    height: number;          // cm
    width: number;           // cm spread
    depth: number;           // root depth in cm
    growthRate: GrowthRate;
  };
  season: {
    plantingMonths: number[];  // 1-12
    harvestMonths: number[];
    daysToMaturity: number;
  };
  nutritionalNeeds: {
    nitrogen: NutrientLevel;
    phosphorus: NutrientLevel;
    potassium: NutrientLevel;
  };
  visualProperties: {
    color: string;           // For rendering
    iconUrl?: string;
    textureUrl?: string;
  };
}
