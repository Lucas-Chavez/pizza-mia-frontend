import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../layout/AdminLayout';
import AccessDenied from '../pages/AccessDenied';
import { CallbackPage } from '../pages/CallbackPage';
import { LoginRedirect } from '../pages/LoginRedirect';
import HomePage from '../pages/HomePage';
import { ProtectedRoute } from '../auth/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login-redirect" element={<LoginRedirect />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Redirecciones para rutas principales */}
            <Route 
                path="/admin/administracion" 
                element={<Navigate to="/admin/administracion/roles" replace />} 
            />
            <Route 
                path="/admin/rubros" 
                element={<Navigate to="/admin/rubros/insumos" replace />} 
            />
            
            {/* Secciones específicas de administración */}
            <Route 
                path="/admin/administracion/roles" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/administracion/empleados" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/administracion/clientes" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            
            {/* Secciones específicas de rubros */}
            <Route 
                path="/admin/rubros/insumos" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/rubros/productos" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            
            {/* Rutas específicas para la sección administración incompleta */}
            <Route 
                path="/admin/administracion/*" 
                element={<Navigate to="/admin/administracion/roles" replace />} 
            />
            <Route 
                path="/admin/rubros/*" 
                element={<Navigate to="/admin/rubros/insumos" replace />} 
            />
            
            {/* Otras rutas del admin */}
            <Route 
                path="/admin/insumos" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador", "Cocinero"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/productos" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador", "Cocinero"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/promociones" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            
            {/* Rutas de gestión, estadísticas y seguridad */}
            <Route 
                path="/admin/gestion" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador", "Cajero", "Cocinero"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/estadisticas" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin/seguridad" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            
            {/* Ruta por defecto para admin */}
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Navigate to="/admin/administracion/roles" replace />
                    </ProtectedRoute>
                } 
            />
            
            {/* Captura cualquier otra ruta no definida */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;