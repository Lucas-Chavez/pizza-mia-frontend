import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Auth0ProviderApp } from "./auth/Auth0ProviderApp.tsx";
import { BrowserRouter } from "react-router";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* provider de auth0 */}
      <Auth0ProviderApp>
        {/* esta es mi app */}
        <App />
        
      </Auth0ProviderApp>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>,
)
