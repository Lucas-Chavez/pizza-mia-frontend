import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/themes/admin.css";
import SideBar from "../components/SideBar/SideBar";
import NavBar from "../components/NavBar/NavBar";

// Importar las secciones
import { AdministracionSection } from "../features/administracion/AdministracionSection";
import { RubrosSection } from "../features/rubros/RubrosSection";
import { InsumosSection } from "../features/insumos/InsumosSection";
import { ProductosSection } from "../features/productos/ProductosSection";
import { GestionSection }  from "../features/gestion/GestionSection";
import { EstadisticasSection } from "../features/estadisticas/EstadisticasSection";
import { SeguridadSection } from "../features/seguridad/SeguridadSection";

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;
    
    // Renderizar contenido según la ruta actual
    const renderContent = () => {
        if (pathname.startsWith("/admin/administracion")) {
            return <AdministracionSection />;
        }
        if (pathname.startsWith("/admin/rubros")) {
            return <RubrosSection />;
        }
        if (pathname.startsWith("/admin/insumos")) {
            return <InsumosSection />;
        }
        if (pathname.startsWith("/admin/productos")) {
            return <ProductosSection />;
        }
        if (pathname.startsWith("/admin/gestion")) {
            return <GestionSection />;
        }
        if (pathname.startsWith("/admin/estadisticas")) {
            return <EstadisticasSection />;
        }
        if (pathname.startsWith("/admin/seguridad")) {
            return <SeguridadSection />;
        }
        return <AdministracionSection />;
    };

    return (
        <div className="admin-page">
            <NavBar />
            <div className="admin-layout">
                <SideBar />
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;