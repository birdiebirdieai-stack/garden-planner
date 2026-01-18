import { PlantSegment, Row, Vegetable } from '../data/types';
import { calculateDistance } from './geometryUtils';

/**
 * Validate spacing for a plant segment
 * @param segment - Plant segment to validate
 * @param row - Row containing the segment
 * @param vegetable - Vegetable data
 * @returns True if spacing is valid
 */
export function validateSpacing(
  segment: PlantSegment,
  row: Row,
  vegetable: Vegetable
): boolean {
  const segmentWidth = segment.xEnd - segment.xStart;
  const expectedWidth = segment.plantCount * vegetable.spacing.plantSpacing;

  // Check if segment width is appropriate for plant count
  if (segmentWidth < expectedWidth * 0.9) {
    return false; // Too cramped
  }

  // Check row height matches vegetable's row spacing requirement
  if (row.height < vegetable.spacing.rowSpacing) {
    return false; // Row too narrow
  }

  return true;
}

/**
 * Get minimum spacing required between two vegetables
 * @param vegetable1 - First vegetable
 * @param vegetable2 - Second vegetable
 * @returns Minimum spacing in centimeters
 */
export function getMinimumSpacing(vegetable1: Vegetable, vegetable2: Vegetable): number {
  // Use the larger of the two spacing requirements
  const spacing1 = Math.max(vegetable1.spacing.rowSpacing, vegetable1.spacing.plantSpacing);
  const spacing2 = Math.max(vegetable2.spacing.rowSpacing, vegetable2.spacing.plantSpacing);

  return Math.max(spacing1, spacing2) / 2;
}

/**
 * Validate spacing between two adjacent segments in the same row
 * @param segment1 - First segment
 * @param segment2 - Second segment (must be in same row)
 * @param vegetable1 - First vegetable data
 * @param vegetable2 - Second vegetable data
 * @returns True if spacing is adequate
 */
export function validateAdjacentSpacing(
  segment1: PlantSegment,
  segment2: PlantSegment,
  vegetable1: Vegetable,
  vegetable2: Vegetable
): boolean {
  const gap = Math.abs(segment2.xStart - segment1.xEnd);
  const minSpacing = getMinimumSpacing(vegetable1, vegetable2);

  return gap >= minSpacing * 0.8; // Allow 20% tolerance
}

/**
 * Validate spacing between segments in different rows
 * @param segment1 - First segment
 * @param segment2 - Second segment
 * @param row1 - Row containing first segment
 * @param row2 - Row containing second segment
 * @param vegetable1 - First vegetable data
 * @param vegetable2 - Second vegetable data
 * @returns True if spacing is adequate
 */
export function validateRowSpacing(
  segment1: PlantSegment,
  segment2: PlantSegment,
  row1: Row,
  row2: Row,
  vegetable1: Vegetable,
  vegetable2: Vegetable
): boolean {
  const distance = calculateDistance(segment1, segment2, row1, row2);
  const minSpacing = getMinimumSpacing(vegetable1, vegetable2);

  return distance >= minSpacing * 0.7; // Allow 30% tolerance for row spacing
}

/**
 * Calculate how many plants can fit in a given width
 * @param width - Available width in centimeters
 * @param vegetable - Vegetable data
 * @returns Maximum number of plants
 */
export function calculatePlantCapacity(width: number, vegetable: Vegetable): number {
  if (width < vegetable.spacing.plantSpacing) {
    return 0;
  }

  // Account for spacing: first plant needs half spacing, then full spacing between plants
  const firstPlantSpace = vegetable.spacing.plantSpacing / 2;
  const remainingWidth = width - firstPlantSpace;

  return Math.floor(remainingWidth / vegetable.spacing.plantSpacing) + 1;
}

/**
 * Calculate required width for a given number of plants
 * @param plantCount - Number of plants
 * @param vegetable - Vegetable data
 * @returns Required width in centimeters
 */
export function calculateRequiredWidth(plantCount: number, vegetable: Vegetable): number {
  if (plantCount === 0) return 0;
  if (plantCount === 1) return vegetable.spacing.plantSpacing;

  // First and last plant need half spacing from edge
  return plantCount * vegetable.spacing.plantSpacing;
}

/**
 * Validate that a segment has enough space for its plant count
 * @param segment - Plant segment
 * @param vegetable - Vegetable data
 * @returns True if segment has adequate space
 */
export function validateSegmentCapacity(segment: PlantSegment, vegetable: Vegetable): boolean {
  const segmentWidth = segment.xEnd - segment.xStart;
  const requiredWidth = calculateRequiredWidth(segment.plantCount, vegetable);

  return segmentWidth >= requiredWidth * 0.9; // Allow 10% tolerance
}
