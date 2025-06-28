import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useShallow } from "zustand/shallow";

const VITE_AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;
const ALLOWED_ROLES = ["Administrador", "Cajero", "Cocinero", "Delivery"]; // Definir roles permitidos

export const LoginRedirect = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [isChecking, setIsChecking] = useState(true);

  const { setRol, setToken } = useAuthStore(
    useShallow((state) => ({
      setToken: state.setToken,
      setRol: state.setRol,
    }))
  );
  const navigate = useNavigate();

  useEffect(() => {
    const checkRol = async () => {
      if (isLoading || !isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }
      
      const rol = user[`${VITE_AUTH0_AUDIENCE}/roles`]?.[0]; // extraer rol del token custom claim o user object
  
      try {
        // Verificar si el rol es permitido
        if (rol && !ALLOWED_ROLES.includes(rol)) {
          console.log(`Rol no permitido: ${rol}. Redirigiendo a acceso denegado.`);
          navigate("/access-denied");
          return;
        }

        const token = await getAccessTokenSilently();
        setToken(token);
        setRol(rol);
        if (rol === "Cajero") {
          navigate("/admin/gestion"); // Redirigir a la sección de insumos
        } else if (rol === "Cocinero") {
          navigate("/admin/gestion"); // Redirigir a la sección de productos
        }
        else if (rol === "Delivery") {
          navigate("/admin/gestion"); // Redirigir a la sección de promociones
        }
        else if (rol === "Administrador"){
          navigate("/admin/administracion/roles"); 
        }

        setIsChecking(false);
        
      } catch (error: any) {
          console.error("Error al consultar usuario", error);
          navigate("/");
      } 
    };

    checkRol();
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || isChecking) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50dvh",
        }}
      >
        <h2>Verificando acceso...</h2>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ff6b35',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '20px'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50dvh",
      }}
    >
      <h2>Redirigiendo...</h2>
    </div>
  );
};

