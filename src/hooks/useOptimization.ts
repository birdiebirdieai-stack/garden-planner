import { useGarden } from '../context/GardenContext';

/**
 * Hook for managing optimization process
 */
export const useOptimization = () => {
  const context = useGarden();

  return {
    isOptimizing: context.isOptimizing,
    optimizationProgress: context.optimizationProgress,
    optimizationError: context.optimizationError,
    placementResult: context.placementResult,
    runOptimization: context.runOptimization,
    clearLayout: context.clearLayout,
  };
};
