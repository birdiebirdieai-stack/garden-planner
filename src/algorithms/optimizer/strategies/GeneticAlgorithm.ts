import { GardenLayout, Row, PlantSegment, CompanionMatrix, Vegetable } from '../../../data/types';
import { scoreLayout } from '../scoringFunctions';

interface ScoringContext {
  companionRules: CompanionMatrix;
  gardenDimensions: { width: number; length: number };
  vegetables: Map<string, Vegetable>;
}

/**
 * Genetic Algorithm for optimizing garden layout
 * Evolves population of layouts to maximize companion planting score
 */
export class GeneticAlgorithm {
  private populationSize = 100;
  private generations = 50;
  private mutationRate = 0.15;
  private crossoverRate = 0.7;
  private eliteCount = 10;
  private tournamentSize = 5;

  private context: ScoringContext;

  constructor(context: ScoringContext) {
    this.context = context;
  }

  /**
   * Evolve initial layout to optimize companion planting
   * @param initialLayout - Initial feasible layout from CSP
   * @returns Optimized layout
   */
  async evolve(initialLayout: GardenLayout): Promise<GardenLayout> {
    // Initialize population with variations of initial layout
    let population = this.initializePopulation(initialLayout);

    // Evolution loop
    for (let gen = 0; gen < this.generations; gen++) {
      // Evaluate fitness for all individuals
      const scored = population.map(layout => ({
        layout: this.cloneLayout(layout),
        fitness: scoreLayout(layout, this.context),
      }));

      // Sort by fitness (descending)
      scored.sort((a, b) => b.fitness - a.fitness);

      // Elitism: preserve top performers
      const nextGeneration: GardenLayout[] = scored
        .slice(0, this.eliteCount)
        .map(s => this.cloneLayout(s.layout));

      // Generate offspring to fill rest of population
      while (nextGeneration.length < this.populationSize) {
        // Select parents
        const parent1 = this.tournamentSelection(scored);
        const parent2 = this.tournamentSelection(scored);

        let offspring: GardenLayout;

        // Crossover
        if (Math.random() < this.crossoverRate) {
          offspring = this.crossover(parent1, parent2);
        } else {
          offspring = this.cloneLayout(parent1);
        }

        // Mutation
        offspring = this.mutate(offspring);

        nextGeneration.push(offspring);
      }

      population = nextGeneration;
    }

    // Return best solution
    const final = population.map(layout => ({
      layout,
      fitness: scoreLayout(layout, this.context),
    }));

    final.sort((a, b) => b.fitness - a.fitness);

    return final[0].layout;
  }

  /**
   * Initialize population with variations of initial layout
   * @param initialLayout - Base layout
   * @returns Population of layouts
   */
  private initializePopulation(initialLayout: GardenLayout): GardenLayout[] {
    const population: GardenLayout[] = [];

    // Add original
    population.push(this.cloneLayout(initialLayout));

    // Generate variations
    while (population.length < this.populationSize) {
      const variant = this.cloneLayout(initialLayout);

      // Apply random mutations to create diversity
      const mutationCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < mutationCount; i++) {
        this.mutate(variant);
      }

      population.push(variant);
    }

