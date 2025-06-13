import React, { useState, useEffect, useRef } from "react";
import { InsumoApi, RubroApi } from "../../../types/adminTypes";
import styles from "../InsumosSection.module.css";
import shared from "../../../styles/common/Common.module.css";

interface InsumoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number | null, insumoData: any, imageFile?: File) => Promise<void>;
    insumo?: InsumoApi | null; // Opcional - si existe es edición, si no es creación
    rubros: RubroApi[];
}

const UNIDADES = [
    { value: "GRAMOS", label: "Gramos" },
    { value: "MILILITROS", label: "Mililitros" },
    { value: "UNIDADES", label: "Unidades" },
];

export const InsumoModal: React.FC<InsumoModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    insumo = null,
    rubros,
}) => {
    const isEditMode = !!insumo;
    
    const [formData, setFormData] = useState<any>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rubros principales (sin padre)
    const rubrosPrincipales = rubros.filter(r => r.tipoRubro === "INSUMO" && r.rubroPadre == null);
    
    // Subrubros según rubro seleccionado
    const subRubros = rubros.filter(
        r => r.rubroPadre && r.rubroPadre.id === Number(formData?.rubro)
    );

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && insumo) {
                // Modo edición - cargar datos del insumo
                setFormData({
                    ...insumo,
                    rubro: insumo.rubro?.id ? String(insumo.rubro.id) : "",
                    subRubro: "",
                    esParaElaborar: typeof insumo.esParaElaborar === "boolean" ? insumo.esParaElaborar : false,
                });

                // Si hay imagen, mostrarla en el preview
                if (insumo.imagen?.urlImagen) {
                    setPreviewUrl(insumo.imagen.urlImagen);
                } else {
                    setPreviewUrl(null);
                }
            } else {
                // Modo creación - formulario vacío con todos los campos
                setFormData({
                    denominacion: "",
                    rubro: "",
                    subRubro: "",
                    unidadMedida: "",
                    precioCompra: "",
                    precioVenta: "",
                    esParaElaborar: false,
                });
                setPreviewUrl(null);
            }
            
            setSelectedFile(null);
            setError("");
        }
    }, [isOpen, isEditMode, insumo]);

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

    const handleSubmit = async () => {
        // Validaciones comunes
        if (!formData.denominacion.trim()) {
            setError("El nombre del insumo es obligatorio");
            return;
        }
        if (!formData.rubro) {
            setError("Debe seleccionar un rubro");
            return;
        }
        if (!formData.unidadMedida) {
            setError("Debe seleccionar una unidad");
            return;
        }

        // Validaciones para ambos modos (creación y edición)
        if (formData.precioCompra !== "" && (isNaN(Number(formData.precioCompra)) || Number(formData.precioCompra) < 0)) {
            setError("Debe ingresar un precio de compra válido");
            return;
        }
        if (formData.precioVenta !== "" && (isNaN(Number(formData.precioVenta)) || Number(formData.precioVenta) < 0)) {
            setError("Debe ingresar un precio de venta válido");
            return;
        }

        setIsLoading(true);
        try {
            let insumoData;
            
            if (isEditMode) {
                // Estructura para edición
                insumoData = {
                    denominacion: formData.denominacion,
                    precioCompra: Number(formData.precioCompra) || 0,
                    precioVenta: Number(formData.precioVenta) || 0,
                    unidadMedida: formData.unidadMedida,
                    rubro: { id: formData.subRubro || formData.rubro },
                    esParaElaborar: formData.esParaElaborar,
                    stockActual: formData.stockActual,
                    // Mantener la imagen existente solo si no se seleccionó una nueva
                    imagen: !selectedFile && formData.imagen?.id ? {
                        id: formData.imagen.id,
                        urlImagen: formData.imagen.urlImagen
                    } : undefined
                };
            } else {
                // Estructura para creación - ahora incluye todos los campos
                insumoData = {
                    denominacion: formData.denominacion,
                    unidadMedida: formData.unidadMedida,
                    rubro: { id: formData.subRubro || formData.rubro },
                    precioCompra: Number(formData.precioCompra) || 0,
                    precioVenta: Number(formData.precioVenta) || 0,
                    esParaElaborar: formData.esParaElaborar,
                };
            }
            
            await onSubmit(isEditMode ? formData.id : null, insumoData, selectedFile || undefined);
            onClose();
        } catch (err) {
            setError(`Error al ${isEditMode ? 'editar' : 'crear'} el insumo`);
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
            <div className={`${shared.modalContent} ${styles.modalContent}`} style={{ minWidth: 800, maxWidth: 900 }}>
                <h2>{isEditMode ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
                <div style={{ display: "flex", gap: 24, width: "100%" }}>
                    {/* Columna 1 */}
                    <div className={styles.editarModalCol}>
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="text"
                            placeholder="Nombre Insumo"
                            value={formData.denominacion}
                            onChange={e => setFormData({ ...formData, denominacion: e.target.value })}
                            disabled={isLoading}
                        />
                        {/* Campos de precio y esParaElaborar ahora aparecen en ambos modos */}
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="number"
                            placeholder="Precio Compra"
                            value={formData.precioCompra === 0 ? "" : formData.precioCompra}
                            onChange={e => setFormData({ ...formData, precioCompra: e.target.value })}
                            disabled={isLoading}
                        />
                        <input
                            className={`${shared.input} ${styles.input}`}
                            type="number"
                            placeholder="Precio Venta"
                            value={formData.precioVenta === 0 ? "" : formData.precioVenta}
                            onChange={e => setFormData({ ...formData, precioVenta: e.target.value })}
                            disabled={isLoading}
                        />
                        <select
                            className={`${shared.input} ${styles.input}`}
                            value={formData.esParaElaborar ? "true" : "false"}
                            onChange={e => setFormData({ ...formData, esParaElaborar: e.target.value === "true" })}
                            disabled={isLoading}
                        >
                            <option value="true">¿Es para elaborar? Sí</option>
                            <option value="false">¿Es para elaborar? No</option>
                        </select>
                    </div>
                    
                    {/* Columna 2 */}
                    <div className={styles.editarModalCol}>
                        <select
                            className={`${shared.input} ${styles.input}`}
                            value={formData.rubro}
                            onChange={e => setFormData({ ...formData, rubro: e.target.value, subRubro: "" })}
                            disabled={isLoading}
                        >
                            <option value="">Seleccione un rubro</option>
                            {rubrosPrincipales.map(r => (
                                <option key={r.id} value={r.id}>{r.denominacion}</option>
                            ))}
                        </select>
                        <select
                            className={`${shared.input} ${styles.input}`}
                            value={formData.subRubro}
                            onChange={e => setFormData({ ...formData, subRubro: e.target.value })}
                            disabled={!formData.rubro || subRubros.length === 0 || isLoading}
                        >
                            <option value="">Seleccione un sub-rubro</option>
                            {subRubros.map(r => (
                                <option key={r.id} value={r.id}>{r.denominacion}</option>
                            ))}
                        </select>
                        <select
                            className={`${shared.input} ${styles.input}`}
                            value={formData.unidadMedida}
                            onChange={e => setFormData({ ...formData, unidadMedida: e.target.value })}
                            disabled={isLoading}
                        >
                            <option value="">Seleccione una unidad</option>
                            {UNIDADES.map(u => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Columna 3: Imagen */}
                    <div className={styles.editarModalCol} style={{ alignItems: "center", justifyContent: "center" }}>
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

export default InsumoModal;