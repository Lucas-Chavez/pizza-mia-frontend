import React, { useState, useEffect } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import { getGenericColumns } from "../../../components/GenericTable/getGenericColumns";
import Button from "../../../components/Button/Button";
import styles from "./Clientes.module.css";
import shared from "../../../styles/common/Common.module.css";
import Pagination from "../../../components/Pagination/Pagination";
import { ClienteApi, RolApi } from "../../../types/adminTypes";
import {
    fetchClientes,
    patchEstadoCliente,
    createCliente,
    updateCliente,
    fetchRoles
} from "../../../api/adminApi";

const Clientes: React.FC = () => {
    const [clientes, setClientes] = useState<ClienteApi[]>([]);
    const [roles, setRoles] = useState<RolApi[]>([]);
    const [clienteRolId, setClienteRolId] = useState<number | null>(null); // Para almacenar el ID del rol "Cliente"
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [clienteToEdit, setClienteToEdit] = useState<ClienteApi | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: 0,
        email: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 8;

    // Cargar clientes al montar el componente y cuando cambie la página
    useEffect(() => {
        loadClientes();
    }, [currentPage]);

    // Cargar roles al montar el componente para obtener el ID del rol "Cliente"
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const rolesData = await fetchRoles();
                setRoles(rolesData);
                
                // Buscar el rol "Cliente" y guardar su ID
                const clienteRol = rolesData.find(r => r.denominacion.toLowerCase() === "cliente");
                if (clienteRol) {
                    setClienteRolId(clienteRol.id);
                } else {
                    console.error("No se encontró el rol 'Cliente'");
                }
            } catch (err) {
                console.error("Error al cargar roles:", err);
            }
        };
        loadRoles();
    }, []);

    const loadClientes = async () => {
        setLoading(true);
        try {
            const result = await fetchClientes(currentPage, pageSize);
            setClientes(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            setError("Error al cargar los clientes. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async (id: number) => {
        try {
            await patchEstadoCliente(id);
            await loadClientes(); // Recargar datos después del cambio
        } catch (error) {
            console.error("Error al cambiar estado del cliente:", error);
            setError("Error al cambiar el estado del cliente");
        }
    };

    const handleNuevoCliente = () => {
        setShowModal(true);
        setIsEditMode(false);
        setClienteToEdit(null);
        setFormData({
            nombre: "",
            apellido: "",
            telefono: 0,
            email: ""
        });
        setError("");
    };

    const handleEditCliente = (cliente: ClienteApi) => {
        setShowModal(true);
        setIsEditMode(true);
        setClienteToEdit(cliente);
        setFormData({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            telefono: cliente.telefono || 0,
            email: cliente.email || ""
        });
        setError("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.nombre.trim()) {
            setError("El nombre es obligatorio");
            return false;
        }
        if (!formData.apellido.trim()) {
            setError("El apellido es obligatorio");
            return false;
        }
        if (!formData.email.trim()) {
            setError("El email es obligatorio");
            return false;
        }
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError("El email no es válido");
            return false;
        }
        if (!clienteRolId) {
            setError("No se pudo determinar el rol de cliente. Intente nuevamente.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Asegurarnos de que tenemos el ID del rol "Cliente"
            if (!clienteRolId) {
                setError("No se pudo determinar el rol de cliente");
                return;
            }

            const clienteData = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                telefono: Number(formData.telefono),
                email: formData.email.trim(),
                rol: { id: clienteRolId }
            };

            if (isEditMode && clienteToEdit) {
                await updateCliente(clienteToEdit.id, clienteData);
            } else {
                await createCliente(clienteData);
            }

            setShowModal(false);
            await loadClientes(); // Recargar datos
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            setError(error instanceof Error ? error.message : "Error al guardar el cliente");
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns = [
        { header: "Nombre", key: "nombre" },
        { header: "Apellido", key: "apellido" },
        { header: "Email", key: "email" },
        { header: "Teléfono", key: "telefono", render: (value: any) => value || "-" },
        ...getGenericColumns({
            onAlta: (row) => {
                if (row.estado === "Inactivo") toggleEstado(row.id);
            },
            onBaja: (row) => {
                if (row.estado === "Activo") toggleEstado(row.id);
            },
            onEditar: (row) => {
                handleEditCliente(row);
            },
            disabledAlta: row => row.estado === "Activo",
            disabledBaja: row => row.estado === "Inactivo",
        }),
    ];

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                <p>Administrador de Clientes</p>
                <Button
                    label="Nuevo +"
                    onClick={handleNuevoCliente}
                    className={shared.nuevoButton}
                />

                {loading ? (
                    <div className={styles.loadingContainer}>Cargando clientes...</div>
                ) : error && clientes.length === 0 ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : (
                    <>
                        <GenericTable columns={columns} data={clientes} />

                        {totalPages > 1 && (
                            <div className={shared.paginationContainer}>
                                <div className={styles.paginationInfo}>
                                    Mostrando {clientes.length} de {totalElements} clientes
                                </div>
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
                            <h2>{isEditMode ? "Editar cliente" : "Nuevo cliente"}</h2>

                            <div className={styles.formGroup}>
                                <label>Nombre</label>
                                <input
                                    className={`${shared.input} ${styles.input}`}
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombre del cliente"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Apellido</label>
                                <input
                                    className={`${shared.input} ${styles.input}`}
                                    type="text"
                                    name="apellido"
                                    placeholder="Apellido del cliente"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    className={`${shared.input} ${styles.input}`}
                                    type="email"
                                    name="email"
                                    placeholder="Email del cliente"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Teléfono</label>
                                <input
                                    className={`${shared.input} ${styles.input}`}
                                    type="number"
                                    name="telefono"
                                    placeholder="Teléfono del cliente"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {error && <div className={shared.error}>{error}</div>}

                            <div className={shared.modalActions}>
                                <button
                                    className={shared.enviarButton}
                                    onClick={handleSubmit}
                                >
                                    {isEditMode ? "Actualizar" : "Crear"}
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

export default Clientes;