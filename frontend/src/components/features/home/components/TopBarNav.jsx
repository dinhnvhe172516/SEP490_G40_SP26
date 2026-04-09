import { Phone, Clock } from 'lucide-react';
const TopBarNav = ({ clinicInfo }) => {
    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-9 text-xs">
                    <div className="flex items-center gap-4 text-gray-600">
                        <a href={`tel:${clinicInfo?.phone || 'bị lỗi'}`} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                            <Phone size={12} />
                            <span>{clinicInfo?.phone || 'bị lỗi'}</span>
                        </a>
                        <span className="hidden md:flex items-center gap-1.5">
                            <Clock size={12} />
                            {clinicInfo?.working_house || 'bị lỗi'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBarNav;