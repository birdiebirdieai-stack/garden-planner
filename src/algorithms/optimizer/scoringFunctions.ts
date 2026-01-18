import { GardenLayout, CompanionMatrix, Vegetable } from '../../data/types';
import { calculateDistance, calculateArea } from '../../utils/geometryUtils';
import { findNeighbors, getEffectiveStrength } from '../../utils/companionChecker';

/**
 * Calculate companion planting score for a layout
 * Higher score = better companion relationships
 * @param layout - Garden layout to score
 * @param companionRules - Companion rules matrix
 * @returns Score between 0 and 1 (0 = worst, 1 = best)
 */
export function calculateCompanionScore(
  layout: GardenLayout,
  companionRules: CompanionMatrix
): number {
  let totalScore = 0;
  let pairCount = 0;

  // Find current row for each segment
  const segmentToRow = new Map();
  for (const row of layout.rows) {
    for (const segment of row.segments) {
      segmentToRow.set(segment.id, row);
    }
  }

  // Check all segment pairs
  for (const row of layout.rows) {
    for (const segment of row.segments) {
      const neighbors = findNeighbors(segment, layout);

      for (const { segment: neighbor, row: neighborRow } of neighbors) {
        // Avoid counting pairs twice
        if (segment.id >= neighbor.id) continue;

        const currentRow = segmentToRow.get(segment.id);
        if (!currentRow) continue;

        const distance = calculateDistance(segment, neighbor, currentRow, neighborRow);

        // Get effective strength considering distance
        const effectiveStrength = getEffectiveStrength(
          segment.vegetableId,
          neighbor.vegetableId,
          distance,
          companionRules
        );

        totalScore += effectiveStrength;
        pairCount++;
      }
    }
  }

  if (pairCount === 0) return 0.5; // Neutral score if no pairs

  // Normalize score from [-10, 10] range to [0, 1] range
  const averageScore = totalScore / pairCount;
  return (averageScore + 10) / 20;
}

/**
 * Calculate space utilization efficiency
 * @param layout - Garden layout
 * @param gardenDimensions - Garden dimensions
 * @returns Score between 0 and 1 (0 = empty, 1 = fully used)
 */
export function calculateUtilization(
  layout: GardenLayout,
  gardenDimensions: { width: number; length: number }
): number {
  const totalArea = calculateArea(gardenDimensions);
  let usedArea = 0;

  for (const row of layout.rows) {
    for (const segment of row.segments) {
      const segmentWidth = segment.xEnd - segment.xStart;
      const segmentArea = segmentWidth * row.height;
      usedArea += segmentArea;
    }
  }

  return Math.min(usedArea / totalArea, 1.0);
}

/**
 * Calculate diversity score
 * Encourages variety of vegetables
 * @param layout - Garden layout
 * @returns Score between 0 and 1 (0 = low diversity, 1 = high diversity)
 */
export function calculateDiversity(layout: GardenLayout): number {
  const vegetableTypes = new Set<string>();

  for (const row of layout.rows) {
    for (const segment of row.segments) {
      vegetableTypes.add(segment.vegetableId);
    }
  }

  const uniqueCount = vegetableTypes.size;

  // Diversity plateaus after 8-10 different vegetables
  // Using a logarithmic scale for diminishing returns
  return Math.min(Math.log(uniqueCount + 1) / Math.log(11), 1.0);
}

/**
 * Calculate spacing score
 * Penalizes violations of spacing requirements
 * @param layout - Garden layout
 * @param vegetables - Map of vegetable ID to vegetable data
 * @returns Score between 0 and 1 (0 = many violations, 1 = perfect spacing)
 */
export function calculateSpacingScore(
  layout: GardenLayout,
  vegetables: Map<string, Vegetable>
): number {
  let violations = 0;
  let totalChecks = 0;

  for (const row of layout.rows) {
    for (const segment of row.segments) {
      const vegetable = vegetables.get(segment.vegetableId);
      if (!vegetable) continue;

      totalChecks++;

      // Check row height vs required row spacing
      if (row.height < vegetable.spacing.rowSpacing * 0.9) {
        violations++;
      }

      // Check segment width vs plant count
      const segmentWidth = segment.xEnd - segment.xStart;
      const requiredWidth = segment.plantCount * vegetable.spacing.plantSpacing;

      if (segmentWidth < requiredWidth * 0.85) {
        violations++;
      }
    }
  }

  if (totalChecks === 0) return 1.0;

  // Convert violations to a score (fewer violations = higher score)
  const violationRate = violations / totalChecks;
  return Math.max(0, 1 - violationRate);
}

/**
 * Calculate overall layout score
 * Combines all scoring functions with weights
 * @param layout - Garden layout to score
 * @param context - Scoring context with all necessary data
 * @returns Overall score between 0 and 1
 */
export function scoreLayout(
  layout: GardenLayout,
  context: {
    companionRules: CompanionMatrix;
    gardenDimensions: { width: number; length: number };
    vegetables: Map<string, Vegetable>;
  }
): number {
  const companionScore = calculateCompanionScore(layout, context.companionRules);
  const utilization = calculateUtilization(layout, context.gardenDimensions);
  const diversity = calculateDiversity(layout);
  const spacing = calculateSpacingScore(layout, context.vegetables);

  // Weighted combination (as defined in plan)
  const score =
    companionScore * 0.4 +  // Companion relationships are most important
    utilization * 0.3 +      // Good space utilization
    diversity * 0.2 +        // Variety is nice
    spacing * 0.1;           // Spacing should be mostly correct from CSP

  // Update layout metrics
  layout.metrics = {
    companionScore,
    utilisationRate: utilization,
    diversityScore: diversity,
    spacingScore: spacing,
  };

  layout.score = score;

  return score;
}

/**
 * Calculate score delta (improvement) between two layouts
 * @param newLayout - New layout
 * @param oldLayout - Old layout
 * @returns Positive if new is better, negative if worse
 */
export function calculateScoreDelta(newLayout: GardenLayout, oldLayout: GardenLayout): number {
  return newLayout.score - oldLayout.score;
}

/**
 * Check if a layout passes minimum quality thresholds
 * @param layout - Garden layout
 * @param thresholds - Minimum acceptable values
 * @returns True if layout meets all thresholds
 */
export function meetsQualityThresholds(
  layout: GardenLayout,
  thresholds: {
    minUtilization?: number;
    minCompanionScore?: number;
    minSpacingScore?: number;
  } = {}
): boolean {
  const {
    minUtilization = 0.5,
    minCompanionScore = 0.4,
    minSpacingScore = 0.7,
  } = thresholds;

  return (
    layout.metrics.utilisationRate >= minUtilization &&
    layout.metrics.companionScore >= minCompanionScore &&
    layout.metrics.spacingScore >= minSpacingScore
  );
}
