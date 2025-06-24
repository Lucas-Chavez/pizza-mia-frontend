import React, { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "./NavBar.module.css";
import pizzaLogo from "../../assets/icons/pizza.svg";
import avatarLogo from "../../assets/icons/generic-avatar.svg";
import menuIcon from "../../assets/icons/layout.png";

interface NavBarProps {
    onMenuClick?: () => void;
    onNavAction?: () => void; // <-- Nueva prop
}

const NavBar: React.FC<NavBarProps> = ({ onMenuClick, onNavAction }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Usar Auth0 para autenticación
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

    // Cerrar el menú si se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    // Manejar cierre de sesión con Auth0
    const handleLogout = () => {
        setMenuOpen(false);
        if (onNavAction) onNavAction(); // <-- Cierra sidebar si está abierto
        logout({ logoutParams: { returnTo: `${window.location.origin}/` } });
    };

    const handleAvatarClick = () => {
        setMenuOpen((open) => !open);
        if (onNavAction) onNavAction(); // <-- Cierra sidebar si está abierto
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <div className={styles.logoSection}>
                    {/* Botón menú solo en móvil */}
                    <button
                        className={styles.menuButtonMobile}
                        onClick={onMenuClick}
                        aria-label="Abrir menú"
                        type="button"
                    >
                        <img src={menuIcon} alt="Menú" />
                    </button>
                    <h3>PizzaMía</h3>
                    <img src={pizzaLogo} alt="Pizza Mía Logo" className={styles.logo} />
                    <h4 className={styles.dashboardTitle}>Dashboard</h4>
                </div>
                <div className={styles.rightSection}>
                    {!isAuthenticated ? (
                        <button
                            className={styles.authButton}
                            onClick={() => {
                                if (onNavAction) onNavAction();
                                loginWithRedirect();
                            }}
                        >
                            Iniciar sesión
                        </button>
                    ) : (
                        <>
                            <div className={styles.userGreeting}>
                                Hola, {user?.name?.split(' ')[0] || 'Usuario'}
                            </div>
                            <img
                                src={user?.picture || avatarLogo}
                                alt="Avatar"
                                className={styles.avatar}
                                onClick={handleAvatarClick}
                                style={{ cursor: "pointer" }}
                            />
                            {menuOpen && (
                                <div className={styles.avatarMenu} ref={menuRef}>
                                    <div className={styles.userInfo}>
                                        <p className={styles.userName}>{user?.name}</p>
                                        <p className={styles.userEmail}>{user?.email}</p>
                                    </div>
                                    <hr className={styles.menuDivider} />
                                    <button
                                        className={styles.logoutButton}
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;