import { useState, useEffect } from 'react';
import { 
    InsumoApi, 
    RubroApi, 
    RegistroInsumoApi 
} from '../../../types/adminTypes';
import {
    fetchInsumos,
    patchEstadoInsumo,
    createInsumo,
    updateInsumo,
    fetchRubros,
    createRegistroInsumo
} from '../../../api/adminApi';

interface UseInsumosOptions {
    pageSize?: number;
    autoLoad?: boolean;
}


export const useInsumos = (options: UseInsumosOptions = {}) => {
    const { pageSize = 8, autoLoad = true } = options;

    // Estados principales
    const [insumos, setInsumos] = useState<InsumoApi[]>([]);
    const [rubros, setRubros] = useState<RubroApi[]>([]);
    
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

    // Cargar insumos cuando cambia la página o búsqueda
    useEffect(() => {
        if (autoLoad) {
            loadInsumos();
        }
    }, [currentPage, debouncedSearch, autoLoad]);

    // Cargar rubros solo una vez al inicio
    useEffect(() => {
        if (autoLoad) {
            loadRubros();
        }
    }, [autoLoad]);

    /**
     * Cargar rubros una sola vez
     */
    const loadRubros = async () => {
        try {
            setLoading(true);
            const rubrosData = await fetchRubros();
            setRubros(rubrosData);
            setError(null);
        } catch (err) {
            console.error("Error al cargar rubros:", err);
            setError("Error al cargar rubros");
            setRubros([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar insumos con paginación y búsqueda
     */
    const loadInsumos = async () => {
        try {
            setLoading(true);
            
            // Si hay búsqueda, filtrar en frontend
            if (debouncedSearch) {
                const allInsumos = await fetchInsumos(0, 100);
                
                const filtered = allInsumos.content.filter((item) =>
                    item.denominacion.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    (item.rubro?.denominacion?.toLowerCase() || "").includes(debouncedSearch.toLowerCase()) ||
                    String(item.stockActual).toLowerCase().includes(debouncedSearch.toLowerCase())
                );
                
                setInsumos(filtered);
                setTotalPages(Math.ceil(filtered.length / pageSize));
                setTotalElements(filtered.length);
            } else {
                // Si no hay búsqueda, usar paginación del backend
                const result = await fetchInsumos(currentPage, pageSize);
                setInsumos(result.content);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            }
            
            setError(null);
        } catch (err) {
            console.error("Error al cargar insumos:", err);
            setError("Error al cargar insumos");
            setInsumos([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Crear un nuevo insumo
     */
    const createNewInsumo = async (
        insumoData: {
            denominacion: string;
            unidadMedida: string;
            rubro: { id: string };
            precioCompra?: number;
            precioVenta?: number;
            esParaElaborar?: boolean;
        }, 
        imageFile?: File
    ): Promise<boolean> => {
        try {
            setLoading(true);
            
            const body = {
                denominacion: insumoData.denominacion,
                unidadMedida: insumoData.unidadMedida,
                rubro: insumoData.rubro,
                precioCompra: insumoData.precioCompra || 0,
                precioVenta: insumoData.precioVenta || 0,
                esParaElaborar: insumoData.esParaElaborar || false,
            };
            
            await createInsumo(body, imageFile);
            await loadInsumos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error("Error al crear insumo:", err);
            setError("Error al crear insumo");
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar un insumo existente
     */
    const updateExistingInsumo = async (
        id: number, 
        insumoData: any, 
        imageFile?: File
    ): Promise<boolean> => {
        try {
            setLoading(true);
            
            await updateInsumo(id, insumoData, imageFile);
            await loadInsumos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error(`Error al actualizar insumo ${id}:`, err);
            setError(`Error al actualizar insumo ${id}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cambiar el estado de un insumo (activo/inactivo)
     */
    const toggleEstadoInsumo = async (id: number): Promise<boolean> => {
        try {
            setLoading(true);
            await patchEstadoInsumo(id);
            await loadInsumos(); // Recargar la lista
            setError(null);
            return true;
        } catch (err) {
            console.error(`Error al cambiar estado del insumo ${id}:`, err);
            setError(`Error al cambiar estado del insumo ${id}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reponer stock de un insumo
     */
    const reponerStock = async (
        insumo: InsumoApi, 
        cantidad: number, 
        motivo: string
    ): Promise<boolean> => {
        try {
            setLoading(true);
            
            const registroData: RegistroInsumoApi = {
                cantidad: cantidad,
                tipoMovimiento: "INGRESO",
                motivo: motivo,
                articuloInsumo: { id: insumo.id },
                sucursal: { id: 1 },
            };
            
            await createRegistroInsumo(registroData);
            await loadInsumos(); // Recargar la lista para actualizar el stock
            setError(null);
            return true;
        } catch (err) {
            console.error("Error al reponer stock:", err);
            setError("Error al reponer stock");
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
        insumoData: any, 
        imageFile?: File
    ): Promise<boolean> => {
        if (id === null) {
            return await createNewInsumo(insumoData, imageFile);
        } else {
            return await updateExistingInsumo(id, insumoData, imageFile);
        }
    };

    /**
     * Cambiar página
     */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    /**
     * Obtener rubros principales (solo INSUMO y sin padre)
     */
    const getRubrosPrincipales = () => {
        return rubros.filter(r => r.tipoRubro === "INSUMO" && r.rubroPadre == null);
    };

    /**
     * Obtener subrubros según rubro seleccionado
     */
    const getSubRubros = (rubroPadreId: string | number) => {
        return rubros.filter(
            r => r.rubroPadre && r.rubroPadre.id === Number(rubroPadreId)
        );
    };

    /**
     * Obtener insumos para elaborar (solo activos y para elaborar)
     */
    const getInsumosParaElaborar = () => {
        return insumos.filter(i => i.esParaElaborar && i.estado === "Activo");
    };

    /**
     * Obtener insumos con stock bajo (menos de 1000 unidades)
     */
    const getInsumosStockBajo = () => {
        return insumos.filter(i => i.stockActual < 1000 && i.estado === "Activo");
    };

    /**
     * Obtener insumos sin stock
     */
    const getInsumosSinStock = () => {
        return insumos.filter(i => i.stockActual === 0 && i.estado === "Activo");
    };

    /**
     * Información de paginación
     */
    const getPaginationInfo = () => {
        return debouncedSearch
            ? `Mostrando ${insumos.length} resultados de búsqueda`
            : `Mostrando ${insumos.length} de ${totalElements} insumos`;
    };

    /**
     * Estadísticas de stock
     */
    const getStockStats = () => {
        const total = insumos.length;
        const sinStock = getInsumosSinStock().length;
        const stockBajo = getInsumosStockBajo().length;
        const stockNormal = total - sinStock - stockBajo;

        return {
            total,
            sinStock,
            stockBajo,
            stockNormal,
            porcentajeSinStock: total > 0 ? Math.round((sinStock / total) * 100) : 0,
            porcentajeStockBajo: total > 0 ? Math.round((stockBajo / total) * 100) : 0,
        };
    };

    /**
     * Refrescar todos los datos
     */
    const refresh = async () => {
        await Promise.all([loadRubros(), loadInsumos()]);
    };

    /**
     * Buscar insumo por ID
     */
    const findInsumoById = (id: number): InsumoApi | undefined => {
        return insumos.find(insumo => insumo.id === id);
    };

    /**
     * Buscar insumos por rubro
     */
    const findInsumosByRubro = (rubroId: number): InsumoApi[] => {
        return insumos.filter(insumo => insumo.rubro?.id === rubroId);
    };

    return {
        // Estados
        insumos,
        rubros,
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
        loadInsumos,
        createNewInsumo,
        updateExistingInsumo,
        toggleEstadoInsumo,
        reponerStock,
        handleSubmit,
        
        // Métodos de utilidad
        handlePageChange,
        getRubrosPrincipales,
        getSubRubros,
        getInsumosParaElaborar,
        getInsumosStockBajo,
        getInsumosSinStock,
        getPaginationInfo,
        getStockStats,
        refresh,
        loadRubros,
        findInsumoById,
        findInsumosByRubro,
        
        // Métodos de control de error
        clearError: () => setError(null),
    };
};

export default useInsumos;