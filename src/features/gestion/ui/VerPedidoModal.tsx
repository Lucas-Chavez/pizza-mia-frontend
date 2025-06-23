import React from "react";
import { PedidoVentaApi, PedidoVentaDetalleApi } from "../../../types/adminTypes";
import shared from "../../../styles/common/Common.module.css";
import styles from "../GestionSection.module.css";

interface VerPedidoModalProps {
    open: boolean;
    onClose: () => void;
    pedido: PedidoVentaApi | null;
}

export const VerPedidoModal: React.FC<VerPedidoModalProps> = ({
    open,
    onClose,
    pedido
}) => {
    if (!open || !pedido) return null;

    // Calcular subtotal (sin descuentos)
    const subtotal = pedido.detalles.reduce((acc, detalle) => {
        // Usar directamente el subTotal que ya incluye la cantidad
        return acc + (detalle.subTotal || 0);
    }, 0);

    // Formatear fecha
    const formatearFecha = (fecha: string) => {
        try {
            const date = new Date(fecha);
            return date.toLocaleString('es-AR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return fecha || 'Fecha no disponible';
        }
    };

    return (
        <div className={shared.modalOverlay} onClick={onClose}>
            <div
                className={styles.verPedidoModalContent}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.verPedidoModalHeader}>
                    <h2>Detalles del Pedido #{pedido.id}</h2>
                    <span className={styles.estadoPedido}>{pedido.estado.denominacion}</span>
                </div>

                <div className={styles.verPedidoModalBody}>
                    <div className={styles.pedidoInfoSection}>
                        <h3>Información del Cliente</h3>
                        <div className={styles.pedidoInfoGrid}>
                            <div>
                                <strong>Cliente:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}
                            </div>
                            <div>
                                <strong>Teléfono:</strong> {pedido.cliente.telefono || 'No disponible'}
                            </div>
                            <div>
                                <strong>Email:</strong> {pedido.cliente.email || 'No disponible'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.pedidoInfoSection}>
                        <h3>Información del Pedido</h3>
                        <div className={styles.pedidoInfoGrid}>
                            <div>
                                <strong>Fecha:</strong> {formatearFecha(pedido.horaEstimadaFinalizacion)}
                            </div>
                            <div>
                                <strong>Hora estimada:</strong> {formatearFecha(pedido.horaEstimadaFinalizacion)}
                            </div>
                            <div>
                                <strong>Tipo envío:</strong> {pedido.tipoEnvio}
                            </div>
                            <div>
                                <strong>Forma de pago:</strong> {pedido.tipoPago || 'No especificada'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.pedidoInfoSection}>
                        <h3>Artículos del Pedido</h3>
                        <table className={styles.pedidoDetallesTable}>
                            <thead>
                                <tr>
                                    <th>Cantidad</th>
                                    <th>Artículo</th>
                                    <th>Precio U.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedido.detalles.map((detalle, idx) => (
                                    <tr key={idx}>
                                        <td>{detalle.cantidad}</td>
                                        <td>
                                            {getDenominacionArticulo(detalle)}
                                            {getDescripcionArticulo(detalle) && (
                                                <div className={styles.articuloDescripcion}>
                                                    {getDescripcionArticulo(detalle)}
                                                </div>
                                            )}
                                        </td>
                                        <td>${getPrecioUnitario(detalle)}</td>
                                        <td>${(detalle.subTotal || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pedidoTotales}>
                        <div className={styles.pedidoTotalItem}>
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {/* No hay campo de descuento en el tipo PedidoVentaApi */}
                        {/*
                        {pedido.descuentoTotal > 0 && (
                            <div className={styles.pedidoTotalItem}>
                                <span>Descuento:</span>
                                <span>-${pedido.descuentoTotal.toFixed(2)}</span>
                            </div>
                        )}
                        */}
                        {pedido.tipoEnvio === 'DELIVERY' && (
                            <div className={styles.pedidoTotalItem}>
                                <span>Costo de envío:</span>
                                <span>${((pedido.total || 0) - subtotal).toFixed(2)}</span>
                            </div>
                        )}
                        <div className={`${styles.pedidoTotalItem} ${styles.pedidoTotalFinal}`}>
                            <span>Total:</span>
                            <span>${(pedido.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.verPedidoModalFooter}>
                    <button className={shared.salirButton} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Funciones auxiliares para manejar el detalle del pedido
function getDenominacionArticulo(detalle: PedidoVentaDetalleApi): string {
    if (detalle.articuloManufacturado) {
        return detalle.articuloManufacturado.denominacion;
    } else if (detalle.articuloInsumo) {
        return detalle.articuloInsumo.denominacion;
    } else if (detalle.promocion) {
        return `Promoción #${detalle.promocion.id}`;
    }
    return 'Artículo no disponible';
}

function getDescripcionArticulo(detalle: PedidoVentaDetalleApi): string | null {
    if (detalle.articuloManufacturado) {
        return detalle.articuloManufacturado.descripcion;
    }
    return null;
}

function getPrecioUnitario(detalle: PedidoVentaDetalleApi): string {
    if (detalle.articuloManufacturado) {
        return detalle.articuloManufacturado.precioVenta.toFixed(2);
    } else if (detalle.articuloInsumo) {
        return detalle.articuloInsumo.precioVenta.toFixed(2);
    } else if (detalle.promocion && detalle.promocion.precio) {
        return detalle.promocion.precio.toFixed(2);
    } else if (detalle.subTotal && detalle.cantidad > 0) {
        return (detalle.subTotal / detalle.cantidad).toFixed(2);
    }
    return '0.00';
}

export default VerPedidoModal;