import React, { useState } from "react";
import PromocionesTable from "./ui/PromocionesTable";
import PromocionModal from "./ui/PromocionModal";
import usePromociones from "./hooks/usePromociones";
import type { PromocionApi } from "../../types/adminTypes";
import styles from "./PromocionesSection.module.css";
import shared from "../../styles/common/Common.module.css";
import HeaderFilterPromociones from "./ui/HeaderFilterPromociones";

export const PromocionesSection: React.FC = () => {
    const {
        promocionesFiltradas,
        articulosManufacturados,
        insumos,
        loading,
        error,
        handleSubmit,
        clearError,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        estado,
        setEstado,
        clearFilters,
    } = usePromociones();

    // Estados para modales
    const [showPromocionModal, setShowPromocionModal] = useState(false);
    const [promocionToEdit, setPromocionToEdit] = useState<PromocionApi | null>(null);

    const handlePromocionSubmit = async (id: number | null, promocionData: any) => {
        try {
            const success = await handleSubmit(id, promocionData);
            if (success) {
                setShowPromocionModal(false);
                setPromocionToEdit(null);
                clearError();
            } else {
                throw new Error(`Error al ${id === null ? 'crear' : 'editar'} promoción`);
            }
        } catch (error) {
            console.error(`Error al ${id === null ? 'crear' : 'editar'} promoción:`, error);
            throw error;
        }
    };

    // Abrir modal para crear nueva promoción
    const handleNuevoClick = () => {
        setPromocionToEdit(null);
        setShowPromocionModal(true);
    };

    // Abrir modal para editar promoción
    const handleEditClick = (promocion: PromocionApi) => {
        setPromocionToEdit(promocion);
        setShowPromocionModal(true);
    };

    const handleClosePromocionModal = () => {
        setShowPromocionModal(false);
        setPromocionToEdit(null);
        clearError();
    };

    if (loading && promocionesFiltradas.length === 0) {
        return (
            <div className={`${shared.adminContent} ${styles.adminContent}`}>
                <div className={shared.adminContentSection}>
                    <div>Cargando promociones...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${shared.adminContent} ${styles.adminContent}`}>
            <div className={shared.adminContentSection}>
                <HeaderFilterPromociones
                    onNewClick={handleNuevoClick}
                    title="Administrador de promociones"
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    onFechaInicioChange={setFechaInicio}
                    onFechaFinChange={setFechaFin}
                    onClearFilters={clearFilters}
                    estado={estado}
                    onEstadoChange={setEstado}
                />
            </div>

            {error && (
                <div className={shared.error} style={{ marginBottom: '20px' }}>
                    {error}
                    <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
                </div>
            )}

            <PromocionesTable
                promociones={promocionesFiltradas}
                onEditPromocion={handleEditClick}
            />

            {/* Modal unificado para Crear/Editar Promoción */}
            <PromocionModal
                isOpen={showPromocionModal}
                onClose={handleClosePromocionModal}
                onSubmit={handlePromocionSubmit}
                promocion={promocionToEdit}
                articulosManufacturados={articulosManufacturados}
                insumos={insumos}
            />
        </div>
    );
};

export default PromocionesSection;