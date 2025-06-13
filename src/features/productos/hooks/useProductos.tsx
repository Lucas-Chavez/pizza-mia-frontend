import { useState, useEffect } from 'react';
import { 
    ArticuloManufacturadoApi, 
    RubroApi, 
    InsumoApi 
} from '../../../types/adminTypes';
import {
    fetchArticulosManufacturados,
    patchEstadoArticuloManufacturado,
    createArticuloManufacturado,
    updateArticuloManufacturado,
    fetchArticuloManufacturadoById,
    fetchRubros,
    fetchInsumos
} from '../../../api/adminApi';

interface UseProductosOptions {
    pageSize?: number;
    autoLoad?: boolean;
}


export const useProductos = (options: UseProductosOptions = {}) => {
    const { pageSize = 8, autoLoad = true } = options;

    // Estados principales
    const [productos, setProductos] = useState<ArticuloManufacturadoApi[]>([]);
    const [rubros, setRubros] = useState<RubroApi[]>([]);
    const [insumos, setInsumos] = useState<InsumoApi[]>([]);
    
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    
    // Estados de búsqueda
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    // Estados de carga y error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efecto para demorar la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(0); // Resetear a la primera página al buscar
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    // Cargar productos cuando cambia la página o búsqueda
    useEffect(() => {
        if (autoLoad) {
            loadProductos();
        }
    }, [currentPage, debouncedSearch, autoLoad]);

    // Cargar datos iniciales (rubros e insumos)
    useEffect(() => {
        if (autoLoad) {
            loadInitialData();
        }
    }, [autoLoad]);

    /**
     * Cargar datos iniciales (rubros e insumos)
     */
    const loadInitialData = async () => {
        try {
            setLoading(true);
            
            // Cargar rubros
            const rubrosData = await fetchRubros();
            setRubros(rubrosData);
            
            // Cargar insumos (todos los insumos activos)
            const insumosResult = await fetchInsumos(0, 1000);
            const insumosActivos = insumosResult.content.filter(i => i.fechaBaja === null);
            setInsumos(insumosActivos);
            
            setError(null);
        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
            setError("Error al cargar datos iniciales");
            setRubros([]);
            setInsumos([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar productos con paginación y búsqueda
     */
    const loadProductos = async () => {
        try {
            setLoading(true);
            
            // Si hay búsqueda, filtrar en frontend
            if (debouncedSearch) {
                const allProductos = await fetchArticulosManufacturados(0, 100);
                
                const filtered = allProductos.content.filter((item) =>
                    item.denominacion.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    (item.rubro?.denominacion?.toLowerCase() || "").includes(debouncedSearch.toLowerCase()) ||
                    item.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase())
                );
                
                setProductos(filtered);
                setTotalPages(Math.ceil(filtered.length / pageSize));
                setTotalElements(filtered.length);
            } else {
                // Si no hay búsqueda, usar paginación del backend
                const result = await fetchArticulosManufacturados(currentPage, pageSize);
                setProductos(result.content);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            }
            
            setError(null);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError("Error al cargar productos");
            setProductos([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Obtener un producto por ID
     */
    const getProductoById = async (id: number): Promise<ArticuloManufacturadoApi | null> => {
        try {
            const producto = await fetchArticuloManufacturadoById(id);
            return producto;
        } catch (err) {
            console.error(`Error al obtener producto ${id}:`, err);
            setError(`Error al obtener producto ${id}`);
            return null;
        }
    };

    /**
     * Crear un nuevo producto
     */
    const createProducto = async (
        productoData: {
            denominacion: string;
            descripcion: string;
            tiempoEstimadoProduccion: number;
            rubro: string | { id: string | number };
            detalles: any[];
            precioVenta?: number;
        }, 
        imageFile?: File
    ): Promise<boolean> => {
        try {
            setLoading(true);
            
            const body = {
                denominacion: productoData.denominacion,
                descripcion: productoData.descripcion,
                tiempoEstimadoProduccion: productoData.tiempoEstimadoProduccion,
                rubro: typeof productoData.rubro === 'string' ? { id: productoData.rubro } : productoData.rubro,
                detalles: productoData.detalles,
                ...(productoData.precioVenta !== undefined && { precioVenta: productoData.precioVenta })
            };
            
            await createArticuloManufacturado(body, imageFile);
            await loadProductos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error("Error al crear producto:", err);
            setError("Error al crear producto");
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar un producto existente
     */
    const updateProducto = async (
        id: number, 
        productoData: any, 
        imageFile?: File
    ): Promise<boolean> => {
        try {
            setLoading(true);
            
            // Enviar directamente los datos sin modificar la estructura del rubro
            console.log('Datos recibidos en updateProducto:', productoData);
            
            await updateArticuloManufacturado(id, productoData, imageFile);
            await loadProductos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error(`Error al actualizar producto ${id}:`, err);
            setError(`Error al actualizar producto ${id}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cambiar el estado de un producto (activo/inactivo)
     */
    const toggleEstadoProducto = async (id: number): Promise<boolean> => {
        try {
            setLoading(true);
            await patchEstadoArticuloManufacturado(id);
            await loadProductos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error(`Error al cambiar estado del producto ${id}:`, err);
            setError(`Error al cambiar estado del producto ${id}`);
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
        productoData: any, 
        imageFile?: File
    ): Promise<boolean> => {
        if (id === null) {
            return await createProducto(productoData, imageFile);
        } else {
            return await updateProducto(id, productoData, imageFile);
        }
    };

    /**
     * Cambiar página
     */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    /**
     * Obtener rubros principales (solo MANUFACTURADO)
     */
    const getRubrosPrincipales = () => {
        return rubros.filter(r => r.tipoRubro === "MANUFACTURADO");
    };

    /**
     * Obtener insumos para elaborar (solo activos y para elaborar)
     */
    const getInsumosParaElaborar = () => {
        return insumos.filter(i => i.esParaElaborar && i.estado === "Activo");
    };

    /**
     * Información de paginación
     */
    const getPaginationInfo = () => {
        return debouncedSearch
            ? `Mostrando ${productos.length} resultados de búsqueda`
            : `Mostrando ${productos.length} de ${totalElements} productos`;
    };

    /**
     * Refrescar todos los datos
     */
    const refresh = async () => {
        await Promise.all([loadInitialData(), loadProductos()]);
    };

    return {
        // Estados
        productos,
        rubros,
        insumos,
        loading,
        error,
        
        // Estados de paginación
        currentPage,
        totalPages,
        totalElements,
        
        // Estados de búsqueda
        search,
        setSearch,
        debouncedSearch,
        
        // Métodos CRUD
        loadProductos,
        getProductoById,
        createProducto,
        updateProducto,
        toggleEstadoProducto,
        handleSubmit,
        
        // Métodos de utilidad
        handlePageChange,
        getRubrosPrincipales,
        getInsumosParaElaborar,
        getPaginationInfo,
        refresh,
        loadInitialData,
        
        // Métodos de control de error
        clearError: () => setError(null),
    };
};

export default useProductos;