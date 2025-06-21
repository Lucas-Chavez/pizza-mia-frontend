import {FC} from "react";
import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { useAuthStore } from "../../store/useAuthStore";

const SideBar: FC = () => {
    const { rol } = useAuthStore();
    
    // Función para verificar si el usuario tiene acceso a una sección
    const hasAccess = (allowedRoles: string[]): boolean => {
        if (!rol) return false;
        return allowedRoles.includes(rol);
    };

    return (
        <aside className={styles.sidebar}>
            <hr className={styles.divider} />
            <ul className={styles.menuList}>
                {/* Sección de Administración - Solo para Administradores */}
                {hasAccess(["Administrador"]) && (
                    <li>
                        <NavLink 
                            to="/admin/administracion"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Administración
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Rubros - Solo para Administradores */}
                {hasAccess(["Administrador"]) && (
                    <li>
                        <NavLink 
                            to="/admin/rubros"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Rubros
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Insumos - Para Administradores y Cocineros */}
                {hasAccess(["Administrador", "Cocinero"]) && (
                    <li>
                        <NavLink 
                            to="/admin/insumos"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Insumos
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Productos - Para Administradores y Cocineros */}
                {hasAccess(["Administrador", "Cocinero"]) && (
                    <li>
                        <NavLink 
                            to="/admin/productos"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Productos
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Promociones - Solo para Administradores */}
                {hasAccess(["Administrador"]) && (
                    <li>
                        <NavLink 
                            to="/admin/promociones"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Promociones
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Gestión - Para todos los roles */}
                {hasAccess(["Administrador", "Cajero", "Cocinero"]) && (
                    <li>
                        <NavLink 
                            to="/admin/gestion"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Gestión
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Estadísticas - Solo para Administradores */}
                {hasAccess(["Administrador"]) && (
                    <li>
                        <NavLink 
                            to="/admin/estadisticas"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Estadísticas
                        </NavLink>
                    </li>
                )}
                
                {/* Sección de Seguridad - Solo para Administradores */}
                {hasAccess(["Administrador"]) && (
                    <li>
                        <NavLink 
                            to="/admin/seguridad"
                            className={({ isActive }) => 
                                `${styles.menuButton} ${isActive ? styles.selected : ""}`
                            }
                        >
                            Seguridad
                        </NavLink>
                    </li>
                )}
            </ul>
        </aside>
    );
};

export default SideBar;