import React, { useEffect, useState } from "react";
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
    "/admin/gestion": ["Cajero", "Cocinero"],
    "/admin/estadisticas": ["Administrador"],
    "/admin/seguridad": ["Administrador"]
};

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { rol } = useAuthStore();
    const pathname = location.pathname;

    // Estado para sidebar móvil
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Cierra el sidebar al navegar en móvil
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Verificar permisos cada vez que cambia la ruta
    useEffect(() => {
        const basePath = Object.keys(routePermissions).find(route =>
            pathname.startsWith(route)
        );
        if (basePath && rol) {
            const allowedRoles = routePermissions[basePath as keyof typeof routePermissions];
            if (!allowedRoles.includes(rol)) {
                navigate('/admin/gestion');
            }
        }
    }, [pathname, rol, navigate]);

    // Renderizar contenido según la ruta actual
    const renderContent = () => {
        if (pathname.startsWith("/admin/administracion")) return <AdministracionSection />;
        if (pathname.startsWith("/admin/rubros")) return <RubrosSection />;
        if (pathname.startsWith("/admin/insumos")) return <InsumosSection />;
        if (pathname.startsWith("/admin/productos")) return <ProductosSection />;
        if (pathname.startsWith("/admin/promociones")) return <PromocionesSection />;
        if (pathname.startsWith("/admin/gestion")) return <GestionSection />;
        if (pathname.startsWith("/admin/estadisticas")) return <EstadisticasSection />;
        if (pathname.startsWith("/admin/seguridad")) return <SeguridadSection />;
        return <GestionSection />;
    };

    // ...existing code...
    return (
        <div className="admin-page">
            <NavBar 
                onMenuClick={() => setSidebarOpen(open => !open)}
                onNavAction={() => setSidebarOpen(false)} // <-- Nueva prop
            />
            <div className="admin-layout">
                <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
            {/* Overlay para cerrar sidebar en móvil */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.25)",
                        zIndex: 998
                    }}
                />
            )}
        </div>
    );
};

export default AdminLayout;