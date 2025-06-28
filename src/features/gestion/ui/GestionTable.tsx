import React, { useState } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import iconMore from "../../../assets/icons/more-actions.svg";
import iconEdit from "../../../assets/icons/icon-edit.svg";
import iconRecipe from "../../../assets/icons/icon-recipe.svg";
import shared from "../../../styles/common/Common.module.css";
import styles from "../GestionSection.module.css";
import { PedidoVentaApi, EstadoApi } from "../../../types/adminTypes";
import pedidoEstadoService from "../../../services/pedidoEstadoService";

interface GestionTableProps {
    pedidos: PedidoVentaApi[];
    onEdit: (pedido: PedidoVentaApi) => void;
    onVerReceta: (pedido: PedidoVentaApi) => void;
    onEstadoChange?: (pedidoId: number, nuevoEstadoId: number, estadoActualId: number) => void;
    estados: EstadoApi[];
    userRol: string | null;
}

// Componente para mostrar badge de estado
const EstadoBadge: React.FC<{
  denominacion: string;
  onClick?: () => void;
}> = ({ denominacion, onClick }) => {
  let color = "#999";
  
    // Asignar colores según el estado
    switch (denominacion) {
        case "EN PREPARACION": color = "#FAAE42"; break;
        case "EN ESPERA": color = "#D64C4C"; break;
        case "LISTO": color = "#5ACD40"; break;
        case "EN COCINA": color = "#4A90E2"; break;
        case "FACTURADO": color = "#8A2BE2"; break;
        case "CANCELADO": color = "#FF6B6B"; break;
        case "EN DELIVERY": color = "#FF9800"; break;  // Naranja para en delivery
        case "ENTREGADO": color = "#009688"; break;    // Verde azulado para entregado
    }
  
  return (
    <span
      className={`${styles.estadoBadge} ${onClick ? styles.estadoBadgeClickable : ''}`}
      style={{ background: color }}
      onClick={onClick}
    >
      {denominacion}
    </span>
  );
};

export const GestionTable: React.FC<GestionTableProps> = ({
    pedidos,
    onEdit,
    onVerReceta,
    onEstadoChange,
    estados,
    userRol
}) => {
    const [modalIndex, setModalIndex] = useState<number | null>(null);
    const [estadoModalIndex, setEstadoModalIndex] = useState<number | null>(null);
    
    // Verificar si el usuario puede editar un estado específico
    const puedeEditarEstado = (estadoActual: string): boolean => {
      const estadosDisponibles = pedidoEstadoService.getEstadosDisponibles(
        estadoActual, userRol, estados
      );
      return estadosDisponibles.length > 0;
    };
    
    // Mostrar/ocultar el modal de estados
    const handleEstadoClick = (index: number, pedido: PedidoVentaApi) => {
      if (puedeEditarEstado(pedido.estado.denominacion)) {
        setEstadoModalIndex(estadoModalIndex === index ? null : index);
      }
    };
    
    // Manejar cambio de estado
    const handleEstadoChange = (pedidoId: number, nuevoEstadoId: number, estadoActualId: number) => {
      if (onEstadoChange) {
        onEstadoChange(pedidoId, nuevoEstadoId, estadoActualId);
        setEstadoModalIndex(null); // Cerrar modal
      }
    };
    
    // Obtener estados disponibles para cambio
    const getEstadosDisponibles = (estadoActual: string): EstadoApi[] => {
      return pedidoEstadoService.getEstadosDisponibles(estadoActual, userRol, estados);
    };

    // Definición de columnas
    const columns = [
        {
            header: "ID",
            key: "id",
            render: (value: number) => `#${value}`,
        },
        {
            header: "Cliente",
            key: "cliente",
            render: (_: any, row: PedidoVentaApi) => `${row.cliente.nombre} ${row.cliente.apellido}`,
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
            render: (value: number) => `$${value?.toFixed(2) || "0.00"}`,
        },
        {
            header: "Estado",
            key: "estado",
            render: (_: any, row: PedidoVentaApi, rowIndex: number) => (
                <div className={styles.estadoContainer}>
                    <EstadoBadge 
                        denominacion={row.estado.denominacion}
                        onClick={puedeEditarEstado(row.estado.denominacion) 
                        ? () => handleEstadoClick(rowIndex, row) 
                        : undefined}
                    />
                    
                    {estadoModalIndex === rowIndex && (
                        <div className={styles.estadoOptionsModal}>
                            {getEstadosDisponibles(row.estado.denominacion).map(estado => (
                                <div 
                                    key={estado.id}
                                    className={styles.estadoOption}
                                    onClick={() => handleEstadoChange(row.id, estado.id, row.estado.id)}
                                >
                                    <EstadoBadge denominacion={estado.denominacion} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: "Acciones",
            key: "acciones",
            render: (_: any, row: PedidoVentaApi, rowIndex: number) => (
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
        <>
            {pedidos.length === 0 ? (
                <div className={styles.emptyMessage}>
                    No hay pedidos para mostrar con los filtros actuales
                </div>
            ) : (
                <GenericTable
                    columns={columns}
                    data={pedidos}
                    className={`adminContent ${styles.gestionTableContainer}`}
                />
            )}
        </>
    );
};

export default GestionTable;