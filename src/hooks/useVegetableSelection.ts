import { useGarden } from '../context/GardenContext';

/**
 * Hook for managing vegetable selection
 */
export const useVegetableSelection = () => {
  const context = useGarden();

  return {
    availableVegetables: context.availableVegetables,
    selectedVegetables: context.selectedVegetables,
    addVegetable: context.addVegetable,
    removeVegetable: context.removeVegetable,
    updateVegetableQuantity: context.updateVegetableQuantity,
    updateVegetablePriority: context.updateVegetablePriority,
  };
};
