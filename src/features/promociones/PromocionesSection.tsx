import React, { useState } from "react";
import PromocionesTable from "./ui/PromocionesTable";
import PromocionModal from "./ui/PromocionModal";
import usePromociones from "./hooks/usePromociones";
import type { PromocionApi } from "../../types/adminTypes";
import styles from "./PromocionesSection.module.css";
import shared from "../../styles/common/Common.module.css";
import Button from "../../components/Button/Button";

export const PromocionesSection: React.FC = () => {
    const {
        promociones,
        articulosManufacturados,
        insumos,
        loading,
        error,
        handleSubmit,
        clearError
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

    if (loading && promociones.length === 0) {
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
                <p>Administrador de promociones</p>
                <div className={styles.buttonConteiner}>
                    <Button
                        label="Nuevo +"
                        onClick={handleNuevoClick}
                        className={shared.nuevoButton}
                    />
                </div>
            </div>

            {error && (
                <div className={shared.error} style={{ marginBottom: '20px' }}>
                    {error}
                    <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
                </div>
            )}

            <PromocionesTable
                promociones={promociones}
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