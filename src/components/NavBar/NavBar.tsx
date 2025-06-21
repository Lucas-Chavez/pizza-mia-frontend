import React, { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "./NavBar.module.css";
import pizzaLogo from "../../assets/icons/pizza.svg";
import avatarLogo from "../../assets/icons/generic-avatar.svg";

const NavBar: React.FC = () => {
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
        logout({ logoutParams: { returnTo: `${window.location.origin}/` } });
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <div className={styles.logoSection}>
                    <h3>PizzaMía</h3>
                    <img src={pizzaLogo} alt="Pizza Mía Logo" className={styles.logo} />
                    <h4 className={styles.dashboardTitle}>Dashboard</h4>
                </div>
                
                <div className={styles.rightSection}>
                    {!isAuthenticated ? (
                        <button
                            className={styles.authButton}
                            onClick={() => loginWithRedirect()}
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
                                onClick={() => setMenuOpen((open) => !open)}
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