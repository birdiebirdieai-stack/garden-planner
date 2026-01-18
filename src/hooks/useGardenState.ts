import { useGarden } from '../context/GardenContext';

/**
 * Hook for accessing garden state
 * Wrapper around useGarden for convenience
 */
export const useGardenState = () => {
  const context = useGarden();

  return {
    garden: context.garden,
    layout: context.layout,
    selectedVegetables: context.selectedVegetables,
    availableVegetables: context.availableVegetables,
    companionRules: context.companionRules,
    selectedPlantId: context.selectedPlantId,
    setSelectedPlantId: context.setSelectedPlantId,
  };
};
