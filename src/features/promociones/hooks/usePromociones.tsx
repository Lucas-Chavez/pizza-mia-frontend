import { useState, useEffect } from 'react';
import { 
    PromocionApi, 
    PromocionDetalleApi,
    ArticuloManufacturadoApi, 
    InsumoApi 
} from '../../../types/adminTypes';
import {
    fetchPromociones,
    createPromocion,
    updatePromocion,
    fetchArticulosManufacturados,
    fetchInsumos
} from '../../../api/adminApi';

interface UsePromocionesOptions {
    autoLoad?: boolean;
}

export const usePromociones = (options: UsePromocionesOptions = {}) => {
    const { autoLoad = true } = options;

    // Estados principales
    const [promociones, setPromociones] = useState<PromocionApi[]>([]);
    const [articulosManufacturados, setArticulosManufacturados] = useState<ArticuloManufacturadoApi[]>([]);
    const [insumos, setInsumos] = useState<InsumoApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtros
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [estado, setEstado] = useState("");

    // Cargar datos iniciales
    useEffect(() => {
        if (autoLoad) {
            loadInitialData();
        }
    }, [autoLoad]);

    /**
     * Cargar datos iniciales (promociones, productos e insumos)
     */
    const loadInitialData = async () => {
        await Promise.all([
            loadPromociones(),
            loadArticulosManufacturados(),
            loadInsumos()
        ]);
    };

    /**
     * Cargar todas las promociones
     */
    const loadPromociones = async () => {
        try {
            setLoading(true);
            const data = await fetchPromociones();
            const promocionesConEstado = data.map(promocion => ({
                ...promocion,
                estado: getEstadoPromocion(promocion)
            }));
            setPromociones(promocionesConEstado);
            setError(null);
        } catch (err) {
            console.error("Error al cargar promociones:", err);
            setError("Error al cargar las promociones");
            setPromociones([]);
        } finally {
            setLoading(false);
        }
    };

    
    // Limpiar filtros de fechas y estado
    const clearFilters = () => {
        setFechaInicio("");
        setFechaFin("");
        setEstado("");
    };

    // Filtrar promociones por rango de fechas y estado
    type PromocionConEstado = PromocionApi & { estado: string };
    const promocionesFiltradas = (promociones as PromocionConEstado[]).filter(p => {
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;
        const fechaPromo = new Date(p.fechaInicio);
        if (inicio && fechaPromo < inicio) return false;
        if (fin && fechaPromo > fin) return false;
        if (estado && p.estado !== estado) return false;
        return true;
    });

    /**
     * Cargar artículos manufacturados activos
     */
    const loadArticulosManufacturados = async () => {
        try {
            const response = await fetchArticulosManufacturados(0, 1000);
            const productosActivos = response.content.filter(art => art.estado === "Activo");
            setArticulosManufacturados(productosActivos);
        } catch (err) {
            console.error("Error al cargar artículos manufacturados:", err);
            setArticulosManufacturados([]);
        }
    };

    /**
     * Cargar insumos activos
     */
    const loadInsumos = async () => {
        try {
            const response = await fetchInsumos(0, 1000);
            const insumosActivos = response.content.filter(insumo => insumo.estado === "Activo");
            setInsumos(insumosActivos);
        } catch (err) {
            console.error("Error al cargar insumos:", err);
            setInsumos([]);
        }
    };

    /**
     * Determinar el estado de una promoción basado en fechas
     */
    const getLocalDateString = () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getEstadoPromocion = (promocion: PromocionApi): string => {
        // Usar la fecha local, no UTC
        const hoyStr = getLocalDateString();
        const inicioStr = promocion.fechaInicio.slice(0, 10);
        const finStr = promocion.fechaFin.slice(0, 10);

        if (hoyStr < inicioStr) return "Programada";
        if (hoyStr >= inicioStr && hoyStr <= finStr) return "Activa";
        return "Vencida";
    };

    /**
     * Calcular precio total con descuento basado en los detalles de UI
     */
    const calcularPrecioTotal = (detallesUI: any[], descuento: number): number => {
        const precioSinDescuento = detallesUI.reduce((total: number, detalleUI) => {
            const cantidad = Number(detalleUI.cantidad) || 1;
            let precio = 0;
    
            if (detalleUI.tipo === 'producto' && detalleUI.articuloManufacturadoId) {
                const producto = articulosManufacturados.find(
                    p => p.id === Number(detalleUI.articuloManufacturadoId)
                );
                precio = producto?.precioVenta || 0;
            } else if (detalleUI.tipo === 'insumo' && detalleUI.articuloInsumoId) {
                const insumo = insumos.find(
                    i => i.id === Number(detalleUI.articuloInsumoId)
                );
                precio = insumo?.precioVenta || 0;
            }
    
            return total + (precio * cantidad);
        }, 0);
    
        return Number((precioSinDescuento * (1 - descuento / 100)).toFixed(2));
    };

    /**
     * Formatear detalles del formulario para enviar al backend
     * Solo incluye el objeto que tiene un ID válido
     */
    const formatearDetallesParaAPI = (detallesUI: any[]) => {
        return detallesUI.map((detalleUI: any) => {
            const detalleAPI: PromocionDetalleApi = {
                cantidad: Number(detalleUI.cantidad)
            };

            // Solo incluir el objeto correspondiente al tipo seleccionado
            if (detalleUI.tipo === 'producto' && detalleUI.articuloManufacturadoId) {
                detalleAPI.articuloManufacturado = { 
                    id: Number(detalleUI.articuloManufacturadoId) 
                };
            } else if (detalleUI.tipo === 'insumo' && detalleUI.articuloInsumoId) {
                detalleAPI.articuloInsumo = { 
                    id: Number(detalleUI.articuloInsumoId) 
                };
            }
            
            return detalleAPI;
        }).filter((detalle: PromocionDetalleApi) => 
            detalle.articuloManufacturado || detalle.articuloInsumo
        );
    };

    /**
     * Crear una nueva promoción
     */
    const createNewPromocion = async (promocionData: any): Promise<boolean> => {
        try {
            setLoading(true);
            
            // Calcular el precio total con descuento
            const precioCalculado = calcularPrecioTotal(promocionData.detalles, promocionData.descuento);
            
            // Formatear detalles para la API
            const detallesFormateados = formatearDetallesParaAPI(promocionData.detalles);

            const promocionFinal = {
                fechaInicio: promocionData.fechaInicio,
                fechaFin: promocionData.fechaFin,
                descuento: Number(promocionData.descuento),
                precio: Number(precioCalculado.toFixed(2)),
                detalles: detallesFormateados
            };

            await createPromocion(promocionFinal);
            await loadPromociones(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error("Error al crear promoción:", err);
            setError("Error al crear promoción");
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar una promoción existente
     */
    const updateExistingPromocion = async (id: number, promocionData: any): Promise<boolean> => {
        try {
            setLoading(true);
            
            // Calcular el precio total con descuento
            const precioCalculado = calcularPrecioTotal(promocionData.detalles, promocionData.descuento);
            
            // Formatear detalles para la API
            const detallesFormateados = formatearDetallesParaAPI(promocionData.detalles);

            const promocionFinal = {
                fechaInicio: promocionData.fechaInicio,
                fechaFin: promocionData.fechaFin,
                descuento: Number(promocionData.descuento),
                precio: Number(precioCalculado.toFixed(2)),
                detalles: detallesFormateados
            };

            await updatePromocion(id, promocionFinal);
            await loadPromociones(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error(`Error al actualizar promoción ${id}:`, err);
            setError(`Error al actualizar promoción ${id}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar el envío de formulario (crear o editar)
     */
    const handleSubmit = async (
        id: number | null, 
        promocionData: any
    ): Promise<boolean> => {
        if (id === null) {
            return await createNewPromocion(promocionData);
        } else {
            return await updateExistingPromocion(id, promocionData);
        }
    };

    /**
     * Refrescar todos los datos
     */
    const refresh = async () => {
        await loadInitialData();
    };

    /**
     * Limpiar error
     */
    const clearError = () => setError(null);

    return {
        promociones,
        promocionesFiltradas,
        articulosManufacturados,
        insumos,
        loading,
        error,
        loadPromociones,
        createNewPromocion,
        updateExistingPromocion,
        handleSubmit,
        getEstadoPromocion,
        calcularPrecioTotal,
        refresh,
        loadInitialData,
        clearError,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        estado,
        setEstado,
        clearFilters,
    };
};

export default usePromociones;