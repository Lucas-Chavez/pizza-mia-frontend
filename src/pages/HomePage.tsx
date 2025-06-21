import { useEffect, FC } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import pizzaLogo from "../assets/icons/pizza.svg";
import { useAuthStore } from '../store/useAuthStore';


export const HomePage: FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const {rol} = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    loginWithRedirect();
  };

  /// Usar useEffect para la navegación condicional
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
        if (rol === "Cajero" || rol === "Cocinero") {   
            navigate('/admin/gestion');
        } else if (rol === "Administrador") {
            navigate('/admin/administracion/roles');
        }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f8f8f8',
      fontFamily: 'Sen, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={pizzaLogo} 
          alt="Pizza Mía Logo" 
          style={{ 
            width: '80px',
            marginBottom: '1rem'
          }} 
        />
        
        <h1 style={{ 
          color: '#333',
          marginBottom: '1.5rem',
          fontSize: '2rem'
        }}>Bienvenido a Pizza Mía</h1>
        
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.5',
          marginBottom: '2rem',
          color: '#555'
        }}>
          Sistema de administración para restaurantes y pizzerías.
        </p>
        
        <button 
          onClick={handleLogin}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default HomePage;