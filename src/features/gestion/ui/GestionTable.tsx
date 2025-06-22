import React, { useState } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import iconMore from "../../../assets/icons/more-actions.svg";
import iconEdit from "../../../assets/icons/icon-edit.svg";
import iconRecipe from "../../../assets/icons/icon-recipe.svg";
import shared from "../../../styles/common/Common.module.css";
import styles from "../GestionSection.module.css";


// Type para PedidoDetalle
export type PedidoDetalle = {
    id: number;
    cantidad: number;
    subTotal?: number;
    articuloInsumo?: {
        id: number;
        denominacion: string;
        precioVenta: number;
    };
    articuloManufacturado?: {
        id: number;
        denominacion: string;
        precioVenta: number;
    };
    promocion?: {
        id: number;
        descuento: number;
    };
};

export type Pedido = {
    id: number;
    horaEstimadaFinalizacion: string; // ISO string para fechas
    total?: number;
    totalCosto?: number;
    estado: {
        id: number;
        nombre: string;
    };
    tipoEnvio: 'DOMICILIO' | 'RETIRO_LOCAL'; // Enum
    tipoPago: 'EFECTIVO' | 'TARJETA'; // Enum
    detalles: PedidoDetalle[];
    cliente: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
    };
    empleado: {
        id: number;
        nombre: string;
        apellido: string;
    };
};

interface GestionTableProps {
    pedidos: Pedido[];
    onEdit: (pedido: Pedido) => void;
    onVerReceta: (pedido: Pedido) => void;
}

const estadoBadge = (estado: string) => {
    let color = "#999";
    if (estado === "En Preparacion") color = "#FAAE42";
    else if (estado === "Pendiente") color = "#D64C4C";
    else if (estado === "Entregado") color = "#5ACD40";
    else if (estado === "En Camino") color = "#4A90E2";
    return (
        <span
            className={styles.estadoBadge}
            style={{ background: color }}
        >
            {estado}
        </span>
    );
};

export const GestionTable: React.FC<GestionTableProps> = ({
    pedidos,
    onEdit,
    onVerReceta,
}) => {
    const [modalIndex, setModalIndex] = useState<number | null>(null);
    const columns = [
        {
            header: "Seleccionar",
            key: "seleccion",
            render: () => <input type="checkbox" />,
        },
        {
            header: "ID",
            key: "id",
            render: (value: number) => `#${value}`,
        },
        {
            header: "Nombre",
            key: "cliente",
            render: (_: any, row: Pedido) => `${row.cliente.nombre} ${row.cliente.apellido}`,
        },
        {
            header: "Fecha",
            key: "horaEstimadaFinalizacion",
            render: (value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-AR");
            },
        },
        {
            header: "Total",
            key: "total",
            render: (value: number) => `$${value?.toFixed(2)}`,
        },
        {
            header: "Estado",
            key: "estado",
            render: (_: any, row: Pedido) => estadoBadge(row.estado.nombre),
        },
        {
            header: "Acciones",
            key: "acciones",
            render: (_: any, row: Pedido, rowIndex: number) => (
                <div style={{ position: "relative" }}>
                    <button
                        className={shared.actionButton}
                        onClick={() => setModalIndex(modalIndex === rowIndex ? null : rowIndex)}
                        type="button"
                    >
                        <img
                            src={iconMore}
                            alt="Acciones"
                            className={shared.actionIcon}
                        />
                    </button>
                    {modalIndex === rowIndex && (
                        <div className={styles.accionesModal}>
                            <button
                                className={styles.accionBtn}
                                onClick={() => {
                                    onEdit(row);
                                    setModalIndex(null);
                                }}
                            >
                                <img src={iconEdit} alt="Editar" />
                            </button>
                            <button
                                className={styles.accionBtn}
                                onClick={() => {
                                    onVerReceta(row);
                                    setModalIndex(null);
                                }}
                            >
                                <img src={iconRecipe} alt="Ver Receta" />
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <GenericTable
            columns={columns}
            data={pedidos}
            className={styles.gestionTableContainer}
        />
    );
};

export default GestionTable;