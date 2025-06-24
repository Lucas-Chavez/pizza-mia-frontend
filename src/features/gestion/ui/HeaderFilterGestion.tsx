import React from "react";
import Button from "../../../components/Button/Button";
import styles from "../GestionSection.module.css";
import shared from "../../../styles/common/Common.module.css";
import { EstadoApi } from "../../../types/adminTypes";

interface HeaderFilterGestionProps {
    title: string;
    estado: string;
    onEstadoChange: (value: string) => void;
    cantidad: number;
    onCantidadChange: (value: number) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onNewClick: () => void;
    estados: EstadoApi[]; // Recibir los estados desde el componente padre
}

// ...existing imports...
export const HeaderFilterGestion: React.FC<HeaderFilterGestionProps> = ({
    title,
    estado,
    onEstadoChange,
    cantidad,
    onCantidadChange,
    search,
    onSearchChange,
    onNewClick,
    estados
}) => {
    return (
        <div className={styles.headerGestionContainer}>
            <div className={styles.headerGestionTitleRow}>
                <p className={styles.headerGestionTitle}>{title}</p>
            </div>
            <div className={styles.headerGestionFiltersRow}>
                <div className={styles.headerGestionFiltersLeft}>
                    <span className={styles.headerGestionLabel}>Pedidos</span>
                    <select
                        className={styles.headerGestionSelect}
                        value={estado}
                        onChange={e => onEstadoChange(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {estados.map(estado => (
                            <option key={estado.id} value={estado.denominacion}>
                                {estado.denominacion}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className={styles.headerGestionInput}
                        placeholder="Buscar pedido..."
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>
                <div className={styles.headerGestionFiltersRight}>
                    <select
                        className={styles.headerGestionSelect}
                        value={cantidad}
                        onChange={e => onCantidadChange(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <Button
                        label="Nuevo +"
                        onClick={onNewClick}
                        className={shared.nuevoButton}
                    />
                </div>
            </div>
        </div>
    );
};

