
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Garden,
  GardenLayout,
  Vegetable,
  SelectedVegetable,
  CompanionMatrix,
  CompanionRule,
  PlacementResult,
} from '../data/types';
import { GardenOptimizer } from '../algorithms/optimizer/GardenOptimizer';
import { buildCompanionMatrix } from '../utils/companionChecker';

// Import data
import vegetablesData from '../data/vegetables.json';
import companionRulesData from '../data/companionRules.json';

interface GardenContextType {
  // Garden configuration
  garden: Garden;
  updateGardenDimensions: (width: number, length: number) => void;

  // Vegetable selection
  availableVegetables: Vegetable[];
  selectedVegetables: SelectedVegetable[];
  addVegetable: (vegetableId: string) => void;
  removeVegetable: (vegetableId: string) => void;
  updateVegetableQuantity: (vegetableId: string, quantity: number) => void;
  updateVegetablePriority: (vegetableId: string, priority: number) => void;

  // Layout and optimization
  layout: GardenLayout | null;
  isOptimizing: boolean;
  optimizationProgress: number;
  optimizationError: string | null;
  placementResult: PlacementResult | null;
  runOptimization: () => Promise<void>;
  clearLayout: () => void;

  // Companion data
  companionRules: CompanionMatrix;

  // Interaction
  selectedPlantId: string | null;
  setSelectedPlantId: (id: string | null) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load vegetables and companion rules
  const [availableVegetables] = useState<Vegetable[]>(vegetablesData.vegetables as Vegetable[]);
  const [companionRules] = useState<CompanionMatrix>(() =>
    buildCompanionMatrix(companionRulesData.rules as CompanionRule[])
  );

  // Garden state
  const [garden, setGarden] = useState<Garden>({
    id: 'default-garden',
    dimensions: {
      width: 400, // Default 400cm = 4m
      length: 600, // Default 600cm = 6m
    },
    selectedVegetables: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Selected vegetables
  const [selectedVegetables, setSelectedVegetables] = useState<SelectedVegetable[]>([]);

  // Optimization state
  const [layout, setLayout] = useState<GardenLayout | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null);

  // Interaction state
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Sync selected vegetables with garden
  useEffect(() => {
    setGarden(prev => ({
      ...prev,
      selectedVegetables,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date(),
      },
    }));
  }, [selectedVegetables]);

  // Update garden dimensions
  const updateGardenDimensions = useCallback((width: number, length: number) => {
    setGarden(prev => ({
      ...prev,
      dimensions: { width, length },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date(),
      },
    }));
    // Clear layout when dimensions change
    setLayout(null);
    setPlacementResult(null);
  }, []);

  // Add vegetable to selection
  const addVegetable = useCallback((vegetableId: string) => {
    setSelectedVegetables(prev => {
      // Check if already selected
      if (prev.some(sv => sv.vegetableId === vegetableId)) {
        return prev;
      }

      const vegetable = availableVegetables.find(v => v.id === vegetableId);
      let defaultQuantity = 1;

      if (vegetable) {
        // Calculate max plants for one row
        // width in cm / plant spacing in cm
        const plantSpacing = vegetable.spacing.plantSpacing;
        if (plantSpacing > 0) {
          defaultQuantity = Math.floor(garden.dimensions.width / plantSpacing);
          // Ensure at least 1
          defaultQuantity = Math.max(1, defaultQuantity);
        }
      }

      return [
        ...prev,
        {
          vegetableId,
          quantity: 1, // Will be calculated dynamically
          priority: 3, // Default to "Normal"
        },
      ];
    });
  }, [availableVegetables, garden.dimensions.width]);

  // Remove vegetable from selection
  const removeVegetable = useCallback((vegetableId: string) => {
    setSelectedVegetables(prev => prev.filter(sv => sv.vegetableId !== vegetableId));
  }, []);

  // Update vegetable quantity
  const updateVegetableQuantity = useCallback((vegetableId: string, quantity: number) => {
    setSelectedVegetables(prev =>
      prev.map(sv =>
        sv.vegetableId === vegetableId ? { ...sv, quantity } : sv
      )
    );
  }, []);

  // Update vegetable priority
  const updateVegetablePriority = useCallback((vegetableId: string, priority: number) => {
    setSelectedVegetables(prev =>
      prev.map(sv =>
        sv.vegetableId === vegetableId ? { ...sv, priority } : sv
      )
    );
  }, []);

  // Run optimization
  const runOptimization = useCallback(async () => {
    if (selectedVegetables.length === 0) {
      setOptimizationError('Veuillez sélectionner au moins un légume');
      return;
    }

    setIsOptimizing(true);
    setOptimizationError(null);
    setOptimizationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // --- AUTO-CALCULATE QUANTITIES BASED ON WEIGHTS ---
      const totalPriority = selectedVegetables.reduce((sum, v) => sum + (v.priority || 3), 0);

      // Garden Area in cm²
      const totalGardenArea = garden.dimensions.width * garden.dimensions.length;

      // Compute quantities
      const calculatedSelectedVegetables = selectedVegetables.map(sv => {
        const vegetable = availableVegetables.find(v => v.id === sv.vegetableId);
        if (!vegetable) return sv;

        const priority = sv.priority || 3;
        const share = priority / totalPriority;
        const targetArea = totalGardenArea * share;

        // Approximate area per plant (cm²)
        const plantArea = vegetable.spacing.plantSpacing * vegetable.spacing.rowSpacing;

        // Target count (add 15% buffer to ensure full rows)
        const targetCount = Math.ceil((targetArea / plantArea) * 1.15);

        console.log(`Auto-Calc for ${vegetable.name}: Priority=${priority}, Share=${(share * 100).toFixed(1)}%, Target=${targetCount} plants`);

        return {
          ...sv,
          quantity: Math.max(1, targetCount)
        };
      });

      // Create a temporary garden object with calculated quantities
      const gardenWithCalculatedQuantities = {
        ...garden,
        selectedVegetables: calculatedSelectedVegetables
      };

      // Create optimizer
      const optimizer = new GardenOptimizer(
        availableVegetables,
        companionRules,
        gardenWithCalculatedQuantities
      );

      // Run optimization
      const result = await optimizer.optimize();

      clearInterval(progressInterval);
      setOptimizationProgress(100);

      if (result.success && result.layout) {
        setLayout(result.layout);
        setPlacementResult(result);
        setOptimizationError(null);
      } else {
        setOptimizationError(
          result.warnings[0]?.message || 'Erreur lors de l\'optimisation'
        );
        setLayout(null);
        setPlacementResult(result);
      }
    } catch (error) {
      setOptimizationError(
        error instanceof Error ? error.message : 'Erreur inconnue'
      );
      setLayout(null);
    } finally {
      setIsOptimizing(false);
      // Keep progress at 100 for a moment, then reset
      setTimeout(() => {
        setOptimizationProgress(0);
      }, 1000);
    }
  }, [garden, selectedVegetables, availableVegetables, companionRules]);

  // Clear layout
  const clearLayout = useCallback(() => {
    setLayout(null);
    setPlacementResult(null);
    setOptimizationError(null);
  }, []);

  const value: GardenContextType = {
    garden,
    updateGardenDimensions,
    availableVegetables,
    selectedVegetables,
    addVegetable,
    removeVegetable,
    updateVegetableQuantity,
    updateVegetablePriority,
    layout,
    isOptimizing,
    optimizationProgress,
    optimizationError,
    placementResult,
    runOptimization,
    clearLayout,
    companionRules,
    selectedPlantId,
    setSelectedPlantId,
  };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
};

// Custom hook to use garden context
export const useGarden = (): GardenContextType => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};
