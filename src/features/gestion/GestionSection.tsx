import shared from '../../styles/common/Common.module.css';
import { useState, useEffect, useCallback } from "react";
import GestionTable from "./ui/GestionTable";
import { HeaderFilterGestion } from "./ui/HeaderFilterGestion";
import Pagination from "../../components/Pagination/Pagination";
import { fetchPedidos, fetchEstados, fetchPedidoById as apiFetchPedidoById } from "../../api/adminApi";
import axios from 'axios';
import { PedidoVentaApi, EstadoApi } from "../../types/adminTypes";
import styles from "./GestionSection.module.css";
import { useAuthStore } from '../../store/useAuthStore';
import pedidoEstadoService from '../../services/pedidoEstadoService';
import { CambioEstadoDTO, EmpleadoResponse } from '../../types/pedidosTypes';
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import VerPedidoModal from "./ui/VerPedidoModal";

// Configuración del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const GestionSection: React.FC = () => {
    // Estados
    const [pedidos, setPedidos] = useState<PedidoVentaApi[]>([]);
    const [estados, setEstados] = useState<EstadoApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [wsConnected, setWsConnected] = useState<boolean>(false);
    const [empleadoId, setEmpleadoId] = useState<number | null>(null);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoVentaApi | null>(null);
    const [modalVerPedidoOpen, setModalVerPedidoOpen] = useState<boolean>(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);

    // Filtros
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [cantidadFilter, setCantidadFilter] = useState<number>(10);
    const [searchFilter, setSearchFilter] = useState<string>("");

    // Rol del usuario y Auth0
    const { rol } = useAuthStore();
    const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();

    const obtenerEmpleadoPorAuth0Id = async (auth0Id: string, token: string): Promise<EmpleadoResponse> => {
        try {
            const response = await axios.post(
            `${API_URL}/api/empleados/getUserById`,
            {
                auth0Id: auth0Id,
            },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );
            console.log('Empleado obtenido:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Error al obtener información del empleado:', error);
            throw error;
        }
    };

    // Cargar información del empleado desde Auth0
    useEffect(() => {
        const obtenerEmpleado = async () => {
            if (isAuthenticated && user?.sub) {
                try {
                    const token = await getAccessTokenSilently();
                    const empleado = await obtenerEmpleadoPorAuth0Id(user.sub, token);
                    
                    if (empleado && empleado.id) {
                        setEmpleadoId(empleado.id);
                        console.log('ID de empleado obtenido:', empleado.id);
                    } else {
                        console.error('No se pudo obtener el ID del empleado');
                        toast.error('No se pudo identificar al empleado');
                    }
                } catch (error) {
                    console.error('Error al obtener empleado:', error);
                    toast.error('Error al cargar información del empleado');
                }
            }
        };

        obtenerEmpleado();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    // Inicializar WebSocket y monitorear conexión
    useEffect(() => {
        // Inicializar servicio WebSocket
        pedidoEstadoService.init(`${API_URL}/pizzamia-websocket`);
        
        // Actualizar estado de conexión inmediatamente
        setWsConnected(pedidoEstadoService.isConnected());
        
        // Verificar estado de conexión periódicamente
        const connectionCheck = setInterval(() => {
            const isConnected = pedidoEstadoService.isConnected();
            setWsConnected(isConnected);
            
            // Si no está conectado, intentar reconectar
            if (!isConnected) {
                pedidoEstadoService.reconnect()
                    .then(success => {
                        if (success) {
                            setWsConnected(true);
                            console.log('Reconexión exitosa');
                        }
                    })
                    .catch(() => {});
            }
        }, 5000);
        
        // Limpieza al desmontar
        return () => {
            clearInterval(connectionCheck);
            pedidoEstadoService.cleanup();
        };
    }, [API_URL]);

    // Suscribirse a cambios de estado
    useEffect(() => {
        const unsubscribe = pedidoEstadoService.onStateChange(handleStateChange);
        return unsubscribe;
    }, [pedidos]);

    // Cargar pedidos
    useEffect(() => {
        loadPedidos();
    }, [currentPage, pageSize, rol]);

    // Cargar estados
    useEffect(() => {
        loadEstados();
    }, []);

    // Manejar cambios de estado recibidos vía WebSocket
    const handleStateChange = useCallback((cambio: CambioEstadoDTO) => {
        console.log('Cambio de estado recibido:', cambio);
        
        // Buscar el estado en la lista
        const nuevoEstadoObj = estados.find(e => e.id === cambio.nuevoEstadoId);
        const nuevoEstadoNombre = cambio.nuevoEstadoNombre || nuevoEstadoObj?.denominacion || 'nuevo estado';
        
        // Verificar si el pedido debería ser visible para este rol
        const esVisibleParaRol = rol && rol !== 'ADMIN' 
            ? pedidoEstadoService.getEstadosVisibles(rol).includes(nuevoEstadoNombre)
            : true;
        
        // Verificar si el pedido ya está en nuestra lista
        const pedidoExistente = pedidos.find(p => p.id === cambio.pedidoId);
        
        if (pedidoExistente) {
            // Si el pedido ya existe, actualizamos su estado
            setPedidos(prevPedidos => {
                const pedidosActualizados = prevPedidos.map(pedido => 
                    pedido.id === cambio.pedidoId 
                        ? {
                            ...pedido,
                            estado: {
                                id: cambio.nuevoEstadoId,
                                denominacion: nuevoEstadoNombre
                            }
                        } 
                        : pedido
                );
                
                // Si hay un filtro por rol, aplicarlo para eliminar pedidos que ya no son visibles
                if (rol && rol !== 'ADMIN') {
                    const estadosVisibles = pedidoEstadoService.getEstadosVisibles(rol);
                    return pedidosActualizados.filter(pedido => 
                        estadosVisibles.includes(pedido.estado.denominacion)
                    );
                }
                
                return pedidosActualizados;
            });
            
            // Si cambió a un estado que ya no debería ser visible, no necesitamos hacer más
            if (!esVisibleParaRol) {
                return;
            }
        } else if (esVisibleParaRol) {
            // Si es un pedido nuevo que debería ser visible para este rol, cargarlo
            apiFetchPedidoById(cambio.pedidoId)
                .then(nuevoPedido => {
                    // Solo añadir si el estado actual del pedido es visible para este rol
                    if (pedidoEstadoService.getEstadosVisibles(rol).includes(nuevoPedido.estado.denominacion)) {
                        setPedidos(prevPedidos => [nuevoPedido, ...prevPedidos]);
                        
                        // Notificar al usuario sobre el nuevo pedido
                        toast.info(`Nuevo pedido #${nuevoPedido.id} recibido`);
                        
                        // Reproducir un sonido de notificación si es apropiado
                        playNotificationSound();
                    }
                })
                .catch(error => {
                    console.error('Error al cargar el nuevo pedido:', error);
                });
        }
        
        // Si el usuario tiene aplicado un filtro de estado, y este coincide con el nuevo estado,
        // pero el pedido no está en la lista, debemos recargarlo todo
        if (estadoFilter && estadoFilter === nuevoEstadoNombre && !pedidoExistente) {
            loadPedidos();
        }
    }, [estados, rol, pedidos, estadoFilter]);

    // Función para reproducir un sonido de notificación
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification-sound.mp3'); // Asegúrate de tener este archivo en la carpeta public
            audio.play();
        } catch (error) {
            console.warn('No se pudo reproducir el sonido de notificación', error);
        }
    };

    // Añadir esta función auxiliar para obtener detalles de un pedido
    const fetchPedidoById = async (pedidoId: number): Promise<PedidoVentaApi> => {
        try {
            return await fetchPedidoById(pedidoId);
        } catch (error) {
            console.error(`Error al obtener el pedido #${pedidoId}:`, error);
            throw error;
        }
    };

    // Cargar pedidos desde la API
    const loadPedidos = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetchPedidos(currentPage, pageSize, "id");
            
            // Filtrar pedidos según el rol del usuario
            let filteredPedidos = result.content;
            
            if (rol && rol !== 'ADMIN') {
                const estadosVisibles = pedidoEstadoService.getEstadosVisibles(rol);
                filteredPedidos = filteredPedidos.filter(pedido => 
                    estadosVisibles.includes(pedido.estado.denominacion)
                );
            }
            
            setPedidos(filteredPedidos);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (err) {
            console.error("Error al cargar pedidos:", err);
            setError("Error al cargar los pedidos. Por favor, intenta nuevamente.");
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estados desde la API
    const loadEstados = async () => {
        try {
            const estadosData = await fetchEstados();
            setEstados(estadosData);
        } catch (err) {
            console.error("Error al cargar estados:", err);
            toast.error("No se pudieron cargar los estados");
        }
    };

    // Handlers
    const handleEdit = async (pedido: PedidoVentaApi) => {
        try {
            const pedidoCompleto = await fetchPedidoById(pedido.id);
            console.log("Detalles del pedido:", pedidoCompleto);
            toast.info(`Editar pedido #${pedido.id}`);
        } catch (err) {
            console.error("Error al obtener detalles del pedido:", err);
            toast.error("Error al obtener detalles del pedido");
        }
    };

    const handleVerReceta = async (pedido: PedidoVentaApi) => {
        try {
            // Obtener pedido completo si necesitamos más detalles
            const pedidoCompleto = await apiFetchPedidoById(pedido.id);
            setPedidoSeleccionado(pedidoCompleto);
            setModalVerPedidoOpen(true);
        } catch (err) {
            console.error("Error al obtener detalles del pedido:", err);
            toast.error("Error al cargar los detalles del pedido");
        }
    };

    const handleNuevoClick = () => {
        toast.info("Nuevo pedido");
    };

    // Manejar cambio de estado
    const handleEstadoChange = (pedidoId: number, nuevoEstadoId: number, estadoActualId: number) => {
        // Verificar si tenemos el ID del empleado
        if (!empleadoId) {
            toast.error('No se pudo identificar al empleado. Por favor, inicie sesión nuevamente.');
            return;
        }
        
        // Obtener nombres de estados para validación
        const estadoActual = estados.find(e => e.id === estadoActualId)?.denominacion || '';
        const nuevoEstado = estados.find(e => e.id === nuevoEstadoId)?.denominacion || '';
        
        // Validar si el usuario puede realizar este cambio
        if (!pedidoEstadoService.puedeRealizarCambio(estadoActual, nuevoEstado, rol)) {
            toast.error(`No tiene permisos para cambiar el pedido de "${estadoActual}" a "${nuevoEstado}"`);
            return;
        }
        
        // Enviar cambio de estado con el ID real del empleado
        const enviado = pedidoEstadoService.cambiarEstado(
            pedidoId, 
            nuevoEstadoId, 
            empleadoId, // Usar el ID real del empleado
            estadoActualId
        );
        
        // Si falla el envío, aplicar cambio localmente como fallback
        if (!enviado) {
            // Simular el cambio localmente si no hay conexión
            setPedidos(prevPedidos => 
                prevPedidos.map(pedido => 
                    pedido.id === pedidoId 
                        ? {
                            ...pedido,
                            estado: {
                                id: nuevoEstadoId,
                                denominacion: nuevoEstado
                            }
                        } 
                        : pedido
                )
            );
            toast.warning("Cambio aplicado localmente (sin conexión al servidor)");
        }
    };

    // Filtrar pedidos
    const filtrarPedidos = () => {
        return pedidos.filter(pedido => 
            (!estadoFilter || pedido.estado.denominacion === estadoFilter) &&
            (
                searchFilter === "" ||
                `${pedido.cliente.nombre} ${pedido.cliente.apellido}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
                pedido.id.toString().includes(searchFilter)
            )
        );
    };

    // Obtener pedidos filtrados
    const pedidosFiltrados = filtrarPedidos();

    // Obtener estados que el usuario puede ver según su rol
    const getEstadosFiltrables = () => {
        if (!rol || rol === 'ADMIN') {
            return estados;
        }
        
        const estadosVisibles = pedidoEstadoService.getEstadosVisibles(rol);
        return estados.filter(estado => 
            estadosVisibles.includes(estado.denominacion)
        );
    };

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                {/* Indicador de estado de conexión */}
                <div className={`${styles.connectionStatus} ${wsConnected ? styles.connected : styles.disconnected}`}>
                    {wsConnected ? 'Conectado al servidor' : 'Sin conexión al servidor - Reintentando...'}
                </div>
                
                {/* Header con filtros */}
                <HeaderFilterGestion
                    title="Gestión de Pedidos"
                    estado={estadoFilter}
                    onEstadoChange={setEstadoFilter}
                    cantidad={cantidadFilter}
                    onCantidadChange={(value) => {
                        setCantidadFilter(value);
                        setPageSize(value);
                        setCurrentPage(0);
                    }}
                    search={searchFilter}
                    onSearchChange={setSearchFilter}
                    onNewClick={handleNuevoClick}
                    estados={getEstadosFiltrables()}
                />
                
                {/* Mostrar estado de carga o error */}
                {loading ? (
                    <div className={styles.loadingContainer}>Cargando pedidos...</div>
                ) : error ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : (
                    /* Tabla de pedidos */
                    <div className={shared.tableContainer}>
                        <GestionTable
                            pedidos={pedidosFiltrados}
                            onEdit={handleEdit}
                            onVerReceta={handleVerReceta}
                            onEstadoChange={handleEstadoChange}
                            estados={estados}
                            userRol={rol}
                        />
                        
                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className={shared.paginationContainer}>
                                <div className={styles.paginationInfo}>
                                    Mostrando {pedidosFiltrados.length} de {totalElements} pedidos
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Modal para ver detalles del pedido */}
            <VerPedidoModal
                open={modalVerPedidoOpen}
                onClose={() => setModalVerPedidoOpen(false)}
                pedido={pedidoSeleccionado}
            />
        </div>
    );
};

export default GestionSection;