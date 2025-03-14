
export interface DataItem {
  id: string;
  name: string;
  type: string;
  species: string;
  description: string;
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
