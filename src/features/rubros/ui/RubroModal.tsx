import React, { useState, useEffect } from "react";
import shared from "../../../styles/common/Common.module.css";
import { RubroApi } from "../../../types/adminTypes";

interface RubroModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string | number | null, rubroData: {
        denominacion: string;
        tipoRubro: string;
        rubroPadre?: { id: string | number } | null;
    }) => Promise<void>;
    rubro?: RubroApi | null; // Si existe es edición, si no es creación
    rubrosApi: RubroApi[];
    tipoRubroDefault: "INSUMO" | "MANUFACTURADO";
    modalStyles: any;
    padre?: string; // Para crear subrubros
}

const RubroModal: React.FC<RubroModalProps> = ({ 
    isOpen,
    onClose, 
    onSubmit, 
    rubro = null,
    rubrosApi,
    tipoRubroDefault,
    modalStyles,
    padre
}) => {
    const isEditMode = !!rubro;
    
    const [formData, setFormData] = useState({
        denominacion: "",
        tipoRubro: tipoRubroDefault,
        rubroPadre: null as { id: string | number } | null
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && rubro) {
                // Modo edición - cargar datos del rubro
                setFormData({
                    denominacion: rubro.denominacion,
                    tipoRubro: rubro.tipoRubro,
                    rubroPadre: rubro.rubroPadre || null
                });
            } else {
                // Modo creación - formulario vacío con valores por defecto
                const rubroPadreId = padre ? 
                    rubrosApi.find(r => r.denominacion === padre)?.id : null;
                
                setFormData({
                    denominacion: "",
                    tipoRubro: tipoRubroDefault,
                    rubroPadre: rubroPadreId ? { id: rubroPadreId } : null
                });
            }
            
            setError("");
        }
    }, [isOpen, isEditMode, rubro, tipoRubroDefault, padre, rubrosApi]);

    // Filtrar rubros disponibles como padre (excluir el rubro actual en edición)
    const rubrosDisponiblesComoPadre = rubrosApi.filter(r => {
        // Excluir el rubro actual si estamos editando
        if (isEditMode && rubro && r.id === rubro.id) {
            return false;
        }
        // Solo mostrar rubros del mismo tipo
        return r.tipoRubro === formData.tipoRubro;
    });

    const handleSubmit = async () => {
        // Validaciones
        if (!formData.denominacion.trim()) {
            setError("El nombre del rubro es obligatorio");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(
                isEditMode ? rubro!.id : null, 
                formData
            );
            
            // Limpiar formulario solo si es modo creación
            if (!isEditMode) {
                setFormData({
                    denominacion: "",
                    tipoRubro: tipoRubroDefault,
                    rubroPadre: padre ? { id: rubrosApi.find(r => r.denominacion === padre)?.id || "" } : null
                });
            }
            
            setError("");
            onClose();
        } catch (error) {
            setError(`Error al ${isEditMode ? 'editar' : 'crear'} el rubro`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={shared.modalOverlay}>
            <div className={`${shared.modalContent} ${modalStyles.modalContent}`}>
                <h2>
                    {isEditMode 
                        ? "Editar Rubro" 
                        : padre 
                            ? `Nuevo sub-rubro de: ${padre}` 
                            : "Nuevo rubro padre"
                    }
                </h2>
                
                {/* Campo Denominación */}
                <input
                    className={`${shared.input} ${modalStyles.input}`}
                    type="text"
                    placeholder="Nombre del rubro"
                    value={formData.denominacion}
                    onChange={e => setFormData({
                        ...formData, 
                        denominacion: e.target.value
                    })}
                    disabled={loading}
                />

                {/* Campo Tipo de Rubro - Solo visible en modo edición o cuando no hay padre */}
                {(isEditMode || !padre) && (
                    <select
                        className={`${shared.input} ${modalStyles.input}`}
                        value={formData.tipoRubro}
                        onChange={e => setFormData({
                            ...formData, 
                            tipoRubro: e.target.value as "INSUMO" | "MANUFACTURADO",
                            rubroPadre: null // Resetear padre al cambiar tipo
                        })}
                        disabled={loading}
                    >
                        <option value="INSUMO">INSUMO</option>
                        <option value="MANUFACTURADO">MANUFACTURADO</option>
                    </select>
                )}

                {/* Campo Rubro Padre - Solo visible en modo edición o cuando no hay padre predefinido */}
                {(isEditMode || !padre) && (
                    <select
                        className={`${shared.input} ${modalStyles.input}`}
                        value={formData.rubroPadre?.id || ""}
                        onChange={e => {
                            const padreSeleccionado = rubrosDisponiblesComoPadre.find(
                                r => String(r.id) === e.target.value
                            );
                            setFormData({
                                ...formData,
                                rubroPadre: padreSeleccionado ? { id: padreSeleccionado.id } : null
                            });
                        }}
                        disabled={loading}
                    >
                        <option value="">Sin padre (Rubro principal)</option>
                        {rubrosDisponiblesComoPadre.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.denominacion}
                            </option>
                        ))}
                    </select>
                )}

                {/* Información del padre cuando se está creando un subrubro */}
                {!isEditMode && padre && (
                    <div style={{ 
                        padding: '10px', 
                        background: '#f5f5f5', 
                        borderRadius: '8px', 
                        marginBottom: '10px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <strong>Rubro padre:</strong> {padre}
                    </div>
                )}

                {error && <div className={shared.error}>{error}</div>}
                
                <div className={shared.modalActions}>
                    <button
                        className={shared.enviarButton}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading 
                            ? (isEditMode ? "Guardando..." : "Creando...") 
                            : "Confirmar"
                        }
                    </button>
                    <button
                        className={shared.salirButton}
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RubroModal;