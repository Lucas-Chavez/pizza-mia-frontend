import React, { useState } from "react";
import InsumosTable from "./ui/InsumosTable";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import InsumoModal from "./ui/InsumoModal";
import ReponerStockModal from "./ui/ReponerStockModal";
import Pagination from "../../components/Pagination/Pagination";
import useInsumos from "./hooks/useInsumos";
import type { InsumoApi } from "../../types/adminTypes";
import styles from "./InsumosSection.module.css";
import shared from "../../styles/common/Common.module.css";

export const InsumosSection: React.FC = () => {
    const {
        // Estados del hook
        insumos,
        rubros,
        loading,
        error,
        currentPage,
        totalPages,
        search,
        setSearch,
        
        // Métodos del hook
        handleSubmit,
        toggleEstadoInsumo,
        reponerStock,
        handlePageChange,
        getPaginationInfo,
        clearError
    } = useInsumos();
    
    // Estados para modales
    const [showInsumoModal, setShowInsumoModal] = useState(false);
    const [showReponerModal, setShowReponerModal] = useState(false);
    
    // Estados para datos de modales
    const [insumoToEdit, setInsumoToEdit] = useState<InsumoApi | null>(null);
    const [insumoToReponer, setInsumoToReponer] = useState<InsumoApi | null>(null);

    const handleToggleEstado = async (id: number) => {
        const success = await toggleEstadoInsumo(id);
        if (!success) {
            alert("Error al cambiar el estado del insumo");
        }
    };

    const handleInsumoSubmit = async (id: number | null, insumoData: any, imageFile?: File) => {
        try {
            const success = await handleSubmit(id, insumoData, imageFile);
            if (success) {
                setShowInsumoModal(false);
                setInsumoToEdit(null);
                clearError();
            } else {
                throw new Error(`Error al ${id === null ? 'crear' : 'editar'} insumo`);
            }
        } catch (error) {
            console.error(`Error al ${id === null ? 'crear' : 'editar'} insumo:`, error);
            throw error; // Re-lanzar el error para que el modal lo maneje
        }
    };

    const handleReponerStock = async (insumo: InsumoApi, cantidad: number, motivo: string) => {
        const success = await reponerStock(insumo, cantidad, motivo);
        if (success) {
            setShowReponerModal(false);
            setInsumoToReponer(null);
            clearError();
        } else {
            alert("Error al actualizar el stock");
        }
    };

    // Abrir modal para crear nuevo insumo
    const handleNuevoClick = () => {
        setInsumoToEdit(null);
        setShowInsumoModal(true);
    };

    // Abrir modal para editar insumo
    const handleEditClick = (insumo: InsumoApi) => {
        setInsumoToEdit(insumo);
        setShowInsumoModal(true);
    };

    const handleReponerClick = (insumo: InsumoApi) => {
        setInsumoToReponer(insumo);
        setShowReponerModal(true);
    };

    const handleCloseInsumoModal = () => {
        setShowInsumoModal(false);
        setInsumoToEdit(null);
        clearError();
    };

    const handleCloseReponerModal = () => {
        setShowReponerModal(false);
        setInsumoToReponer(null);
        clearError();
    };

    if (loading && insumos.length === 0) {
        return (
            <div className={`${shared.adminContent} ${styles.adminContent}`}>
                <div className={shared.adminContentSection}>
                    <div>Cargando insumos...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${shared.adminContent} ${styles.adminContent}`}>
            <div className={shared.adminContentSection}>
                <SearchHeader
                    onNewClick={handleNuevoClick}
                    title="Administrador de insumos"
                    search={search}
                    onSearchChange={setSearch}
                    placeholder="Buscar insumos..."
                />

                {error && (
                    <div className={shared.error} style={{ marginBottom: '20px' }}>
                        {error}
                        <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
                    </div>
                )}

                <InsumosTable
                    insumos={insumos}
                    onToggleEstado={handleToggleEstado}
                    onEditInsumo={handleEditClick}
                    onReponerStock={handleReponerClick}
                />
                
                <div className={shared.paginationContainer}>
                    <div className={shared.paginationInfo}>{getPaginationInfo()}</div>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Modal unificado para Crear/Editar Insumo */}
                <InsumoModal
                    isOpen={showInsumoModal}
                    onClose={handleCloseInsumoModal}
                    onSubmit={handleInsumoSubmit}
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