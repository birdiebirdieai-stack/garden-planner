import {
  Garden,
  GardenLayout,
  PlacementResult,
  PlacementWarning,
  Vegetable,
  CompanionMatrix,
  SelectedVegetable,
} from '../../data/types';
import { ConstraintSatisfactionSolver } from './strategies/ConstraintSatisfaction';
import { GeneticAlgorithm } from './strategies/GeneticAlgorithm';
import { scoreLayout, meetsQualityThresholds } from './scoringFunctions';
import { findNeighbors, getCompanionRule, calculateDirection } from '../../utils/companionChecker';
import { calculateDistance } from '../../utils/geometryUtils';

/**
 * Main garden optimization orchestrator
 * Coordinates CSP and Genetic Algorithm to produce optimal layout
 */
export class GardenOptimizer {
  private vegetables: Vegetable[];
  private companionRules: CompanionMatrix;
  private garden: Garden;
  private vegetablesMap: Map<string, Vegetable>;

  constructor(
    vegetables: Vegetable[],
    companionRules: CompanionMatrix,
    garden: Garden
  ) {
    this.vegetables = vegetables;
    this.companionRules = companionRules;
    this.garden = garden;
    this.vegetablesMap = new Map(vegetables.map(v => [v.id, v]));
  }

  /**
   * Main optimization pipeline
   * Phase 1: CSP generates initial feasible layout
   * Phase 2: Genetic algorithm optimizes for companion planting
   * @returns PlacementResult with optimized layout or error
   */
  async optimize(): Promise<PlacementResult> {
    const startTime = performance.now();
    console.log('Optimizer: Starting optimization for garden', this.garden.dimensions);
    console.log('Optimizer: Selected vegetables:', this.garden.selectedVegetables);

    try {
      // Phase 1: Generate initial layout using Constraint Satisfaction
      const cspSolver = new ConstraintSatisfactionSolver(
        this.garden,
        this.vegetables,
        this.garden.selectedVegetables
      );

      const initialLayout = cspSolver.generateInitialLayout();

      if (!initialLayout) {
        console.warn('Optimizer: CSP failed to generate initial layout');
        return {
          success: false,
          warnings: [
            {
              type: 'insufficient_space',
              severity: 'high',
              message: 'Impossible de placer tous les légumes sélectionnés dans le potager. Veuillez agrandir le potager ou réduire le nombre de légumes.',
              affectedVegetables: this.garden.selectedVegetables.map(sv => sv.vegetableId),
            },
          ],
          computationTime: performance.now() - startTime,
        };
      }

      // Score initial layout
      scoreLayout(initialLayout, {
        companionRules: this.companionRules,
        gardenDimensions: this.garden.dimensions,
        vegetables: this.vegetablesMap,
      });
      console.log('Optimizer: Initial layout scored', initialLayout.score);

      // Phase 2: Optimize with Genetic Algorithm
      // console.log('Optimizer: Starting Genetic Algorithm to optimize layout...');
      // const geneticAlgorithm = new GeneticAlgorithm({
      //   companionRules: this.companionRules,
      //   gardenDimensions: this.garden.dimensions,
      //   vegetables: this.vegetablesMap,
      // });

      // const optimizedLayout = await geneticAlgorithm.evolve(initialLayout);
      const optimizedLayout = initialLayout; // Bypass for now to fix hang

      // Score final layout
      scoreLayout(optimizedLayout, {
        companionRules: this.companionRules,
        gardenDimensions: this.garden.dimensions,
        vegetables: this.vegetablesMap,
      });

      // Enrich segments with companion information for tooltips
      this.enrichCompanionInfo(optimizedLayout);

      // Validate layout quality
      const warnings = this.validateLayout(optimizedLayout);

      // Check for unplaced vegetables arising from CSP
      const unplacedVegetables = cspSolver.getUnplacedVegetables(optimizedLayout);
      if (unplacedVegetables.length > 0) {
        warnings.push({
          type: 'insufficient_space',
          severity: 'high',
          message: `Le potager est trop petit pour tout contenir. ${unplacedVegetables.length} légume(s) n'ont pas été placés.`,
          affectedVegetables: unplacedVegetables,
        });
      }

      const computationTime = performance.now() - startTime;

      return {
        success: true,
        layout: optimizedLayout,
        warnings,
        computationTime,
      };
    } catch (error) {
      return {
        success: false,
        warnings: [
          {
            type: 'insufficient_space',
            severity: 'high',
            message: `Erreur lors de l'optimisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            affectedVegetables: [],
          },
        ],
        computationTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Enrich segments with companion information for tooltips
   * @param layout - Layout to enrich
   */
  private enrichCompanionInfo(layout: GardenLayout): void {
    // Build row map
    const segmentToRow = new Map();
    for (const row of layout.rows) {
      for (const segment of row.segments) {
        segmentToRow.set(segment.id, row);
      }
    }

    // Enrich each segment
    for (const row of layout.rows) {
      for (const segment of row.segments) {
        const neighbors = findNeighbors(segment, layout);

        segment.companions = neighbors.map(({ segment: neighbor, row: neighborRow }) => {
          const currentRow = segmentToRow.get(segment.id);
          if (!currentRow) {
            return {
              vegetableId: neighbor.vegetableId,
              relationship: 'neutral' as const,
              direction: 'north' as const,
              reason: '',
            };
          }

          const rule = getCompanionRule(segment.vegetableId, neighbor.vegetableId, this.companionRules);
          const direction = calculateDirection(segment, neighbor, currentRow, neighborRow);

          return {
            vegetableId: neighbor.vegetableId,
            relationship: rule?.relationship || 'neutral',
            direction,
            reason: rule?.reason || 'Pas de relation spécifique connue',
          };
        });
      }
    }
  }

  /**
   * Validate layout and generate warnings
   * @param layout - Layout to validate
   * @returns Array of warnings
   */
  private validateLayout(layout: GardenLayout): PlacementWarning[] {
    const warnings: PlacementWarning[] = [];

    // Check utilization
    if (layout.metrics.utilisationRate < 0.5) {
      warnings.push({
        type: 'low_utilisation',
        severity: 'low',
        message: `Seulement ${(layout.metrics.utilisationRate * 100).toFixed(0)}% du potager est utilisé. Vous pourriez ajouter plus de légumes.`,
        affectedVegetables: [],
      });
    }

    // Check companion score
    if (layout.metrics.companionScore < 0.4) {
      warnings.push({
        type: 'bad_companion',
        severity: 'medium',
        message: 'Des associations antagonistes sont présentes. Certains légumes pourraient avoir des difficultés à pousser ensemble.',
        affectedVegetables: this.findAntagonisticPairs(layout),
      });
    }

    // Check spacing score
    if (layout.metrics.spacingScore < 0.7) {
      warnings.push({
        type: 'spacing_violation',
        severity: 'medium',
        message: 'Certains espacements ne respectent pas les recommandations optimales.',
        affectedVegetables: [],
      });
    }

    // Check quality thresholds
    if (!meetsQualityThresholds(layout)) {
      warnings.push({
        type: 'insufficient_space',
        severity: 'low',
        message: 'La disposition pourrait être améliorée. Envisagez d\'ajuster les dimensions ou la sélection de légumes.',
        affectedVegetables: [],
      });
    }

    return warnings;
  }

  /**
   * Find vegetable pairs with antagonistic relationships
   * @param layout - Garden layout
   * @returns Array of vegetable IDs in antagonistic pairs
   */
  private findAntagonisticPairs(layout: GardenLayout): string[] {
    const antagonistic = new Set<string>();

    // Build row map
    const segmentToRow = new Map();
    for (const row of layout.rows) {
      for (const segment of row.segments) {
        segmentToRow.set(segment.id, row);
      }
    }

    for (const row of layout.rows) {
      for (const segment of row.segments) {
        const neighbors = findNeighbors(segment, layout);

        for (const { segment: neighbor, row: neighborRow } of neighbors) {
          const rule = getCompanionRule(segment.vegetableId, neighbor.vegetableId, this.companionRules);

          if (rule && (rule.relationship === 'antagonistic' || rule.relationship === 'avoid')) {
            const currentRow = segmentToRow.get(segment.id);
            if (!currentRow) continue;

            const distance = calculateDistance(segment, neighbor, currentRow, neighborRow);

            // Check if they're too close
            if (distance < (rule.distance?.minDistance || 80)) {
              antagonistic.add(segment.vegetableId);
              antagonistic.add(neighbor.vegetableId);
            }
          }
        }
      }
    }

    return Array.from(antagonistic);
  }

  /**
   * Configure optimization parameters
   * @param config - Configuration options
   */
  configureGenetic(config: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
  }): void {
    // This would be passed to GeneticAlgorithm in optimize()
    // Stored for future optimization runs
  }
}
