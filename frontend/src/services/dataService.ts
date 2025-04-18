import { Dataset } from "@/types/common";
import apiClient from "./api";

export const fetchRecentDatasets = async (page = 1, perPage = 10): Promise<Dataset[]> => {
    try {
        const response = await apiClient.get('v0/dashboard/recent-datasets/', {
            params: { page, per_page: perPage }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recent datasets:", error);
        return [];
    }
};