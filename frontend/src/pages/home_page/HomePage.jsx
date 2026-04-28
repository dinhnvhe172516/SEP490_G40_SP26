import { useState, useEffect } from 'react';
import HomeNavbar from '../../components/features/home/HomeNavbar';
import HomeFooter from '../../components/features/home/HomeFooter';
import HomeContent from '../../components/features/home/HomeContent.jsx';
import useRoleRedirect from '../../hooks/useRoleRedirect';
import clinicService from '../../services/clinicService';
import serviceService from '../../services/serviceService';

const HomePage = () => {
    // Automatically redirect to dashboard if user is logged in
    useRoleRedirect();

    const [clinicInfo, setClinicInfo] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services
                const res = await serviceService.getAllServices({ limit: 10, filter: 'AVAILABLE' });
                setServices(res?.data || []);

                // Fetch clinic info for logo
                const clinicRes = await clinicService.getPublicClinics();
                if (clinicRes?.data && clinicRes.data.length > 0) {
                    setClinicInfo(clinicRes.data[0]);
                }
            } catch (err) {
                console.error('Fetch homepage data error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <HomeNavbar clinicInfo={clinicInfo} />

            <HomeContent clinicInfo={clinicInfo} />

            <HomeFooter clinicInfo={clinicInfo} services={services} />
        </div>
    );
};

export default HomePage;
