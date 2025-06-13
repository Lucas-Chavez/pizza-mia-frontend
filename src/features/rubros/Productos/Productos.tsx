import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import { useRubrosGeneric } from "../hooks/useRubros";
import shared from "../../../styles/common/Common.module.css";
import { RubroApi } from "../../../types/adminTypes";
import styles from "./Productos.module.css";

// Importar componentes
import GenericRubroTable from "../ui/GenericRubroTable";
import RubroModal from "../ui/RubroModal"; // Nuevo modal unificado

const Productos: React.FC = () => {
    const {
        rubros,
        rubrosApi,
        loading,
        toggleEstado,
        handleRubroSubmit
    } = useRubrosGeneric("MANUFACTURADO");

    const [showModal, setShowModal] = useState(false);
    const [currentPadre, setCurrentPadre] = useState("");
    const [rubroToEdit, setRubroToEdit] = useState<RubroApi | null>(null);

    // Función para crear nuevo rubro (padre o subrubro)
    const handleNuevoRubro = (padre: string) => {
        setCurrentPadre(padre);
        setRubroToEdit(null); // Modo creación
        setShowModal(true);
    };

    // Función para editar rubro existente
    const handleEditRubro = (rowIndex: number) => {
        const rubro = rubrosApi.find(r => r.id === rubros[rowIndex].id);
        if (rubro) {
            setRubroToEdit(rubro); // Modo edición
            setCurrentPadre(""); // No necesario en edición
            setShowModal(true);
        }
    };

    if (loading) {
        return <div className={shared.adminContent}>Cargando...</div>;
    }

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                <p>Administrador de rubros</p>
                <Button
                    label="Nuevo +"
                    onClick={() => handleNuevoRubro("")}
                    className={shared.nuevoButton}
                />
                <GenericRubroTable
                    rubros={rubros}
                    rubrosApi={rubrosApi}
                    onToggleEstado={toggleEstado}
                    onAddSubrubro={handleNuevoRubro}
                    onEditRubro={handleEditRubro}
                    tipoRubro="MANUFACTURADO"
                />

                {/* Modal Unificado para Crear/Editar Rubro */}
                <RubroModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setRubroToEdit(null);
                        setCurrentPadre("");
                    }}
                    onSubmit={handleRubroSubmit}
                    rubro={rubroToEdit}
                    rubrosApi={rubrosApi}
                    tipoRubroDefault="MANUFACTURADO"
                    modalStyles={styles}
                    padre={currentPadre}
                />
            </div>
        </div>
    );
};

export default Productos;