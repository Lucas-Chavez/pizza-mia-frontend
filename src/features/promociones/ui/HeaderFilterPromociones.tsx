import React from "react";
import Button from "../../../components/Button/Button";
import styles from "../PromocionesSection.module.css";
import shared from "../../../styles/common/Common.module.css";

interface HeaderFilterPromocionesProps {
    onNewClick: () => void;
    title: string;
    fechaInicio: string;
    fechaFin: string;
    onFechaInicioChange: (value: string) => void;
    onFechaFinChange: (value: string) => void;
    onClearFilters?: () => void;
    estado: string; // NUEVO
    onEstadoChange: (value: string) => void; // NUEVO
}
// ...existing code...
export const HeaderFilterPromociones: React.FC<HeaderFilterPromocionesProps> = ({
    onNewClick,
    title,
    fechaInicio,
    fechaFin,
    onFechaInicioChange,
    onFechaFinChange,
    onClearFilters,
    estado, // NUEVO
    onEstadoChange // NUEVO
}) => {
    return (
        <div className={styles.headerFilterContainer}>
            <div className={styles.headerFilterTopRow}>
                <div className={styles.headerFilterButtonRow}>
                    <Button
                        label="Nuevo +"
                        onClick={onNewClick}
                        className={shared.nuevoButton}
                    />
                </div>
                <div className={styles.headerFilterTitleRow}>
                    <p className={styles.headerFilterTitle}>{title}</p>
                </div>
            </div>
            <div className={styles.headerFilterFiltersRow}>
                {/* Filtro por estado */}
                <span className={styles.headerFilterLabel} style={{ marginTop: '18px' }}>
                    Estado:
                </span>
                <select
                    className={styles.headerFilterDateInput}
                    style={{ minWidth: 120, marginTop: '18px' }}
                    value={estado}
                    onChange={e => onEstadoChange(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="Activa">Activa</option>
                    <option value="Programada">Programada</option>
                    <option value="Vencida">Vencida</option>
                </select>
                <span 
                className={styles.headerFilterLabel}
                style={{ marginTop: '18px' }}>
                    Filtrar por fecha de inicio:
                </span>
                <div className={styles.headerFilterDateGroup}>
                    <label className={styles.headerFilterDateLabel}>Desde:</label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={e => onFechaInicioChange(e.target.value)}
                        className={styles.headerFilterDateInput}
                        placeholder="Desde"
                    />
                </div>
                <div className={styles.headerFilterDateGroup}>
                    <label className={styles.headerFilterDateLabel}>Hasta:</label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={e => onFechaFinChange(e.target.value)}
                        className={styles.headerFilterDateInput}
                        placeholder="Hasta"
                    />
                </div>
                <button
                    type="button"
                    className={shared.salirButton}
                    style={{ marginTop: '18px' }}
                    onClick={onClearFilters}
                    disabled={!fechaInicio && !fechaFin}
                >
                    Borrar filtro
                </button>
            </div>
        </div>
    );
};

export default HeaderFilterPromociones;