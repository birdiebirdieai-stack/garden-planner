export type CompanionRelationship =
  | 'beneficial'      // +10 to +6
  | 'helpful'         // +5 to +1
  | 'neutral'         // 0
  | 'avoid'           // -1 to -5
  | 'antagonistic';   // -6 to -10

export interface CompanionRule {
  id: string;
  vegetable1Id: string;
  vegetable2Id: string;
  relationship: CompanionRelationship;
  strength: number;         // -10 (very bad) to +10 (very good)
  reason: string;           // For tooltip display
  scientificBasis?: string;
  distance?: {
    minDistance?: number;   // Minimum distance in cm (for bad companions)
    maxDistance?: number;   // Maximum distance in cm (for good companions)
  };
}

export interface CompanionMatrix {
  [vegetableId: string]: {
    [otherVegetableId: string]: CompanionRule;
  };
}
