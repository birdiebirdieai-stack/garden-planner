import { CompanionRule, CompanionMatrix, CompanionRelationship, PlantSegment, Row, GardenLayout } from '../data/types';
import { calculateDistance, calculateDirection as calcDir } from './geometryUtils';

export { calcDir as calculateDirection };

/**
 * Get companion rule between two vegetables
 * @param veg1Id - First vegetable ID
 * @param veg2Id - Second vegetable ID
 * @param rules - Companion rules matrix
 * @returns Companion rule or null if not found
 */
export function getCompanionRule(
  veg1Id: string,
  veg2Id: string,
  rules: CompanionMatrix
): CompanionRule | null {
  // Check both directions since rules may be defined either way
  const rule = rules[veg1Id]?.[veg2Id] || rules[veg2Id]?.[veg1Id];
  return rule || null;
}

/**
 * Calculate proximity factor based on distance and rule
 * Closer proximity = stronger effect (positive or negative)
 * @param distance - Distance between plants in cm
 * @param rule - Companion rule
 * @returns Proximity factor between 0 and 1
 */
export function calculateProximityFactor(distance: number, rule: CompanionRule): number {
  // Define effective range based on relationship
  const effectiveRange = rule.distance?.maxDistance || 100; // Default 100cm effective range

  if (distance > effectiveRange) {
    return 0; // No effect beyond range
  }

  // Linear decrease: full effect at 0cm, no effect at effectiveRange
  const factor = 1 - distance / effectiveRange;

  return Math.max(0, Math.min(1, factor));
}

/**
 * Find all neighboring segments for a given segment
 * @param segment - Plant segment to find neighbors for
 * @param layout - Garden layout
 * @returns Array of tuples [neighbor segment, neighbor row]
 */
export function findNeighbors(
  segment: PlantSegment,
  layout: GardenLayout
): Array<{ segment: PlantSegment; row: Row }> {
  const neighbors: Array<{ segment: PlantSegment; row: Row }> = [];

  // Find the row containing our segment
  const currentRow = layout.rows.find(row =>
    row.segments.some(s => s.id === segment.id)
  );

  if (!currentRow) return neighbors;

  const currentRowIndex = layout.rows.indexOf(currentRow);

  // Check segments in current row
  for (const otherSegment of currentRow.segments) {
    if (otherSegment.id !== segment.id) {
      neighbors.push({ segment: otherSegment, row: currentRow });
    }
  }

  // Check segments in previous row
  if (currentRowIndex > 0) {
    const prevRow = layout.rows[currentRowIndex - 1];
    for (const otherSegment of prevRow.segments) {
      neighbors.push({ segment: otherSegment, row: prevRow });
    }
  }

  // Check segments in next row
  if (currentRowIndex < layout.rows.length - 1) {
    const nextRow = layout.rows[currentRowIndex + 1];
    for (const otherSegment of nextRow.segments) {
      neighbors.push({ segment: otherSegment, row: nextRow });
    }
  }

  return neighbors;
}

/**
 * Check if two vegetables are companions (beneficial or helpful)
 * @param veg1Id - First vegetable ID
 * @param veg2Id - Second vegetable ID
 * @param rules - Companion rules matrix
 * @returns True if they are companions
 */
export function areCompanions(
  veg1Id: string,
  veg2Id: string,
  rules: CompanionMatrix
): boolean {
  const rule = getCompanionRule(veg1Id, veg2Id, rules);
  if (!rule) return false;

  return rule.relationship === 'beneficial' || rule.relationship === 'helpful';
}

/**
 * Check if two vegetables are antagonistic
 * @param veg1Id - First vegetable ID
 * @param veg2Id - Second vegetable ID
 * @param rules - Companion rules matrix
 * @returns True if they are antagonistic
 */
export function areAntagonistic(
  veg1Id: string,
  veg2Id: string,
  rules: CompanionMatrix
): boolean {
  const rule = getCompanionRule(veg1Id, veg2Id, rules);
  if (!rule) return false;

  return rule.relationship === 'antagonistic' || rule.relationship === 'avoid';
}

/**
 * Get companion strength between two vegetables at a given distance
 * @param veg1Id - First vegetable ID
 * @param veg2Id - Second vegetable ID
 * @param distance - Distance between vegetables in cm
 * @param rules - Companion rules matrix
 * @returns Effective strength considering distance (-10 to +10), or 0 if no rule
 */
export function getEffectiveStrength(
  veg1Id: string,
  veg2Id: string,
  distance: number,
  rules: CompanionMatrix
): number {
  const rule = getCompanionRule(veg1Id, veg2Id, rules);
  if (!rule) return 0;

  const proximityFactor = calculateProximityFactor(distance, rule);
  return rule.strength * proximityFactor;
}

/**
 * Check if minimum distance requirement is met for antagonistic pairs
 * @param segment1 - First segment
 * @param segment2 - Second segment
 * @param row1 - Row containing first segment
 * @param row2 - Row containing second segment
 * @param rule - Companion rule
 * @returns True if minimum distance is respected
 */
export function validateMinimumDistance(
  segment1: PlantSegment,
  segment2: PlantSegment,
  row1: Row,
  row2: Row,
  rule: CompanionRule
): boolean {
  if (!rule.distance?.minDistance) {
    return true; // No minimum distance requirement
  }

  const distance = calculateDistance(segment1, segment2, row1, row2);
  return distance >= rule.distance.minDistance;
}

/**
 * Build companion matrix from rules array
 * @param rules - Array of companion rules
 * @returns Companion matrix for quick lookup
 */
export function buildCompanionMatrix(rules: CompanionRule[]): CompanionMatrix {
  const matrix: CompanionMatrix = {};

  for (const rule of rules) {
    if (!matrix[rule.vegetable1Id]) {
      matrix[rule.vegetable1Id] = {};
    }
    if (!matrix[rule.vegetable2Id]) {
      matrix[rule.vegetable2Id] = {};
    }

    // Store rule in both directions for easy lookup
    matrix[rule.vegetable1Id][rule.vegetable2Id] = rule;
    matrix[rule.vegetable2Id][rule.vegetable1Id] = rule;
  }

  return matrix;
}

/**
 * Get relationship type as a numeric value for sorting/comparison
 * @param relationship - Companion relationship type
 * @returns Numeric value (higher = better)
 */
export function getRelationshipValue(relationship: CompanionRelationship): number {
  const values: Record<CompanionRelationship, number> = {
    'beneficial': 10,
    'helpful': 5,
    'neutral': 0,
    'avoid': -5,
    'antagonistic': -10
  };

  return values[relationship];
}
