import apiClient from "./api";
import { UserProfile } from "@/types/common";

export const fetchUserProfile = async (username: string): Promise<UserProfile> => {
    try {
        const response = await apiClient.get('v0/user/profile/' + username + "/");
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};