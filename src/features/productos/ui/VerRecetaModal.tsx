import React from "react";
import { ArticuloManufacturadoApi } from "../../../types/adminTypes";
import styles from "../ProductosSection.module.css";
import shared from "../../../styles/common/Common.module.css";

interface VerRecetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    producto: ArticuloManufacturadoApi | null;
}

const unidadMedidaLabel = (unidad: string | undefined) => {
    if (!unidad) return "";
    switch (unidad) {
        case "GRAMOS": return "gr";
        case "MILILITROS": return "ml";
        case "UNIDADES": return "u";
        default: return unidad.toLowerCase();
    }
};

export const VerRecetaModal: React.FC<VerRecetaModalProps> = ({
    isOpen,
    onClose,
    producto
}) => {
    if (!isOpen || !producto) return null;

    // Verificar si el producto tiene detalles
    const tieneDetalles = producto.detalles && Array.isArray(producto.detalles) && producto.detalles.length > 0;

    return (
        <div className={shared.modalOverlay} onClick={(e) => {
            // Cerrar el modal si se hace clic fuera del contenido
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={`${shared.modalContent} ${styles.recetaModalContent}`}>
                <div className={styles.recetaHeader}>
                    {producto.imagen?.urlImagen ? (
                        <div className={styles.recetaImageBackground} 
                            style={{backgroundImage: `url(${producto.imagen.urlImagen})`}}>
                        </div>
                    ) : (
                        <div className={styles.recetaImageBackground} 
                            style={{backgroundColor: '#FF8A00'}}>
                        </div>
                    )}
                    <div className={styles.recetaHeaderContent}>
                        <h2>{producto.denominacion}</h2>
                        <div className={styles.recetaTiempo}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{producto.tiempoEstimadoProduccion} minutos</span>
                        </div>
                    </div>
                </div>

                <div className={styles.recetaIngredientes}>
                    <h3>Ingredientes</h3>
                    {!tieneDetalles ? (
                        <p className={styles.noIngredientes}>No hay ingredientes registrados</p>
                    ) : (
                        <ul className={styles.ingredientesList}>
                            {producto.detalles.map((detalle, index) => (
                                <li key={index} className={styles.ingredienteRecetaItem}>
                                    <span className={styles.ingredienteNombre}>
                                        {detalle.articuloInsumo.denominacion}
                                    </span>
                                    <span className={styles.ingredienteCantidad}>
                                        {detalle.cantidad} {unidadMedidaLabel(detalle.articuloInsumo.unidadMedida)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {producto.descripcion && (
                        <div className={styles.recetaDescripcion}>
                            <h3>Descripción</h3>
                            <p>{producto.descripcion}</p>
                        </div>
                    )}
                </div>

                <div className={shared.modalActions}>
                    <button
                        className={shared.salirButton}
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerRecetaModal;