import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import { useRubrosGeneric } from "../hooks/useRubrosGeneric";
import shared from "../../../styles/common/Common.module.css";
import { RubroApi } from "../../../types/adminTypes";
import styles from "./Productos.module.css";

// Importar componentes genéricos
import GenericRubroTable from "../ui/GenericRubroTable";
import GenericRubroModal from "../ui/GenericRubroModal";
import GenericEditRubroModal from "../ui/GenericEditRubroModal";

const Productos: React.FC = () => {
    const {
        rubros,
        rubrosApi,
        loading,
        toggleEstado,
        handleCreateRubro,
        handleUpdateRubro
    } = useRubrosGeneric("MANUFACTURADO");

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPadre, setCurrentPadre] = useState("");
    const [rubroToEdit, setRubroToEdit] = useState<RubroApi | null>(null);

    const handleNuevoRubro = (padre: string) => {
        setCurrentPadre(padre);
        setShowModal(true);
    };

    const handleEditRubro = (rowIndex: number) => {
        const rubro = rubrosApi.find(r => r.id === rubros[rowIndex].id);
        if (rubro) {
            setRubroToEdit(rubro);
            setShowEditModal(true);
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

                <GenericRubroModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={async ({ denominacion }) => {
                        await handleCreateRubro({
                            denominacion,
                            rubroPadre: currentPadre 
                                ? { id: rubros.find(r => r.rubro === currentPadre)?.id || "" }
                                : undefined
                        });
                        setShowModal(false);
                    }}
                    padre={currentPadre}
                    modalStyles={styles}
                />

                <GenericEditRubroModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={async (rubroData) => {
                        if (rubroToEdit) {
                            await handleUpdateRubro(rubroToEdit.id, rubroData);
                            setShowEditModal(false);
                        }
                    }}
                    rubro={rubroToEdit}
                    rubrosApi={rubrosApi}
                    tipoRubroDefault="MANUFACTURADO"
                    modalStyles={styles}
                />
            </div>
        </div>
    );
};

export default Productos;