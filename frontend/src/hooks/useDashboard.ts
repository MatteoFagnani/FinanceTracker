import { useEffect, useState } from 'react';
import { dashboardService } from '../services/services';
import type { DashboardOverview } from '../types';

export function useDashboard() {
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await dashboardService.getOverview();
                if (mounted) setData(res);
            } catch {
                if (mounted) setError('Errore nel caricamento della dashboard.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();

        return () => { mounted = false; };
    }, []);

    return { data, loading, error };
}
