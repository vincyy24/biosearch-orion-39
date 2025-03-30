
import { useState, useEffect } from 'react';

interface AnalyticsData {
  researchStats: {
    total: number;
    active: number;
    completed: number;
    collaborations: number;
  };
  publicationStats: {
    total: number;
    peerReviewed: number;
    citations: number;
    downloads: number;
  };
  datasetStats: {
    total: number;
    uploads: number;
    downloads: number;
    shared: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    institutions: number;
  };
  activityData: {
    date: string;
    research: number;
    publications: number;
    datasets: number;
  }[];
  topResearch: {
    id: string;
    title: string;
    views: number;
  }[];
  topPublications: {
    id: string;
    title: string;
    citations: number;
  }[];
  topDatasets: {
    id: string;
    title: string;
    downloads: number;
  }[];
}

export const useAnalytics = (period: string = 'month') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/analytics?period=${period}`);
        // const data = await response.json();
        
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          researchStats: {
            total: 253,
            active: 127,
            completed: 86,
            collaborations: 142
          },
          publicationStats: {
            total: 184,
            peerReviewed: 156,
            citations: 2345,
            downloads: 8724
          },
          datasetStats: {
            total: 463,
            uploads: 52,
            downloads: 1287,
            shared: 186
          },
          userStats: {
            totalUsers: 3254,
            activeUsers: 872,
            newUsers: 124,
            institutions: 56
          },
          activityData: [
            { date: '2023-01', research: 12, publications: 5, datasets: 18 },
            { date: '2023-02', research: 15, publications: 8, datasets: 22 },
            { date: '2023-03', research: 18, publications: 10, datasets: 25 },
            { date: '2023-04', research: 22, publications: 7, datasets: 30 },
            { date: '2023-05', research: 19, publications: 12, datasets: 28 },
            { date: '2023-06', research: 25, publications: 15, datasets: 32 },
            { date: '2023-07', research: 28, publications: 18, datasets: 35 },
            { date: '2023-08', research: 30, publications: 20, datasets: 40 },
            { date: '2023-09', research: 27, publications: 22, datasets: 38 },
            { date: '2023-10', research: 32, publications: 25, datasets: 45 },
            { date: '2023-11', research: 35, publications: 28, datasets: 50 },
            { date: '2023-12', research: 38, publications: 30, datasets: 55 }
          ],
          topResearch: [
            { id: 'RP-12345ABC', title: 'Novel Electrochemical Sensors for Glucose Detection', views: 1245 },
            { id: 'RP-67890DEF', title: 'Electrochemical Impedance Spectroscopy for Battery Health', views: 987 },
            { id: 'RP-13579GHI', title: 'Advanced Materials for Fuel Cells', views: 876 },
            { id: 'RP-24680JKL', title: 'Quantum Effects in Electrochemical Systems', views: 754 },
            { id: 'RP-11223MNO', title: 'Machine Learning for Voltammetry Analysis', views: 632 }
          ],
          topPublications: [
            { id: '10.1021/jacs.0c01234', title: 'Highly Sensitive Electrochemical Detection Method', citations: 156 },
            { id: '10.1039/d0cc00987c', title: 'Advances in Energy Storage Materials', citations: 124 },
            { id: '10.1002/adma.202003456', title: 'Novel Electrodes for Sustainable Energy', citations: 98 },
            { id: '10.1021/acsami.0c07890', title: 'Interface Engineering for Electrochemical Devices', citations: 87 },
            { id: '10.1002/aenm.202100123', title: 'Next-Generation Battery Technologies', citations: 76 }
          ],
          topDatasets: [
            { id: 'DS-54321ZYX', title: 'Cyclic Voltammetry Data for Li-ion Batteries', downloads: 876 },
            { id: 'DS-09876WVU', title: 'Impedance Spectroscopy Database for Fuel Cells', downloads: 754 },
            { id: 'DS-13579TSR', title: 'Chronoamperometry Measurements for Biosensors', downloads: 632 },
            { id: 'DS-24680QPO', title: 'Reference Data for Electrochemical Sensors', downloads: 521 },
            { id: 'DS-11223NML', title: 'Benchmark Dataset for ML in Electrochemistry', downloads: 487 }
          ]
        };
        
        // Simulate API delay
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    };

    fetchAnalytics();
  }, [period]);

  return { data, loading, error };
};
