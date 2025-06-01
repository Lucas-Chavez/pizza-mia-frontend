import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../layout/AdminLayout';
import Login from '../features/login/Login'; 



const AppRoutes = () => {
    return (
        <Router>
            <Routes>                
                {/* Ruta de login para el administrador */}
                <Route path="/admin/login" element={<Login />} />
                
                {/* Rutas para el administrador */}
                {/* Redirigir la ruta administracion para que siempre vaya a roles por defecto */}
                <Route path="/admin/administracion" element={<Navigate to="/admin/administracion/roles" replace />} />
                <Route path="/admin/rubros" element={<Navigate to="/admin/rubros/insumos" replace />} />
                
                {/* Rutas específicas para la sección administración */}
                <Route path="/admin/administracion/:section" element={<Dashboard />} />
                <Route path="/admin/rubros/:section" element={<Dashboard />} />
                
                {/* Otras rutas del admin */}
Dashboard       <Route path="/admin/insumos" element={<Dashboard />} />
                <Route path="/admin/productos" element={<Dashboard />} />
                <Route path="/admin/gestion" element={<Dashboard />} />
                <Route path="/admin/estadisticas" element={<Dashboard />} />
                <Route path="/admin/seguridad" element={<Dashboard />} />
                
                {/* Ruta por defecto para admin */}
                <Route path="/admin" element={<Navigate to="/admin/administracion/roles" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;