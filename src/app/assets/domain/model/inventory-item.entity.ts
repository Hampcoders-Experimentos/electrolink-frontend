/**
 * Domain entity/interface representing an Inventory Component in Assets BC.
 */
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  unitCost: number;
}