    return population;
  }

  /**
   * Tournament selection: pick best from random subset
   * @param scored - Population with fitness scores
   * @returns Selected layout
   */
  private tournamentSelection(
    scored: Array<{ layout: GardenLayout; fitness: number }>
  ): GardenLayout {
    const tournament: Array<{ layout: GardenLayout; fitness: number }> = [];

    // Randomly select individuals for tournament
    for (let i = 0; i < this.tournamentSize; i++) {
      const index = Math.floor(Math.random() * scored.length);
      tournament.push(scored[index]);
    }

    // Return best from tournament
    tournament.sort((a, b) => b.fitness - a.fitness);
    return this.cloneLayout(tournament[0].layout);
  }

  /**
   * Single-point crossover: combine two parent layouts
   * @param parent1 - First parent
   * @param parent2 - Second parent
   * @returns Offspring layout
   */
  private crossover(parent1: GardenLayout, parent2: GardenLayout): GardenLayout {
    const offspring = this.cloneLayout(parent1);

    if (parent1.rows.length === 0 || parent2.rows.length === 0) {
      return offspring;
    }

    // Choose crossover point
    const minRows = Math.min(parent1.rows.length, parent2.rows.length);
    const crossoverPoint = Math.floor(Math.random() * minRows);

    // Take rows from parent2 starting at crossover point
    for (let i = crossoverPoint; i < minRows; i++) {
      if (i < offspring.rows.length && i < parent2.rows.length) {
        offspring.rows[i] = this.cloneRow(parent2.rows[i]);
      }
    }

    return offspring;
  }

  /**
   * Apply mutation to layout
   * @param layout - Layout to mutate
   * @returns Mutated layout
   */
  private mutate(layout: GardenLayout): GardenLayout {
    if (Math.random() > this.mutationRate) {
      return layout;
    }

    const mutationType = Math.random();

    if (mutationType < 0.4) {
      // Swap two segments (40%)
      this.swapSegments(layout);
    } else if (mutationType < 0.7) {
      // Adjust segment position (30%)
      this.adjustSegmentPosition(layout);
    } else {
      // Swap vegetable types between segments (30%)
      this.swapVegetableTypes(layout);
    }

    return layout;
  }

  /**
   * Mutation: Swap two random segments between rows
   * @param layout - Layout to mutate
   */
  private swapSegments(layout: GardenLayout): void {
    if (layout.rows.length < 2) return;

    // Pick two random rows
    const row1Index = Math.floor(Math.random() * layout.rows.length);
    let row2Index = Math.floor(Math.random() * layout.rows.length);

    // Ensure different rows
    while (row2Index === row1Index && layout.rows.length > 1) {
      row2Index = Math.floor(Math.random() * layout.rows.length);
    }

    const row1 = layout.rows[row1Index];
    const row2 = layout.rows[row2Index];

    if (row1.segments.length === 0 || row2.segments.length === 0) return;

    // Pick random segments
    const seg1Index = Math.floor(Math.random() * row1.segments.length);
    const seg2Index = Math.floor(Math.random() * row2.segments.length);

    // Swap segments (keeping their positions)
    const tempVegetableId = row1.segments[seg1Index].vegetableId;
    const tempPlantCount = row1.segments[seg1Index].plantCount;

    row1.segments[seg1Index].vegetableId = row2.segments[seg2Index].vegetableId;
    row1.segments[seg1Index].plantCount = row2.segments[seg2Index].plantCount;

    row2.segments[seg2Index].vegetableId = tempVegetableId;
    row2.segments[seg2Index].plantCount = tempPlantCount;
  }

  /**
   * Mutation: Adjust position of a random segment
   * @param layout - Layout to mutate
   */
  private adjustSegmentPosition(layout: GardenLayout): void {
    if (layout.rows.length === 0) return;

    // Pick random row
    const rowIndex = Math.floor(Math.random() * layout.rows.length);
    const row = layout.rows[rowIndex];

    if (row.segments.length === 0) return;

    // Pick random segment
    const segIndex = Math.floor(Math.random() * row.segments.length);
    const segment = row.segments[segIndex];

    const vegetable = this.context.vegetables.get(segment.vegetableId);
    if (!vegetable) return;

    // Slightly adjust segment width (±10%)
    const currentWidth = segment.xEnd - segment.xStart;
    const adjustment = currentWidth * (Math.random() * 0.2 - 0.1);
    const newWidth = Math.max(
      vegetable.spacing.plantSpacing,
      currentWidth + adjustment
    );

    // Check if new width fits in garden
    if (segment.xStart + newWidth <= this.context.gardenDimensions.width) {
      segment.xEnd = segment.xStart + newWidth;

      // Recalculate plant count
      segment.plantCount = Math.floor(newWidth / vegetable.spacing.plantSpacing);
    }
  }

  /**
   * Mutation: Swap vegetable types between two segments
   * @param layout - Layout to mutate
   */
  private swapVegetableTypes(layout: GardenLayout): void {
    if (layout.rows.length === 0) return;

    // Collect all segments
    const allSegments: Array<{ row: Row; segment: PlantSegment }> = [];

    for (const row of layout.rows) {
      for (const segment of row.segments) {
        allSegments.push({ row, segment });
      }
    }

    if (allSegments.length < 2) return;

    // Pick two random segments
    const index1 = Math.floor(Math.random() * allSegments.length);
    let index2 = Math.floor(Math.random() * allSegments.length);

    while (index2 === index1 && allSegments.length > 1) {
      index2 = Math.floor(Math.random() * allSegments.length);
    }

    const { segment: seg1 } = allSegments[index1];
    const { segment: seg2 } = allSegments[index2];

    // Swap vegetable IDs
    const temp = seg1.vegetableId;
    seg1.vegetableId = seg2.vegetableId;
    seg2.vegetableId = temp;
  }

  /**
   * Deep clone a layout
   * @param layout - Layout to clone
   * @returns Cloned layout
   */
  private cloneLayout(layout: GardenLayout): GardenLayout {
    return {
      rows: layout.rows.map(row => this.cloneRow(row)),
      score: layout.score,
      metrics: { ...layout.metrics },
    };
  }

  /**
   * Deep clone a row
   * @param row - Row to clone
   * @returns Cloned row
   */
  private cloneRow(row: Row): Row {
    return {
      id: row.id,
      yPosition: row.yPosition,
      height: row.height,
      segments: row.segments.map(seg => ({
        id: seg.id,
        vegetableId: seg.vegetableId,
        xStart: seg.xStart,
        xEnd: seg.xEnd,
        plantCount: seg.plantCount,
        companions: [...seg.companions],
      })),
    };
  }

  /**
   * Configure genetic algorithm parameters
   * @param config - Configuration options
   */
  configure(config: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    eliteCount?: number;
  }): void {
    if (config.populationSize !== undefined) {
      this.populationSize = config.populationSize;
    }
    if (config.generations !== undefined) {
      this.generations = config.generations;
    }
    if (config.mutationRate !== undefined) {
      this.mutationRate = config.mutationRate;
    }
    if (config.crossoverRate !== undefined) {
      this.crossoverRate = config.crossoverRate;
    }
    if (config.eliteCount !== undefined) {
      this.eliteCount = config.eliteCount;
    }
  }
}
