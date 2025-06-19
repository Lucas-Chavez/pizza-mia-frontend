import React, { useState } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import iconEdit from "../../../assets/icons/icon-edit.svg";
import { PromocionApi } from "../../../types/adminTypes";
import shared from "../../../styles/common/Common.module.css";
import iconRecipe from "../../../assets/icons/icon-recipe.svg";
import { VerItemModal } from "./VerItemModal";
import usePromociones from "../hooks/usePromociones";

interface PromocionesTableProps {
    promociones: PromocionApi[];
    onEditPromocion: (promocion: PromocionApi) => void;
}

export const PromocionesTable: React.FC<PromocionesTableProps> = ({
    promociones,
    onEditPromocion,
}) => {
    // Obtener productos e insumos activos para mostrar info detallada
    const { articulosManufacturados, insumos } = usePromociones(); 

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPromocion, setSelectedPromocion] = useState<PromocionApi | null>(null);

    const columns = [
        {
            header: "Fecha Inicio",
            key: "fechaInicio",
            render: (value: string) => {
                const date = new Date(value);
                date.setHours(date.getHours() + 3);
                return date.toLocaleDateString('es-AR');
            }
        },
        {
            header: "Fecha Fin",
            key: "fechaFin",
            render: (value: string) => {
                const date = new Date(value);
                date.setHours(date.getHours() + 3);
                return date.toLocaleDateString('es-AR');
            }
        },
        {
            header: "Descuento",
            key: "descuento",
            render: (value: number) => `${value}%`
        },
        {
            header: "Precio Final",
            key: "precio",
            render: (value: number | undefined) =>
                typeof value === "number"
                    ? `$${value.toFixed(2)}`
                    : "No calculado"
        },
        {
            header: "Items",
            key: "cantidadItems",
            render: (_: any, row: PromocionApi) => (
                <button
                    className={shared.actionButton}
                    onClick={() => {
                        setSelectedPromocion(row);
                        setModalOpen(true);
                    }}
                    type="button"
                >
                    <img src={iconRecipe} 
                    alt="Ver items" 
                    className={shared.actionIcon} />
                </button>
            )
        },
        {
            header: "Estado",
            key: "estado",
            render: (value: string) => {
                let color = "#5ACD40"; // Activa - verde
                if (value === "Programada") color = "#4A90E2"; // Programada - azul
                else if (value === "Vencida") color = "#D64C4C"; // Vencida - rojo

                return (
                    <span
                        style={{
                            color: color,
                            fontWeight: 600,
                        }}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            header: "Editar",
            key: "editar",
            render: (_: any, row: PromocionApi) => (
                <button
                    className={shared.actionButton}
                    onClick={() => onEditPromocion(row)}
                    type="button"
                >
                    <img
                        src={iconEdit}
                        alt="Editar"
                        className={shared.actionIcon}
                    />
                </button>
            ),
        },
    ];

    return (
        <>
            <GenericTable columns={columns} data={promociones} />
            {modalOpen && selectedPromocion && (
                <VerItemModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    promocion={selectedPromocion}
                    articulosManufacturados={articulosManufacturados}
                    insumos={insumos}
                />
            )}
        </>
    );
};

export default PromocionesTable;