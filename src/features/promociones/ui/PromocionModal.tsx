import React, { useState, useEffect } from "react";
import { PromocionApi, ArticuloManufacturadoApi, InsumoApi } from "../../../types/adminTypes";
import styles from "../PromocionesSection.module.css";
import shared from "../../../styles/common/Common.module.css";

interface PromocionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number | null, promocionData: any) => Promise<void>;
    promocion?: PromocionApi | null;
    articulosManufacturados: ArticuloManufacturadoApi[];
    insumos: InsumoApi[];
}

export const PromocionModal: React.FC<PromocionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    promocion = null,
    articulosManufacturados,
    insumos,
}) => {
    const isEditMode = !!promocion;
    
    const [formData, setFormData] = useState<any>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && promocion) {
                // Modo edición - cargar datos de la promoción
                setFormData({
                    fechaInicio: promocion.fechaInicio.split('T')[0], // Formato YYYY-MM-DD para input date
                    fechaFin: promocion.fechaFin.split('T')[0],
                    descuento: promocion.descuento,
                    detalles: promocion.detalles.map(detalle => {
                        // Determinar el tipo basado en cuál objeto tiene ID válido
                        if (detalle.articuloManufacturado && detalle.articuloManufacturado.id > 0) {
                            return {
                                tipo: 'producto',
                                articuloManufacturadoId: detalle.articuloManufacturado.id.toString(),
                                articuloInsumoId: "",
                                cantidad: detalle.cantidad || 1
                            };
                        } else if (detalle.articuloInsumo && detalle.articuloInsumo.id > 0) {
                            return {
                                tipo: 'insumo',
                                articuloManufacturadoId: "",
                                articuloInsumoId: detalle.articuloInsumo.id.toString(),
                                cantidad: detalle.cantidad || 1
                            };
                        }
                        // Fallback - defaultear a producto
                        return {
                            tipo: 'producto',
                            articuloManufacturadoId: "",
                            articuloInsumoId: "",
                            cantidad: 1
                        };
                    })
                });
            } else {
                // Modo creación - formulario vacío
                setFormData({
                    fechaInicio: "",
                    fechaFin: "",
                    descuento: "",
                    detalles: []
                });
            }
            setError("");
        }
    }, [isOpen, isEditMode, promocion]);

    const handleAddDetalle = () => {
        setFormData({
            ...formData,
            detalles: [
                ...formData.detalles,
                { 
                    tipo: 'producto', 
                    articuloManufacturadoId: "", 
                    articuloInsumoId: "", 
                    cantidad: 1 
                }
            ]
        });
    };

    const handleRemoveDetalle = (index: number) => {
        const newDetalles = formData.detalles.filter((_: any, i: number) => i !== index);
        setFormData({
            ...formData,
            detalles: newDetalles
        });
    };

    const handleDetalleChange = (index: number, field: string, value: any) => {
        const newDetalles = [...formData.detalles];
        
        if (field === 'tipo') {
            // Resetear IDs cuando cambia el tipo
            newDetalles[index] = {
                ...newDetalles[index],
                tipo: value,
                articuloManufacturadoId: "",
                articuloInsumoId: ""
            };
        } else {
            newDetalles[index] = {
                ...newDetalles[index],
                [field]: value
            };
        }
        
        setFormData({
            ...formData,
            detalles: newDetalles
        });
    };

    const calcularPrecioTotal = (): number => {
        if (!formData || !formData.detalles || !formData.descuento) return 0;
        
        const precioSinDescuento = formData.detalles.reduce((total: number, detalle: any) => {
            const cantidad = detalle.cantidad || 1;
            let precio = 0;
            
            if (detalle.tipo === 'producto' && detalle.articuloManufacturadoId) {
                const producto = articulosManufacturados.find(p => p.id === parseInt(detalle.articuloManufacturadoId));
                precio = producto?.precioVenta || 0;
            } else if (detalle.tipo === 'insumo' && detalle.articuloInsumoId) {
                const insumo = insumos.find(i => i.id === parseInt(detalle.articuloInsumoId));
                precio = insumo?.precioVenta || 0;
            }
            
            return total + (precio * cantidad);
        }, 0);

        return precioSinDescuento * (1 - Number(formData.descuento) / 100);
    };
    
    const handleSubmit = async () => {
        // Validaciones básicas
        if (!formData.fechaInicio) {
            setError("La fecha de inicio es obligatoria");
            return;
        }
        if (!formData.fechaFin) {
            setError("La fecha de fin es obligatoria");
            return;
        }
        if (!formData.descuento || formData.descuento <= 0 || formData.descuento > 100) {
            setError("El descuento debe ser entre 1 y 100");
            return;
        }
        if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
            setError("La fecha de fin debe ser posterior a la fecha de inicio");
            return;
        }
        if (formData.detalles.length === 0) {
            setError("Debe agregar al menos un producto o insumo a la promoción");
            return;
        }
        
        // Validar fechas no sean en el pasado para nuevas promociones
        if (!isEditMode) {
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            const hoyStr = `${yyyy}-${mm}-${dd}`;

            // formData.fechaInicio ya está en formato YYYY-MM-DD
            if (formData.fechaInicio < hoyStr) {
                setError("La fecha de inicio no puede ser anterior a hoy");
                return;
            }
        }
        
        // Validar que todos los detalles tengan producto o insumo seleccionado
        for (let i = 0; i < formData.detalles.length; i++) {
            const detalle = formData.detalles[i];
            
            if (detalle.tipo === 'producto' && !detalle.articuloManufacturadoId) {
                setError(`Debe seleccionar un producto en la fila ${i + 1}`);
                return;
            }
            if (detalle.tipo === 'insumo' && !detalle.articuloInsumoId) {
                setError(`Debe seleccionar un insumo en la fila ${i + 1}`);
                return;
            }
            if (detalle.tipo === 'producto' && detalle.articuloInsumoId) {
                setError(`No puede tener ambos tipos de artículo en la fila ${i + 1}`);
                return;
            }
            if (detalle.tipo === 'insumo' && detalle.articuloManufacturadoId) {
                setError(`No puede tener ambos tipos de artículo en la fila ${i + 1}`);
                return;
            }
            if (!detalle.cantidad || detalle.cantidad <= 0) {
                setError(`La cantidad debe ser mayor a 0 en la fila ${i + 1}`);
                return;
            }
        }

        setIsLoading(true);
        try {
            const promocionData = {
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                descuento: Number(formData.descuento),
                detalles: formData.detalles
            };
            
            console.log("📋 Datos del formulario antes de enviar:", JSON.stringify(promocionData, null, 2));
            
            await onSubmit(isEditMode ? promocion!.id : null, promocionData);
            onClose();
        } catch (err) {
            console.error("Error en el modal:", err);
            setError(`Error al ${isEditMode ? 'editar' : 'crear'} la promoción: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setIsLoading(false);
        }
    };


    const handleClose = () => {
        setError("");
        onClose();
    };

    if (!isOpen || !formData) return null;

    const precioCalculado = calcularPrecioTotal();

    return (
        <div className={shared.modalOverlay}>
            <div className={`${shared.modalContent} ${styles.modalContent}`} style={{ minWidth: 900, maxWidth: 1100 }}>
                <h2>{isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
                
                <div style={{ display: "flex", gap: 24, width: "100%" }}>
                    {/* Columna 1: Datos básicos */}
                    <div className={styles.editarModalCol}>
                        <label>Fecha de Inicio:</label>
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="date"
                            value={formData.fechaInicio}
                            onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                            disabled={isLoading}
                        />
                        
                        <label>Fecha de Fin:</label>
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="date"
                            value={formData.fechaFin}
                            onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                            disabled={isLoading}
                        />
                        
                        <label>Descuento (%):</label>
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Descuento en porcentaje"
                            value={formData.descuento}
                            onChange={e => setFormData({ ...formData, descuento: e.target.value })}
                            disabled={isLoading}
                        />
                        
                        <label>Precio Total Calculado:</label>
                        <div style={{ 
                            padding: "12px 16px", 
                            border: "2px solid #4CAF50",
                            borderRadius: "8px",
                            backgroundColor: "#f8f9fa",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#2E7D32"
                        }}>
                            ${precioCalculado.toFixed(2)}
                        </div>
                    </div>
                    
                    {/* Columna 2: Productos e insumos de la promoción */}
                    <div className={styles.editarModalCol} style={{ flex: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label>Productos e Insumos de la Promoción:</label>
                            <button
                                type="button"
                                className={shared.nuevoButton}
                                onClick={handleAddDetalle}
                                disabled={isLoading}
                                style={{ fontSize: "14px", padding: "8px 16px" }}
                            >
                                + Agregar Item
                            </button>
                        </div>
                        
                        <div className={styles.detallesContainer}>
                            {formData.detalles.map((detalle: any, index: number) => (
                                <div key={index} className={styles.detalleRow}>
                                    <select
                                        className={`${shared.input} ${styles.input}`}
                                        value={detalle.tipo}
                                        onChange={e => handleDetalleChange(index, 'tipo', e.target.value)}
                                        disabled={isLoading}
                                        style={{ flex: 1, maxWidth: "120px" }}
                                    >
                                        <option value="producto">Producto</option>
                                        <option value="insumo">Insumo</option>
                                    </select>
                                    
                                    {detalle.tipo === 'producto' ? (
                                        <select
                                            className={`${shared.input} ${styles.input}`}
                                            value={detalle.articuloManufacturadoId}
                                            onChange={e => handleDetalleChange(index, 'articuloManufacturadoId', e.target.value)}
                                            disabled={isLoading}
                                            style={{ flex: 2 }}
                                        >
                                            <option value="">Seleccione un producto</option>
                                            {articulosManufacturados.map(articulo => (
                                                <option key={articulo.id} value={articulo.id}>
                                                    {articulo.denominacion} - ${articulo.precioVenta?.toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            className={`${shared.input} ${styles.input}`}
                                            value={detalle.articuloInsumoId}
                                            onChange={e => handleDetalleChange(index, 'articuloInsumoId', e.target.value)}
                                            disabled={isLoading}
                                            style={{ flex: 2 }}
                                        >
                                            <option value="">Seleccione un insumo</option>
                                            {insumos.map(insumo => (
                                                <option key={insumo.id} value={insumo.id}>
                                                    {insumo.denominacion} - ${insumo.precioVenta?.toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    
                                    <input
                                        className={`${shared.input} ${styles.input}`}
                                        type="number"
                                        min="1"
                                        placeholder="Cant."
                                        value={detalle.cantidad}
                                        onChange={e => handleDetalleChange(index, 'cantidad', Number(e.target.value))}
                                        disabled={isLoading}
                                        style={{ flex: 1, maxWidth: "80px" }}
                                    />
                                    
                                    <button
                                        type="button"
                                        className={shared.salirButton}
                                        onClick={() => handleRemoveDetalle(index)}
                                        disabled={isLoading}
                                        style={{ fontSize: "12px", padding: "6px 10px" }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            
                            {formData.detalles.length === 0 && (
                                <div className={styles.noDetalles}>
                                    No hay items agregados. Haga clic en "Agregar Item" para comenzar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {error && <div className={shared.error}>{error}</div>}
                
                <div className={shared.modalActions}>
                    <button
                        className={shared.enviarButton}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (isEditMode ? "Guardando..." : "Creando...") : "Confirmar"}
                    </button>
                    <button
                        className={shared.salirButton}
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromocionModal;