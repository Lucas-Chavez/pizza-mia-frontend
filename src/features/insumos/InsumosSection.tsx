import React, { useState, useEffect } from "react";
import type { InsumoApi, RegistroInsumoApi, RubroApi } from "../../types/adminTypes";
import { fetchInsumos, patchEstadoInsumo, createInsumo, updateInsumo, fetchRubros, createRegistroInsumo } from "../../api/adminApi";
import InsumosTable from "./ui/InsumosTable";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import NuevoInsumoModal from "./ui/NuevoInsumoModal";
import EditarInsumoModal from "./ui/EditarInsumoModal";
import ReponerStockModal from "./ui/ReponerStockModal";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./InsumosSection.module.css";
import shared from "../../styles/common/Common.module.css";

export const InsumosSection: React.FC = () => {
    const [insumos, setInsumos] = useState<InsumoApi[]>([]);
    const [rubros, setRubros] = useState<RubroApi[]>([]);
    const [search, setSearch] = useState("");
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    
    // Estados para modales
    const [showNuevoModal, setShowNuevoModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReponerModal, setShowReponerModal] = useState(false);
    
    // Estados para datos de modales
    const [insumoToEdit, setInsumoToEdit] = useState<InsumoApi | null>(null);
    const [insumoToReponer, setInsumoToReponer] = useState<InsumoApi | null>(null);
    
    // Estado para búsqueda demorada
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Efecto para demorar la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(0); // Resetear a la primera página al buscar
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        loadData();
    }, [currentPage, debouncedSearch]);

    // Cargar datos de rubros solo una vez al inicio
    useEffect(() => {
        const loadRubros = async () => {
            try {
                const rubrosData = await fetchRubros();
                setRubros(rubrosData);
            } catch (error) {
                console.error("Error al cargar rubros:", error);
                setRubros([]);
            }
        };
        
        loadRubros();
    }, []);

    const loadData = async () => {
        try {
            // Si hay búsqueda, filtrar en frontend (más sencillo que implementar búsqueda en backend)
            if (debouncedSearch) {
                const allInsumos = await fetchInsumos(0, 100); // Obtener más insumos para búsqueda
                
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
        } catch (error) {
            console.error("Error al cargar insumos:", error);
            setInsumos([]);
            setTotalPages(1);
            setTotalElements(0);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleEstado = async (id: number) => {
        try {
            await patchEstadoInsumo(id);
            await loadData(); // Recargar datos después del cambio
        } catch (error) {
            alert("Error al cambiar el estado del insumo");
        }
    };

    const handleNuevoInsumo = async (
        insumoData: {
            denominacion: string;
            rubro: string;
            subRubro: string;
            unidadMedida: string;
        },
        imageFile?: File
    ) => {
        const body = {
            denominacion: insumoData.denominacion,
            unidadMedida: insumoData.unidadMedida,
            rubro: { id: insumoData.subRubro || insumoData.rubro },
            precioCompra: 0,
            precioVenta: 0,
            esParaElaborar: false,
        };
        await createInsumo(body, imageFile);
        await loadData(); // Recargar datos después de crear
    };

    const handleEditarInsumo = async (id: number, insumoData: any, imageFile?: File) => {
        await updateInsumo(id, insumoData, imageFile);
        await loadData(); // Recargar datos después de editar
    };

    const handleReponerStock = async (insumo: InsumoApi, cantidad: number, motivo: string) => {
        try {
            // Creamos el objeto RegistroInsumo
            const registroData: RegistroInsumoApi = {
                cantidad: cantidad,
                tipoMovimiento: "INGRESO", // Asumiendo que reponer es un ingreso
                motivo: motivo,
                articuloInsumo: { id: insumo.id },
                sucursal: { id: 1 }, // Deberías obtener la sucursal activa del usuario o del sistema
            };
            
            // Llamamos a la API para registrar el movimiento
            await createRegistroInsumo(registroData);
            
            // Refrescamos los insumos para obtener el stock actualizado
            await loadData();
            
        } catch (error) {
            console.error("Error al reponer stock:", error);
            alert("Error al actualizar el stock");
        }
    };

    const handleEditClick = (insumo: InsumoApi) => {
        setInsumoToEdit(insumo);
        setShowEditModal(true);
    };

    const handleReponerClick = (insumo: InsumoApi) => {
        setInsumoToReponer(insumo);
        setShowReponerModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setInsumoToEdit(null);
    };

    const handleCloseReponerModal = () => {
        setShowReponerModal(false);
        setInsumoToReponer(null);
    };

    // Mostrar información sobre paginación
    const paginationInfo = debouncedSearch
        ? `Mostrando ${insumos.length} resultados de búsqueda`
        : `Mostrando ${insumos.length} de ${totalElements} insumos`;

    return (
        <div className={`${shared.adminContent} ${styles.adminContent}`}>
            <div className={shared.adminContentSection}>
                <SearchHeader
                    onNewClick={() => setShowNuevoModal(true)}
                    title="Administrador de insumos"
                    search={search}
                    onSearchChange={setSearch}
                    placeholder="Buscar insumos..."
                />

                <InsumosTable
                    insumos={insumos}
                    onToggleEstado={handleToggleEstado}
                    onEditInsumo={handleEditClick}
                    onReponerStock={handleReponerClick}
                />
                
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>{paginationInfo}</div>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Modal Nuevo Insumo */}
                <NuevoInsumoModal
                    isOpen={showNuevoModal}
                    onClose={() => setShowNuevoModal(false)}
                    onSubmit={handleNuevoInsumo}
                    rubros={rubros}
                />

                {/* Modal Editar Insumo */}
                <EditarInsumoModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onSubmit={handleEditarInsumo}
                    insumo={insumoToEdit}
                    rubros={rubros}
                />

                {/* Modal Reponer Stock */}
                <ReponerStockModal
                    isOpen={showReponerModal}
                    onClose={handleCloseReponerModal}
                    onSubmit={handleReponerStock}
                    insumo={insumoToReponer}
                />
            </div>
        </div>
    );
};

export default InsumosSection;