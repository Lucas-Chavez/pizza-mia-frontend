import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/themes/admin.css";
import SideBar from "../components/SideBar/SideBar";
import NavBar from "../components/NavBar/NavBar";
import { useAuthStore } from "../store/useAuthStore";

// Importar las secciones
import { AdministracionSection } from "../features/administracion/AdministracionSection";
import { RubrosSection } from "../features/rubros/RubrosSection";
import { InsumosSection } from "../features/insumos/InsumosSection";
import { ProductosSection } from "../features/productos/ProductosSection";
import { GestionSection }  from "../features/gestion/GestionSection";
import { EstadisticasSection } from "../features/estadisticas/EstadisticasSection";
import { SeguridadSection } from "../features/seguridad/SeguridadSection";
import { PromocionesSection } from "../features/promociones/PromocionesSection";

// Definir los permisos de acceso para cada ruta
const routePermissions = {
    "/admin/administracion": ["Administrador"],
    "/admin/rubros": ["Administrador"],
    "/admin/insumos": ["Administrador", "Cocinero"],
    "/admin/productos": ["Administrador", "Cocinero"],
    "/admin/promociones": ["Administrador"],
    "/admin/gestion": ["Administrador", "Cajero", "Cocinero"],
    "/admin/estadisticas": ["Administrador"],
    "/admin/seguridad": ["Administrador"]
};

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { rol } = useAuthStore();
    const pathname = location.pathname;
    
    // Verificar permisos cada vez que cambia la ruta
    useEffect(() => {
        // Encontrar la ruta base para verificar permisos
        const basePath = Object.keys(routePermissions).find(route => 
            pathname.startsWith(route)
        );
        
        if (basePath && rol) {
            const allowedRoles = routePermissions[basePath as keyof typeof routePermissions];
            if (!allowedRoles.includes(rol)) {
                console.log(`Acceso no autorizado a ${basePath} para rol ${rol}`);
                navigate('/admin/gestion'); // Redirigir a una ruta segura
            }
        }
    }, [pathname, rol, navigate]);
    
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
        if (pathname.startsWith("/admin/promociones")) {
            return <PromocionesSection />;
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
        return <GestionSection />; // Por defecto mostrar Gestión que es accesible para todos
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