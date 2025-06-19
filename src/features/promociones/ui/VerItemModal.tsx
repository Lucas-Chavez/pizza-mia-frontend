import React from "react";
import { PromocionApi, ArticuloManufacturadoApi, InsumoApi } from "../../../types/adminTypes";
import shared from "../../../styles/common/Common.module.css";
import styles from "../PromocionesSection.module.css";

interface VerItemModalProps {
    open: boolean;
    onClose: () => void;
    promocion: PromocionApi;
    articulosManufacturados: ArticuloManufacturadoApi[];
    insumos: InsumoApi[];
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

export const VerItemModal: React.FC<VerItemModalProps> = ({
    open,
    onClose,
    promocion,
    articulosManufacturados,
    insumos
}) => {
    if (!open || !promocion) return null;

    // Enriquecer detalles con info de la API
    const productos = promocion.detalles
        .filter(d => d.articuloManufacturado && d.articuloManufacturado.id > 0)
        .map(d => {
            const prod = articulosManufacturados.find(p => p.id === d.articuloManufacturado?.id);
            return prod
                ? {
                    cantidad: d.cantidad,
                    denominacion: prod.denominacion,
                    descripcion: prod.descripcion,
                    precioVenta: prod.precioVenta,
                    unidad: "u"
                }
                : null;
        })
        .filter(Boolean);

    const insumosPromo = promocion.detalles
        .filter(d => d.articuloInsumo && d.articuloInsumo.id > 0)
        .map(d => {
            const insumo = insumos.find(i => i.id === d.articuloInsumo?.id);
            return insumo
                ? {
                    cantidad: d.cantidad,
                    denominacion: insumo.denominacion,
                    unidad: unidadMedidaLabel(insumo.unidadMedida),
                    precioVenta: insumo.precioVenta
                }
                : null;
        })
        .filter(Boolean);

    return (
        <div className={shared.modalOverlay} onClick={onClose}>
            <div
                className={styles.verItemModalContent}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.verItemModalTitle}>
                    <h2>Items de la Promoción</h2>
                </div>
                <div className={styles.verItemScrollable}>
                    <div>
                        <strong>Productos:</strong>
                        {productos.length === 0 ? (
                            <div className={styles.verItemEmpty}>No hay productos en esta promoción.</div>
                        ) : (
                            <ul className={styles.verItemList}>
                                {productos.map((p: any, idx) => (
                                    <li key={idx}>
                                        <span className={styles.verItemLabel}>{p.denominacion}</span>
                                        <span>
                                            <span className={styles.verItemCantidad}>{p.cantidad} {p.unidad}</span>
                                            <span className={styles.verItemPrecio}>${p.precioVenta?.toFixed(2)}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <strong>Insumos:</strong>
                        {insumosPromo.length === 0 ? (
                            <div className={styles.verItemEmpty}>No hay insumos en esta promoción.</div>
                        ) : (
                            <ul className={styles.verItemList}>
                                {insumosPromo.map((i: any, idx) => (
                                    <li key={idx}>
                                        <span className={styles.verItemLabel}>{i.denominacion}</span>
                                        <span>
                                            <span className={styles.verItemCantidad}>{i.cantidad} {i.unidad}</span>
                                            <span className={styles.verItemPrecio}>${i.precioVenta?.toFixed(2)}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div style={{ textAlign: "right"}}>
                    <button className={shared.salirButton} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};