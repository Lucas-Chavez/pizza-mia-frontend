import React, { useState, useEffect, useRef } from "react";
import { ArticuloManufacturadoApi, RubroApi, InsumoApi, ArticuloManufacturadoDetalleApi } from "../../../types/adminTypes";
import styles from "../ProductosSection.module.css";
import shared from "../../../styles/common/Common.module.css";

interface ProductoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number | null, productoData: any, imageFile?: File) => Promise<void>;
    producto?: ArticuloManufacturadoApi | null; // Opcional - si existe es edición, si no es creación
    rubros: RubroApi[];
    insumos: InsumoApi[];
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    producto = null,
    rubros,
    insumos
}) => {
    const isEditMode = !!producto;
    
    const [formData, setFormData] = useState<any>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detalles, setDetalles] = useState<ArticuloManufacturadoDetalleApi[]>([]);
    const [nuevoDetalle, setNuevoDetalle] = useState({
        insumoId: "",
        cantidad: ""
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rubros principales (solo de tipo MANUFACTURADO)
    const rubrosPrincipales = rubros.filter(r => r.tipoRubro === "MANUFACTURADO");
    
    // Insumos filtrados (solo los que son para elaborar)
    const insumosParaElaborar = insumos.filter(i => i.esParaElaborar && i.estado === "Activo");

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && producto) {
                // Modo edición - cargar datos del producto
                setFormData({
                    ...producto,
                    rubro: producto.rubro?.id ? String(producto.rubro.id) : "",
                });
                
                // Inicializar detalles
                setDetalles(producto.detalles || []);
                
                // Si hay imagen, mostrarla en el preview
                if (producto.imagen?.urlImagen) {
                    setPreviewUrl(producto.imagen.urlImagen);
                } else {
                    setPreviewUrl(null);
                }
            } else {
                // Modo creación - formulario vacío
                setFormData({
                    denominacion: "",
                    descripcion: "",
                    tiempoEstimadoProduccion: "",
                    precioVenta: "",
                    rubro: "",
                });
                setDetalles([]);
                setPreviewUrl(null);
            }
            
            setSelectedFile(null);
            setError("");
            setNuevoDetalle({ insumoId: "", cantidad: "" });
        }
    }, [isOpen, isEditMode, producto]);

    const calcularPrecioCosto = () => {
        return detalles.reduce((total, detalle) => {
            const precioInsumo = detalle.articuloInsumo.precioCompra || 0;
            return total + (precioInsumo * detalle.cantidad);
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDetalle = () => {
        if (!nuevoDetalle.insumoId || !nuevoDetalle.cantidad || isNaN(Number(nuevoDetalle.cantidad)) || Number(nuevoDetalle.cantidad) <= 0) {
            setError("Debe seleccionar un insumo y una cantidad válida");
            return;
        }

        const insumoSeleccionado = insumos.find(i => i.id === Number(nuevoDetalle.insumoId));
        if (!insumoSeleccionado) {
            setError("Insumo no encontrado");
            return;
        }

        // Verificar si ya existe este insumo en los detalles
        const existe = detalles.some(d => d.articuloInsumo.id === Number(nuevoDetalle.insumoId));
        if (existe) {
            setError("Este insumo ya está en la lista");
            return;
        }

        const nuevoDetalleCompleto: ArticuloManufacturadoDetalleApi = {
            cantidad: Number(nuevoDetalle.cantidad),
            articuloInsumo: {
                id: Number(nuevoDetalle.insumoId),
                denominacion: insumoSeleccionado.denominacion,
                unidadMedida: insumoSeleccionado.unidadMedida,
                precioCompra: insumoSeleccionado.precioCompra
            }
        };

        setDetalles([...detalles, nuevoDetalleCompleto]);
        setNuevoDetalle({ insumoId: "", cantidad: "" });
        setError("");
    };

    const handleRemoveDetalle = (index: number) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles.splice(index, 1);
        setDetalles(nuevosDetalles);
    };

    const handleSubmit = async () => {
        // Validaciones comunes
        if (!formData.denominacion.trim()) {
            setError("El nombre del producto es obligatorio");
            return;
        }
        if (!formData.descripcion.trim()) {
            setError("La descripción es obligatoria");
            return;
        }
        if (!formData.rubro) {
            setError("Debe seleccionar un rubro");
            return;
        }
        if (formData.tiempoEstimadoProduccion === "" || 
            isNaN(Number(formData.tiempoEstimadoProduccion)) || 
            Number(formData.tiempoEstimadoProduccion) <= 0) {
            setError("Debe ingresar un tiempo de preparación válido");
            return;
        }
        if (detalles.length === 0) {
            setError("Debe agregar al menos un ingrediente");
            return;
        }

        // Validaciones específicas por modo
        if (isEditMode) {
            if (formData.precioVenta === "" || 
                isNaN(Number(formData.precioVenta)) || 
                Number(formData.precioVenta) <= 0) {
                setError("Debe ingresar un precio de venta válido");
                return;
            }
        } else {
            // En modo creación, la imagen es obligatoria
            if (!selectedFile) {
                setError("Debe seleccionar una imagen para el producto");
                return;
            }
        }

        setIsLoading(true);
        try {
            let productoData;
            
            if (isEditMode) {
                // Estructura para edición
                productoData = {
                    denominacion: formData.denominacion,
                    descripcion: formData.descripcion,
                    precioVenta: Number(formData.precioVenta),
                    tiempoEstimadoProduccion: Number(formData.tiempoEstimadoProduccion),
                    rubro: { id: formData.rubro },
                    detalles: detalles.map(d => ({
                        cantidad: d.cantidad,
                        articuloInsumo: { id: d.articuloInsumo.id }
                    })),
                    // Mantener la imagen existente solo si no se seleccionó una nueva
                    imagen: !selectedFile && formData.imagen?.id ? { 
                        id: formData.imagen.id,
                        urlImagen: formData.imagen.urlImagen 
                    } : undefined
                };
            } else {
                // Estructura para creación
                productoData = {
                    denominacion: formData.denominacion,
                    descripcion: formData.descripcion,
                    tiempoEstimadoProduccion: Number(formData.tiempoEstimadoProduccion),
                    rubro: formData.rubro,
                    detalles: detalles.map(d => ({
                        cantidad: d.cantidad,
                        articuloInsumo: { id: d.articuloInsumo.id }
                    }))
                };
            }
            
            await onSubmit(isEditMode ? formData.id : null, productoData, selectedFile || undefined);
            onClose();
        } catch (err) {
            setError(`Error al ${isEditMode ? 'editar' : 'crear'} el producto`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setError("");
        onClose();
    };

    if (!isOpen || !formData) return null;

    return (
        <div className={shared.modalOverlay}>
            <div className={`${shared.modalContent} ${styles.modalContent}`} style={{ minWidth: 700, maxWidth: 900 }}>
                <h2>{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                
                <div className={styles.nuevoProductoGrid}>
                    {/* Columna 1: Datos principales */}
                    <div className={styles.nuevoProductoCol}>
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="text"
                            placeholder="Nombre del producto"
                            value={formData.denominacion}
                            onChange={e => setFormData({ ...formData, denominacion: e.target.value })}
                            disabled={isLoading}
                        />
                        <textarea
                            className={`${shared.input} ${styles.textArea}`}
                            placeholder="Descripción del producto"
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            disabled={isLoading}
                            rows={3}
                        />
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="number"
                            placeholder="Tiempo de preparación (min)"
                            value={formData.tiempoEstimadoProduccion}
                            onChange={e => setFormData({ ...formData, tiempoEstimadoProduccion: e.target.value })}
                            disabled={isLoading}
                        />
                        <select
                            className={`${shared.input} ${styles.input}`}
                            value={formData.rubro}
                            onChange={e => setFormData({ ...formData, rubro: e.target.value })}
                            disabled={isLoading}
                        >
                            <option value="">Seleccione un rubro</option>
                            {rubrosPrincipales.map(r => (
                                <option key={r.id} value={r.id}>{r.denominacion}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Columna 2: Ingredientes */}
                    <div className={styles.nuevoProductoCol}>
                        <div className={styles.agregarIngredienteForm}>
                            <select
                                className={`${shared.input} ${styles.input}`}
                                value={nuevoDetalle.insumoId}
                                onChange={e => setNuevoDetalle({ ...nuevoDetalle, insumoId: e.target.value })}
                                disabled={isLoading}
                            >
                                <option value="">Seleccione un insumo</option>
                                {insumosParaElaborar.map(insumo => (
                                    <option key={insumo.id} value={insumo.id}>
                                        {insumo.denominacion} ({insumo.unidadMedida})
                                    </option>
                                ))}
                            </select>
                            <input
                                className={`${shared.input} ${styles.input}`}
                                type="number"
                                placeholder="Cantidad"
                                value={nuevoDetalle.cantidad}
                                onChange={e => setNuevoDetalle({ ...nuevoDetalle, cantidad: e.target.value })}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={styles.addIngredienteButton}
                                onClick={handleAddDetalle}
                                disabled={isLoading}
                            >
                                Agregar
                            </button>
                            <h3 className={styles.ingredientesTitle}>Ingredientes</h3>
                            <div className={styles.ingredientesList}>
                                {detalles.length === 0 ? (
                                    <p className={styles.noIngredientes}>No hay ingredientes agregados</p>
                                ) : (
                                    detalles.map((detalle, index) => (
                                        <div key={index} className={styles.ingredienteItem}>
                                            <div className={styles.ingredienteInfo}>
                                                <span className={styles.ingredienteNombre}>
                                                    {detalle.articuloInsumo.denominacion}
                                                </span>
                                                <input
                                                    className={styles.ingredienteCantidad}
                                                    type="number"
                                                    min={1}
                                                    value={detalle.cantidad}
                                                    onChange={e => {
                                                        const nuevosDetalles = [...detalles];
                                                        nuevosDetalles[index] = {
                                                            ...nuevosDetalles[index],
                                                            cantidad: Number(e.target.value)
                                                        };
                                                        setDetalles(nuevosDetalles);
                                                    }}
                                                    style={{ width: 60, marginLeft: 8 }}
                                                    disabled={isLoading}
                                                />
                                                <span style={{ marginLeft: 4 }}>
                                                    {detalle.articuloInsumo.unidadMedida?.toLowerCase()}
                                                </span>
                                            </div>
                                            <button 
                                                type="button"
                                                className={styles.removeIngredienteButton}
                                                onClick={() => handleRemoveDetalle(index)}
                                                disabled={isLoading}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className={styles.costoInfo}>
                                <p>Costo total de ingredientes: ${calcularPrecioCosto().toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Columna 3: Imagen */}
                    <div className={styles.nuevoProductoCol} style={{ alignItems: "center", justifyContent: "center" }}>
                        <div className={styles.imageUploadContainer}>
                            <div className={styles.imagePreviewArea}>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Vista previa"
                                        className={styles.imagePreview}
                                    />
                                ) : (
                                    <div className={styles.noImagePlaceholder}>
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={styles.selectImageButton}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                {isEditMode ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                            </button>
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

export default ProductoModal;