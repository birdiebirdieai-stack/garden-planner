import { PlantSegment, Row } from '../data/types';

/**
 * Calculate the Euclidean distance between two plant segments
 * @param segment1 - First plant segment
 * @param segment2 - Second plant segment
 * @returns Distance in centimeters
 */
export function calculateDistance(segment1: PlantSegment, segment2: PlantSegment, row1: Row, row2: Row): number {
  // Calculate center points of each segment
  const x1 = (segment1.xStart + segment1.xEnd) / 2;
  const y1 = row1.yPosition + row1.height / 2;

  const x2 = (segment2.xStart + segment2.xEnd) / 2;
  const y2 = row2.yPosition + row2.height / 2;

  // Euclidean distance
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate the area of a rectangular garden
 * @param dimensions - Garden dimensions {width, length}
 * @returns Area in square centimeters
 */
export function calculateArea(dimensions: { width: number; length: number }): number {
  return dimensions.width * dimensions.length;
}

/**
 * Check if two plant segments overlap
 * @param segment1 - First plant segment
 * @param segment2 - Second plant segment
 * @param row1 - Row containing first segment
 * @param row2 - Row containing second segment
 * @returns True if segments overlap
 */
export function checkOverlap(
  segment1: PlantSegment,
  segment2: PlantSegment,
  row1: Row,
  row2: Row
): boolean {
  // Check vertical overlap (rows)
  const row1Bottom = row1.yPosition + row1.height;
  const row2Bottom = row2.yPosition + row2.height;

  const verticalOverlap = !(row1Bottom <= row2.yPosition || row2Bottom <= row1.yPosition);

  // Check horizontal overlap (segments)
  const horizontalOverlap = !(segment1.xEnd <= segment2.xStart || segment2.xEnd <= segment1.xStart);

  return verticalOverlap && horizontalOverlap;
}

/**
 * Calculate the direction from segment1 to segment2
 * @param segment1 - First plant segment
 * @param segment2 - Second plant segment
 * @param row1 - Row containing first segment
 * @param row2 - Row containing second segment
 * @returns Direction ('north', 'south', 'east', 'west')
 */
export function calculateDirection(
  segment1: PlantSegment,
  segment2: PlantSegment,
  row1: Row,
  row2: Row
): 'north' | 'south' | 'east' | 'west' {
  const x1 = (segment1.xStart + segment1.xEnd) / 2;
  const y1 = row1.yPosition + row1.height / 2;

  const x2 = (segment2.xStart + segment2.xEnd) / 2;
  const y2 = row2.yPosition + row2.height / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // Determine primary direction based on larger component
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'east' : 'west';
  } else {
    return dy > 0 ? 'south' : 'north';
  }
}

/**
 * Calculate the minimum distance between a segment and the garden boundary
 * @param segment - Plant segment
 * @param row - Row containing the segment
 * @param gardenDimensions - Garden dimensions
 * @returns Minimum distance to boundary in centimeters
 */
export function distanceToBoundary(
  segment: PlantSegment,
  row: Row,
  gardenDimensions: { width: number; length: number }
): number {
  const distanceLeft = segment.xStart;
  const distanceRight = gardenDimensions.width - segment.xEnd;
  const distanceTop = row.yPosition;
  const distanceBottom = gardenDimensions.length - (row.yPosition + row.height);

  return Math.min(distanceLeft, distanceRight, distanceTop, distanceBottom);
}

/**
 * Check if a segment is within garden boundaries
 * @param segment - Plant segment
 * @param row - Row containing the segment
 * @param gardenDimensions - Garden dimensions
 * @returns True if segment is within boundaries
 */
export function isWithinBoundaries(
  segment: PlantSegment,
  row: Row,
  gardenDimensions: { width: number; length: number }
): boolean {
  return (
    segment.xStart >= 0 &&
    segment.xEnd <= gardenDimensions.width &&
    row.yPosition >= 0 &&
    row.yPosition + row.height <= gardenDimensions.length
  );
}
