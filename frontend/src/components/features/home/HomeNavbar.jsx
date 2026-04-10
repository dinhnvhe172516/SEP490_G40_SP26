import TopBarNav from './components/TopBarNav';
import MainNavigation from './components/MainNavigation';

const HomeNavbar = ({ clinicInfo, services = [] }) => {
    return (
        <nav className="bg-white fixed w-full top-0 z-50 shadow-sm">
            {/* Subtle top bar */}
            <TopBarNav clinicInfo={clinicInfo} />
            {/* Main navigation */}
            <div className="bg-white">
                <MainNavigation clinicInfo={clinicInfo} services={services} />
            </div>
        </nav>
    );
};

export default HomeNavbar;