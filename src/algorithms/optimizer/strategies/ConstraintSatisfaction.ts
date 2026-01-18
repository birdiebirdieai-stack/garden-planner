import { Garden, GardenLayout, Row, PlantSegment, Vegetable, SelectedVegetable } from '../../../data/types';
import { calculateRequiredWidth } from '../../../utils/spacingValidator';

/**
 * Constraint Satisfaction Problem solver for garden layout
 * Generates an initial feasible layout respecting all hard constraints
 */
export class ConstraintSatisfactionSolver {
  private garden: Garden;
  private vegetables: Map<string, Vegetable>;
  private selectedVegetables: SelectedVegetable[];

  constructor(
    garden: Garden,
    vegetables: Vegetable[],
    selectedVegetables: SelectedVegetable[]
  ) {
    this.garden = garden;
    this.vegetables = new Map(vegetables.map(v => [v.id, v]));
    this.selectedVegetables = selectedVegetables;
  }

  /**
   * Generate initial feasible layout
   * @returns GardenLayout or null if no solution exists
   */
  generateInitialLayout(): GardenLayout | null {
    console.log('CSP: Starting initial layout generation');
    // Sort vegetables by row spacing (tallest first)
    const sortedVegetables = this.getSortedVegetables();

    if (sortedVegetables.length === 0) {
      return null;
    }

    const rows: Row[] = [];
    let currentY = 0;

    // Try to place each vegetable type
    for (const { vegetableId, quantity } of sortedVegetables) {
      const vegetable = this.vegetables.get(vegetableId);
      if (!vegetable) continue;

      let remainingQuantity = quantity || 1;
      const rowHeight = vegetable.spacing.rowSpacing;

      while (remainingQuantity > 0) {
        // Check if there's space for a new row
        if (currentY + rowHeight > this.garden.dimensions.length) {
          // No more vertical space, try to fit remainder in existing rows
          // Note: tryPlaceInExistingRows currently places ONE block. We might need it to place as much as possible?
          // For now, let's assume it tries to place 'remainingQuantity'. 
          // We need to know how many it placed to decrement. 
          // Since the original method returns boolean, we might need to rely on a modified version or just accept that it places "some" and we prioritize new rows first.

          // Current logic limitation: tryPlaceInExistingRows is "all or nothing" for 'quantity' if we look at line 195: Math.min(quantity, maxPlants)
          // Actually line 195 says: const plantCount = Math.min(quantity, maxPlants);
          // So it places partial! But it returns boolean.
          // Let's modify tryPlaceInExistingRows separately to return number.
          // For this step, we'll assume we can't create new rows.

          // Attempt to place remaining in existing rows (best effort)
          // We loop because tryPlaceInExistingRows might find spot in Row 1, leaving some for Row 2.
          let placedSome = false;
          // We need a helper or loop here.
          // Simplified: Try once. The method finds ONE spot. 
          // If we want to fully pack, we should loop until it returns false.

          while (remainingQuantity > 0) {
            const placedCount = this.placeInExistingRows(rows, vegetableId, remainingQuantity);
            if (placedCount === 0) break; // No more spots
            remainingQuantity -= placedCount;
            placedSome = true;
          }

          if (!placedSome) {
            // Couldn't place any more
            break;
          }
          // If we broke because of no spots, we exit the outer while loop (garden full)
          if (remainingQuantity > 0) break;
          continue;
        }

        // Create new row
        const row: Row = {
          id: `row-${rows.length}`,
          yPosition: currentY,
          height: rowHeight,
          segments: [],
        };

        // Try to fill the row
        // We need to know how many fit.
        // Copy logic from fillRow but return count.
        const placedInNewRow = this.fillRowWithCount(row, vegetableId, remainingQuantity);

        if (placedInNewRow > 0) {
          console.log(`CSP: Successfully added row at Y=${currentY} for ${vegetableId} (cnt=${placedInNewRow})`);
          rows.push(row);
          currentY += rowHeight;
          remainingQuantity -= placedInNewRow;
        } else {
          console.warn(`CSP: Failed to fill new row for ${vegetableId}`);
          break; // Should not happen if dimensions are valid, prevent infinite loop
        }
      }
    }

    if (rows.length === 0) {
      return null; // No solution found
    }

    // Create layout
    const layout: GardenLayout = {
      rows,
      score: 0,
      metrics: {
        utilisationRate: 0,
        companionScore: 0,
        spacingScore: 0,
        diversityScore: 0,
      },
    };

    return layout;
  }

  /**
   * Sort vegetables by priority and row spacing
   */
  private getSortedVegetables(): SelectedVegetable[] {
    return [...this.selectedVegetables].sort((a, b) => {
      const vegA = this.vegetables.get(a.vegetableId);
      const vegB = this.vegetables.get(b.vegetableId);

      if (!vegA || !vegB) return 0;

      // First by priority (if specified)
      const priorityDiff = (b.priority || 5) - (a.priority || 5);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by row spacing (taller plants first)
      return vegB.spacing.rowSpacing - vegA.spacing.rowSpacing;
    });
  }

  /**
   * Fill a row with vegetables and return count placed
   */
  private fillRowWithCount(row: Row, vegetableId: string, desiredQuantity: number): number {
    const vegetable = this.vegetables.get(vegetableId);
    if (!vegetable) return 0;

    const availableWidth = this.garden.dimensions.width;
    const plantSpacing = vegetable.spacing.plantSpacing;
    const maxPlants = Math.floor(availableWidth / plantSpacing);

    if (maxPlants === 0) return 0;

    const plantCount = Math.min(desiredQuantity, maxPlants);
    const requiredWidth = calculateRequiredWidth(plantCount, vegetable);

    if (requiredWidth > availableWidth) return 0;

    const segment: PlantSegment = {
      id: `segment-${row.id}-${vegetableId}`,
      vegetableId,
      xStart: 0,
      xEnd: requiredWidth,
      plantCount,
      companions: [],
    };

    row.segments.push(segment);
    return plantCount;
  }

  /**
   * Try to place vegetables in existing rows and return count placed
   */
  private placeInExistingRows(
    rows: Row[],
    vegetableId: string,
    quantity: number
  ): number {
    const vegetable = this.vegetables.get(vegetableId);
    if (!vegetable) return 0;

    for (const row of rows) {
      if (row.height < vegetable.spacing.rowSpacing) continue;

      const usedWidth = row.segments.reduce((sum, seg) => sum + (seg.xEnd - seg.xStart), 0);
      const availableWidth = this.garden.dimensions.width - usedWidth;
      const plantSpacing = vegetable.spacing.plantSpacing;
      const maxPlants = Math.floor(availableWidth / plantSpacing);

      if (maxPlants === 0) continue;

      const plantCount = Math.min(quantity, maxPlants);
      const requiredWidth = calculateRequiredWidth(plantCount, vegetable);

      if (requiredWidth > availableWidth) continue;

      const lastSegment = row.segments[row.segments.length - 1];
      const xStart = lastSegment ? lastSegment.xEnd : 0;

      const segment: PlantSegment = {
        id: `segment-${row.id}-${vegetableId}-${row.segments.length}`,
        vegetableId,
        xStart,
        xEnd: xStart + requiredWidth,
        plantCount,
        companions: [],
      };

      row.segments.push(segment);
      return plantCount;
    }

    return 0;
  }

  // Legacy boolean methods for compatibility if needed, or remove them
  private fillRow(row: Row, vegetableId: string, desiredQuantity?: number): boolean {
    return this.fillRowWithCount(row, vegetableId, desiredQuantity || 9999) > 0;
  }

  private tryPlaceInExistingRows(rows: Row[], vegetableId: string, quantity: number): boolean {
    return this.placeInExistingRows(rows, vegetableId, quantity) > 0;
  }

  /**
   * Validate a layout against all constraints
   * @param layout - Layout to validate
   * @returns True if valid
   */
  validateLayout(layout: GardenLayout): boolean {
    // Check all rows are within boundaries
    for (const row of layout.rows) {
      if (row.yPosition < 0 || row.yPosition + row.height > this.garden.dimensions.length) {
        return false;
      }

      // Check all segments in row
      for (const segment of row.segments) {
        if (segment.xStart < 0 || segment.xEnd > this.garden.dimensions.width) {
          return false;
        }

        // Check no overlap with other segments in same row
        for (const otherSegment of row.segments) {
          if (segment.id === otherSegment.id) continue;

          if (segment.xStart < otherSegment.xEnd && segment.xEnd > otherSegment.xStart) {
            return false; // Overlap detected
          }
        }
      }
    }

    return true;
  }

  /**
   * Get total plants placed in layout
   * @param layout - Garden layout
   * @returns Total number of plants
   */
  getTotalPlants(layout: GardenLayout): number {
    let total = 0;

    for (const row of layout.rows) {
      for (const segment of row.segments) {
        total += segment.plantCount;
      }
    }

    return total;
  }

  /**
   * Get vegetables that couldn't be placed
   * @param layout - Generated layout
   * @returns Array of vegetable IDs that weren't placed
   */
  getUnplacedVegetables(layout: GardenLayout): string[] {
    const placedVegetables = new Set<string>();

    for (const row of layout.rows) {
      for (const segment of row.segments) {
        placedVegetables.add(segment.vegetableId);
      }
    }

    return this.selectedVegetables
      .map(sv => sv.vegetableId)
      .filter(id => !placedVegetables.has(id));
  }
}
