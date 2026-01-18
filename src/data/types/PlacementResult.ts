import { GardenLayout } from './Garden';

export type WarningType = 'spacing_violation' | 'bad_companion' | 'insufficient_space' | 'low_utilisation';
export type WarningSeverity = 'low' | 'medium' | 'high';

export interface PlacementResult {
  success: boolean;
  layout?: GardenLayout;
  warnings: PlacementWarning[];
  computationTime: number;  // ms
  iterations?: number;
}

export interface PlacementWarning {
  type: WarningType;
  severity: WarningSeverity;
  message: string;
  affectedVegetables: string[];
}
