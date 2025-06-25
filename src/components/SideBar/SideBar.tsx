import {FC} from "react";
import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { useAuthStore } from "../../store/useAuthStore";

interface SideBarProps {
    open?: boolean;
    onClose?: () => void;
}

const SideBar: FC<SideBarProps> = ({ open = false, onClose }) => {
    const { rol } = useAuthStore();

    // Función para verificar si el usuario tiene acceso a una sección
    const hasAccess = (allowedRoles: string[]): boolean => {
        if (!rol) return false;
        return allowedRoles.includes(rol);
    };

    return (
        <aside
            className={`${styles.sidebar} ${open ? styles.open : ""}`}
            tabIndex={-1}
            aria-hidden={!open}
        >
            {/* Botón cerrar solo en móvil */}
            <button
                className={styles.closeButtonMobile}
                onClick={onClose}
                aria-label="Cerrar menú"
                type="button"
            >
                ×
            </button>
            <hr className={styles.divider} />
            <ul className={styles.menuList}>
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
                {hasAccess(["Cajero", "Cocinero"]) && (
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