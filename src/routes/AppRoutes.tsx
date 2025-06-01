import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Dashboard from '../layout/AdminLayout';
import Login from '../features/login/Login'; 

// Componente para proteger rutas y verificar autenticación
const ProtectedRoute = () => {
    // Verificar si hay un usuario logueado en localStorage
    const userString = localStorage.getItem('user');
    let isAuthenticated = false;
    let isAdmin = false;

    if (userString) {
        try {
            const user = JSON.parse(userString);
            isAuthenticated = true;
            isAdmin = user.rol === 'admin';
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }

    // Si está autenticado y es admin, permite acceso a la ruta
    if (isAuthenticated && isAdmin) {
        return <Outlet />;
    }

    // Si no está autenticado o no es admin, redirige al login
    return <Navigate to="/admin/login" replace />;
};

// Componente para verificar si ya está autenticado y redirigir
const AuthRedirect = () => {
    const userString = localStorage.getItem('user');
    
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user.rol === 'admin') {
                return <Navigate to="/admin/administracion/roles" replace />;
            }
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }
    
    // Si no hay usuario o no es admin, muestra la pantalla de login
    return <Login />;
};

// Componente para manejar rutas de administración incompletas o inválidas
const AdminSectionRedirect = () => {
    // Verificar si hay un usuario logueado en localStorage
    const userString = localStorage.getItem('user');
    let isAuthenticated = false;
    let isAdmin = false;

    if (userString) {
        try {
            const user = JSON.parse(userString);
            isAuthenticated = true;
            isAdmin = user.rol === 'admin';
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }

    // Si está autenticado y es admin, redirige a la ruta principal de administración
    if (isAuthenticated && isAdmin) {
        return <Navigate to="/admin/administracion/roles" replace />;
    }

    // Si no está autenticado o no es admin, redirige al login
    return <Navigate to="/admin/login" replace />;
};

const AppRoutes = () => {
    return (
        <Router>
            <Routes>                
                {/* Ruta de login para el administrador y redirección si ya está autenticado */}
                <Route path="/admin/login" element={<AuthRedirect />} />
                
                {/* Ruta raíz para redirigir */}
                <Route path="/" element={<AuthRedirect />} />
                
                {/* Proteger todas las rutas de admin */}
                <Route element={<ProtectedRoute />}>
                    {/* Rutas para el administrador */}
                    <Route path="/admin/administracion" element={<Navigate to="/admin/administracion/roles" replace />} />
                    <Route path="/admin/rubros" element={<Navigate to="/admin/rubros/insumos" replace />} />
                    
                    {/* Secciones específicas de administración */}
                    <Route path="/admin/administracion/roles" element={<Dashboard />} />
                    <Route path="/admin/administracion/empleados" element={<Dashboard />} />
                    <Route path="/admin/administracion/clientes" element={<Dashboard />} />
                    
                    {/* Secciones específicas de rubros */}
                    <Route path="/admin/rubros/insumos" element={<Dashboard />} />
                    <Route path="/admin/rubros/productos" element={<Dashboard />} />
                    
                    {/* Rutas específicas para la sección administración incompleta */}
                    <Route path="/admin/administracion/*" element={<Navigate to="/admin/administracion/roles" replace />} />
                    <Route path="/admin/rubros/*" element={<Navigate to="/admin/rubros/insumos" replace />} />
                    
                    {/* Otras rutas del admin */}
                    <Route path="/admin/insumos" element={<Dashboard />} />
                    <Route path="/admin/productos" element={<Dashboard />} />
                    <Route path="/admin/gestion" element={<Dashboard />} />
                    <Route path="/admin/estadisticas" element={<Dashboard />} />
                    <Route path="/admin/seguridad" element={<Dashboard />} />
                    
                    {/* Ruta por defecto para admin */}
                    <Route path="/admin" element={<Navigate to="/admin/administracion/roles" replace />} />
                </Route>
                
                {/* Rutas del admin incompletas o incorrectas */}
                <Route path="/admin/*" element={<AdminSectionRedirect />} />
                
                {/* Ruta de fallback para cualquier otra ruta */}
                <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;