import { useState, useEffect } from "react";
import { 
    fetchRubrosTable, 
    patchEstadoRubro, 
    fetchRubros, 
    createRubro, 
    updateRubro 
} from "../../../api/adminApi";
import { RubroTable, RubroApi } from "../../../types/adminTypes";

export const useRubrosGeneric = (tipoRubro: "INSUMO" | "MANUFACTURADO") => {
    const [rubros, setRubros] = useState<RubroTable[]>([]);
    const [rubrosApi, setRubrosApi] = useState<RubroApi[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [tableData, apiData] = await Promise.all([
                fetchRubrosTable(),
                fetchRubros()
            ]);
            setRubros(tableData);
            setRubrosApi(apiData);
        } catch (error) {
            console.error("Error loading rubros:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async (rowIndex: number) => {
        const rubro = rubros[rowIndex];
        try {
            await patchEstadoRubro(rubro.id);
            await loadData();
        } catch (error) {
            console.error("Error changing estado:", error);
            throw error;
        }
    };

    /**
     * Función unificada para crear y editar rubros
     */
    const handleRubroSubmit = async (
        id: string | number | null, 
        rubroData: {
            denominacion: string;
            tipoRubro: string;
            rubroPadre?: { id: string | number } | null;
        }
    ) => {
        try {
            if (id === null) {
                // Modo creación
                await createRubro(rubroData);
            } else {
                // Modo edición
                await updateRubro(id, rubroData);
            }
            await loadData();
        } catch (error) {
            console.error(`Error ${id === null ? 'creating' : 'updating'} rubro:`, error);
            throw error;
        }
    };

    // Mantener las funciones anteriores para compatibilidad
    const handleCreateRubro = async (rubroData: {
        denominacion: string;
        tipoRubro?: string;
        rubroPadre?: { id: string | number } | null;
    }) => {
        const dataToSend = {
            ...rubroData,
            tipoRubro: rubroData.tipoRubro || tipoRubro
        };
        
        return handleRubroSubmit(null, dataToSend);
    };

    const handleUpdateRubro = async (id: number | string, rubroData: {
        denominacion: string;
        tipoRubro: string;
        rubroPadre?: { id: string | number } | null;
    }) => {
        return handleRubroSubmit(id, rubroData);
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        rubros,
        rubrosApi,
        loading,
        toggleEstado,
        handleCreateRubro,
        handleUpdateRubro,
        handleRubroSubmit, // Nueva función unificada
        loadData
    };
};