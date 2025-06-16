import React, { useState, useEffect } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import { getGenericColumns } from "../../../components/GenericTable/getGenericColumns";
import Button from "../../../components/Button/Button";
import styles from "./Roles.module.css";
import shared from "../../../styles/common/Common.module.css";
import Pagination from "../../../components/Pagination/Pagination";
import { RolApi } from "../../../types/adminTypes";
import { fetchRoles, createRol, patchEstadoRol, updateRol } from "../../../api/adminApi";

const Roles: React.FC = () => {
    const [roles, setRoles] = useState<RolApi[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevoRol, setNuevoRol] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [rolToEdit, setRolToEdit] = useState<RolApi | null>(null);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 8;

    // Cargar roles al montar el componente
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await fetchRoles();
            setRoles(data);
            setTotalPages(Math.ceil(data.length / pageSize));
        } catch (error) {
            console.error("Error al cargar roles:", error);
            setError("Error al cargar los roles. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async (id: number) => {
        try {
            await patchEstadoRol(id);
            await loadRoles(); // Recargar datos después del cambio
        } catch (error) {
            console.error("Error al cambiar estado del rol:", error);
            setError("Error al cambiar el estado del rol");
        }
    };

    const handleNuevoRol = () => {
        setShowModal(true);
        setNuevoRol("");
        setError("");
        setEditMode(false);
        setRolToEdit(null);
    };

    const handleEditRol = (rol: RolApi) => {
        setShowModal(true);
        setNuevoRol(rol.denominacion);
        setError("");
        setEditMode(true);
        setRolToEdit(rol);
    };

    const handleEnviar = async () => {
        if (!nuevoRol.trim()) {
            setError("El nombre del rol es obligatorio");
            return;
        }
        
        // Validar que no exista un rol con el mismo nombre (excepto en modo edición)
        if (!editMode && roles.some(r => 
            r.denominacion.toLowerCase() === nuevoRol.trim().toLowerCase())) {
            setError("Ese rol ya existe");
            return;
        }

        try {
            if (editMode && rolToEdit) {
                // Actualizar rol existente
                await updateRol(rolToEdit.id, {
                    denominacion: nuevoRol.trim()
                });
            } else {
                // Crear nuevo rol
                await createRol({
                    denominacion: nuevoRol.trim()
                });
            }
            
            setShowModal(false);
            await loadRoles(); // Recargar datos
        } catch (error) {
            console.error("Error al guardar rol:", error);
            setError("Error al guardar el rol");
        }
    };

    // Calcular roles para la página actual
    const getCurrentPageRoles = () => {
        const startIndex = currentPage * pageSize;
        return roles.slice(startIndex, startIndex + pageSize);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns = [
        { header: "Rol", key: "denominacion" },
        ...getGenericColumns({
            onAlta: (row) => {
                if (row.estado === "Inactivo") toggleEstado(row.id);
            },
            onBaja: (row) => {
                if (row.estado === "Activo") toggleEstado(row.id);
            },
            onEditar: (row) => {
                handleEditRol(row);
            },
            disabledAlta: row => row.estado === "Activo",
            disabledBaja: row => row.estado === "Inactivo",
        }),
    ];

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                <p>Administrador de Roles</p>
                <Button
                    label="Nuevo +"
                    onClick={handleNuevoRol}
                    className={shared.nuevoButton}
                />
                
                {loading ? (
                    <div className={styles.loadingContainer}>Cargando roles...</div>
                ) : error && roles.length === 0 ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : (
                    <>
                        <GenericTable columns={columns} data={getCurrentPageRoles()} />
                        
                        {roles.length > pageSize && (
                            <div className={shared.paginationContainer}>
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {showModal && (
                    <div className={shared.modalOverlay}>
                        <div className={`${shared.modalContent} ${styles.modalContent}`}>
                            <h2>{editMode ? "Editar rol" : "Nuevo rol"}</h2>
                            <label>Nombre</label>
                            <input
                                className={`${shared.input} ${styles.input}`}
                                type="text"
                                placeholder="Nombre del rol"
                                value={nuevoRol}
                                onChange={e => setNuevoRol(e.target.value)}
                            />
                            {error && <div className={shared.error}>{error}</div>}
                            <div className={shared.modalActions}>
                                <button
                                    className={shared.enviarButton}
                                    onClick={handleEnviar}
                                >
                                    {editMode ? "Actualizar" : "Crear"}
                                </button>
                                <button
                                    className={shared.salirButton}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roles;