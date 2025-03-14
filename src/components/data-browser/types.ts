
export interface DataItem {
  id: string;
  name: string;
  type: string;
  species: string;
  description: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  type: string;
  createdAt: Date;
}

// Sample data for demonstration
export const sampleData: DataItem[] = [
  { id: "GENE001", name: "BRCA1", type: "Gene", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
  { id: "GENE002", name: "TP53", type: "Gene", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "GENE003", name: "EGFR", type: "Gene", species: "Human", description: "Epidermal growth factor receptor" },
  { id: "PROT001", name: "P53_HUMAN", type: "Protein", species: "Human", description: "Cellular tumor antigen p53" },
  { id: "PROT002", name: "BRCA1_HUMAN", type: "Protein", species: "Human", description: "Breast cancer type 1 susceptibility protein" },
  { id: "PATH001", name: "p53 Pathway", type: "Pathway", species: "Human", description: "p53 signaling pathway" },
  { id: "PATH002", name: "EGFR Signaling", type: "Pathway", species: "Human", description: "EGFR signaling pathway" },
  { id: "DSET001", name: "Cancer Genome Atlas", type: "Dataset", species: "Human", description: "Comprehensive cancer genomics dataset" },
];

// Sample saved searches for demonstration
export const sampleSavedSearches: SavedSearch[] = [
  { id: "1", name: "Human Genes", query: "species:Human type:Gene", type: "gene", createdAt: new Date() },
  { id: "2", name: "Cancer Pathways", query: "cancer pathway", type: "pathway", createdAt: new Date() },
  { id: "3", name: "All Proteins", query: "type:Protein", type: "protein", createdAt: new Date() },
];

// Get unique data types from sample data
export const getUniqueDataTypes = (): string[] => {
  const types = sampleData.map(item => item.type.toLowerCase());
  return [...new Set(types)];
};

// Get unique species from sample data
export const getUniqueSpecies = (): string[] => {
  const species = sampleData.map(item => item.species);
  return [...new Set(species)];
};
