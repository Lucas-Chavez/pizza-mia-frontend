import React, { useMemo } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import { getGenericColumns } from "../../../components/GenericTable/getGenericColumns";
import iconAdd from "../../../assets/icons/icon-add.svg";
import { RubroTable, RubroApi } from "../../../types/adminTypes";
import shared from "../../../styles/common/Common.module.css";

interface GenericRubroTableProps {
    rubros: RubroTable[];
    rubrosApi: RubroApi[];
    onToggleEstado: (rowIndex: number) => void;
    onAddSubrubro: (padre: string) => void;
    onEditRubro: (rowIndex: number) => void;
    tipoRubro: "INSUMO" | "MANUFACTURADO";
}

const GenericRubroTable: React.FC<GenericRubroTableProps> = ({
    rubros,
    rubrosApi,
    onToggleEstado,
    onAddSubrubro,
    onEditRubro,
    tipoRubro
}) => {
    // Reorganizar rubros usando la información de rubrosApi para relaciones jerárquicas más precisas
    const organizedRubros = useMemo(() => {
        // Crear un mapa para acceder fácilmente a los objetos RubroTable por su id
        const rubroMap = new Map<string | number, RubroTable>();
        rubros.forEach(rubro => {
            rubroMap.set(rubro.id, rubro);
        });
        
        // Identificar los rubros padre (sin rubroPadre) del tipo especificado
        const padres = rubrosApi.filter(r => !r.rubroPadre && r.tipoRubro === tipoRubro);
        
        // Función recursiva para agregar padres y sus hijos en orden jerárquico
        const getHierarchy = (rubrosArr: RubroApi[]): RubroTable[] => {
            const result: RubroTable[] = [];
            
            // Para cada rubro padre
            rubrosArr.forEach(padre => {
                // Buscar la versión RubroTable de este rubro
                const padreTable = rubroMap.get(padre.id);
                if (padreTable) {
                    // Agregar el padre
                    result.push(padreTable);
                    
                    // Buscar sus hijos directos usando rubrosApi (solo del tipo especificado)
                    const hijos = rubrosApi.filter(r => 
                        r.rubroPadre && 
                        r.rubroPadre.id === padre.id && 
                        r.tipoRubro === tipoRubro
                    );
                        
                    // Si tiene hijos, procesarlos recursivamente
                    if (hijos.length > 0) {
                        // Convertir hijos de RubroApi a RubroTable
                        hijos.forEach(hijo => {
                            const hijoTable = rubroMap.get(hijo.id);
                            if (hijoTable) {
                                result.push(hijoTable);
                            }
                        });
                    }
                }
            });
            
            return result;
        };
        
        return getHierarchy(padres);
    }, [rubros, rubrosApi, tipoRubro]);

    // Crear un mapeo de índices originales a nuevos índices organizados
    const indexMap = useMemo(() => {
        const map = new Map<number, number>();
        organizedRubros.forEach((rubro, newIndex) => {
            const originalIndex = rubros.findIndex(r => r.id === rubro.id);
            if (originalIndex !== -1) {
                map.set(newIndex, originalIndex);
            }
        });
        return map;
    }, [organizedRubros, rubros]);

    const columns = [
        { 
            header: "Rubros", 
            key: "rubro",
            render: (value: string, row: RubroTable) => (
                <div style={{ 
                    paddingLeft: row.padre ? '20px' : '0', 
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {row.padre && <span style={{ marginRight: '5px' }}>↳</span>}
                    {value}
                </div>
            )
        },
        { header: "Padre", key: "padre", render: (value: string) => value || "-" },
        ...getGenericColumns({
            onAlta: (_row, rowIndex) => {
                const originalIndex = indexMap.get(rowIndex) ?? rowIndex;
                if (rubros[originalIndex].estado === "Inactivo") onToggleEstado(originalIndex);
            },
            onBaja: (_row, rowIndex) => {
                const originalIndex = indexMap.get(rowIndex) ?? rowIndex;
                if (rubros[originalIndex].estado === "Activo") onToggleEstado(originalIndex);
            },
            onEditar: (_row, rowIndex) => {
                const originalIndex = indexMap.get(rowIndex) ?? rowIndex;
                onEditRubro(originalIndex);
            },
            disabledAlta: row => row.estado === "Activo",
            disabledBaja: row => row.estado === "Inactivo",
        }),
        {
            header: "Sub-Rubro",
            key: "subrubro",
            render: (_: any, row: any) =>
                !row.padre ? (
                    <button
                        className={shared.actionButton}
                        onClick={() => onAddSubrubro(row.rubro)}
                        type="button"
                    >
                        <img src={iconAdd} alt="Agregar sub-rubro" className={shared.actionIcon} />
                    </button>
                ) : null,
        },
    ];

    return <GenericTable columns={columns} data={organizedRubros} />;
};

export default GenericRubroTable;