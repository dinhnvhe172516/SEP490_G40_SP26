import { useState, useEffect } from "react";
import HomeFooter from "../features/home/HomeFooter";
import HomeNavbar from "../features/home/HomeNavbar";
import clinicService from "../../services/clinicService";
import serviceService from "../../services/serviceService";

const PublicLayout = ({ children }) => {
    const [clinicInfo, setClinicInfo] = useState(null);
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services
                const res = await serviceService.getAllServices({ limit: 10, filter: 'AVAILABLE' });
                setServices(res?.data || []);

                // Fetch clinic info
                const clinicRes = await clinicService.getPublicClinics();
                if (clinicRes?.data && clinicRes.data.length > 0) {
                    setClinicInfo(clinicRes.data[0]);
                }
            } catch (err) {
                console.error('Fetch public layout data error:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <HomeNavbar clinicInfo={clinicInfo} services={services} />

            {/* Main content with padding top for fixed navbar */}
            <main className="flex-1 pt-20">
                {children}
            </main>

            <HomeFooter clinicInfo={clinicInfo} services={services} />
        </div>
    );
}

export default PublicLayout;