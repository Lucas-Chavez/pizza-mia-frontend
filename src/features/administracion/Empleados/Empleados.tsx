import React, { useState, useEffect } from "react";
import GenericTable from "../../../components/GenericTable/GenericTable";
import { getGenericColumns } from "../../../components/GenericTable/getGenericColumns";
import Button from "../../../components/Button/Button";
import styles from "./Empleados.module.css";
import shared from "../../../styles/common/Common.module.css";
import Pagination from "../../../components/Pagination/Pagination";
import { EmpleadoApi, RolApi } from "../../../types/adminTypes";
import {
    fetchEmpleados,
    patchEstadoEmpleado,
    createEmpleado,
    updateEmpleado,
    fetchRoles
} from "../../../api/adminApi";

const Empleados: React.FC = () => {
    const [empleados, setEmpleados] = useState<EmpleadoApi[]>([]);
    const [roles, setRoles] = useState<RolApi[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [empleadoToEdit, setEmpleadoToEdit] = useState<EmpleadoApi | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: 0,
        email: "",
        password: "",
        repetirPassword: "",
        rol: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 8;

    // Cargar empleados al montar el componente y cuando cambie la página
    useEffect(() => {
        loadEmpleados();
    }, [currentPage]);

    // Cargar roles al montar el componente
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const rolesData = await fetchRoles();
                setRoles(rolesData);
            } catch (err) {
                console.error("Error al cargar roles:", err);
            }
        };
        loadRoles();
    }, []);

    const loadEmpleados = async () => {
        setLoading(true);
        try {
            const result = await fetchEmpleados(currentPage, pageSize);
            setEmpleados(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
            setError("Error al cargar los empleados. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async (id: number) => {
        try {
            await patchEstadoEmpleado(id);
            await loadEmpleados(); // Recargar datos después del cambio
        } catch (error) {
            console.error("Error al cambiar estado del empleado:", error);
            setError("Error al cambiar el estado del empleado");
        }
    };

    const handleNuevoEmpleado = () => {
        setShowModal(true);
        setIsEditMode(false);
        setEmpleadoToEdit(null);
        setFormData({
            nombre: "",
            apellido: "",
            telefono: 0,
            email: "",
            password: "",
            repetirPassword: "",
            rol: ""
        });
        setError("");
    };

    const handleEditEmpleado = (empleado: EmpleadoApi) => {
        setShowModal(true);
        setIsEditMode(true);
        setEmpleadoToEdit(empleado);
        setFormData({
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            telefono: empleado.telefono || 0,
            email: empleado.email || "",
            password: "",
            repetirPassword: "",
            rol: empleado.rol.id.toString()
        });
        setError("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        
        // Validar contraseña solo al crear nuevo empleado
        if (!isEditMode) {
            if (!formData.password.trim()) {
                setError("La contraseña es obligatoria para nuevos empleados");
                return false;
            }
            if (formData.password !== formData.repetirPassword) {
                setError("Las contraseñas no coinciden");
                return false;
            }
        }
        
        if (!formData.rol) {
            setError("Debe seleccionar un rol");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (isEditMode && empleadoToEdit) {
                // Verificar si existe el objeto user y el authOId
                if (!empleadoToEdit.user || !empleadoToEdit.user.authOId) {
                    console.error("No se pudo encontrar el ID de Auth0:", empleadoToEdit);
                    setError("Error: No se pudo identificar el ID de usuario de Auth0");
                    return;
                }

                // Actualizar empleado (sin enviar contraseña)
                const UpdateEmpleado = {
                    nombre: formData.nombre.trim(),
                    apellido: formData.apellido.trim(),
                    telefono: Number(formData.telefono),
                    email: formData.email.trim(),
                    auth0Id: empleadoToEdit.user.authOId,
                    rol: { id: Number(formData.rol) }
                };
                await updateEmpleado(empleadoToEdit.id, UpdateEmpleado);
            } else {
                // Crear empleado (con contraseña)
                const empleadoData = {
                    nombre: formData.nombre.trim(),
                    apellido: formData.apellido.trim(),
                    telefono: Number(formData.telefono),
                    email: formData.email.trim(),
                    password: formData.password.trim(),
                    rol: { id: Number(formData.rol) }
                };
                await createEmpleado(empleadoData);
            }

            setShowModal(false);
            await loadEmpleados(); // Recargar datos
        } catch (error) {
            console.error("Error al guardar empleado:", error);
            setError(error instanceof Error ? error.message : "Error al guardar el empleado");
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns = [
        { header: "Nombre", key: "nombre" },
        { header: "Apellido", key: "apellido" },
        { header: "Email", key: "email" },
        { header: "Rol", key: "rol", render: (value: any) => value?.denominacion || "-" },
        { header: "Teléfono", key: "telefono", render: (value: any) => value || "-" },
        ...getGenericColumns({
            onAlta: (row) => {
                if (row.estado === "Inactivo") toggleEstado(row.id);
            },
            onBaja: (row) => {
                if (row.estado === "Activo") toggleEstado(row.id);
            },
            onEditar: (row) => {
                handleEditEmpleado(row);
            },
            disabledAlta: row => row.estado === "Activo",
            disabledBaja: row => row.estado === "Inactivo",
        }),
    ];

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                <p>Administrador de Empleados</p>
                <Button
                    label="Nuevo +"
                    onClick={handleNuevoEmpleado}
                    className={shared.nuevoButton}
                />

                {loading ? (
                    <div className={styles.loadingContainer}>Cargando empleados...</div>
                ) : error && empleados.length === 0 ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : (
                    <>
                        <GenericTable columns={columns} data={empleados} />

                        {totalPages > 1 && (
                            <div className={shared.paginationContainer}>
                                <div className={styles.paginationInfo}>
                                    Mostrando {empleados.length} de {totalElements} empleados
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
                            <h2>{isEditMode ? "Editar empleado" : "Nuevo empleado"}</h2>

                            <div className={styles.modalFormGrid}>
                                {/* Sección Izquierda */}
                                <div className={styles.modalLeft}>
                                    <div className={styles.formGroup}>
                                        <label>Nombre</label>
                                        <input
                                            className={`${shared.input} ${styles.input}`}
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre del empleado"
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
                                            placeholder="Apellido del empleado"
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
                                            placeholder="Email del empleado"
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
                                            placeholder="Teléfono del empleado"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Sección Derecha */}
                                <div className={styles.modalRight}>
                                    <div className={styles.formGroup}>
                                        <label>Rol</label>
                                        <select
                                            className={`${shared.input} ${styles.input}`}
                                            name="rol"
                                            value={formData.rol}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Seleccione un rol</option>
                                            {roles.map(rol => (
                                                <option key={rol.id} value={rol.id}>
                                                    {rol.denominacion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mostrar campos de contraseña solo cuando se crea un nuevo empleado */}
                                    {!isEditMode && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <label>Contraseña</label>
                                                <input
                                                    className={`${shared.input} ${styles.input}`}
                                                    type="password"
                                                    name="password"
                                                    placeholder="Contraseña"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Repetir Contraseña</label>
                                                <input
                                                    className={`${shared.input} ${styles.input}`}
                                                    type="password"
                                                    name="repetirPassword"
                                                    placeholder="Repetir contraseña"
                                                    value={formData.repetirPassword}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Si estamos en modo edición, mostrar mensaje informativo */}
                                    {isEditMode && (
                                        <div className={styles.passwordInfo}>
                                            <p>La contraseña solo puede ser cambiada por el empleado desde su perfil.</p>
                                        </div>
                                    )}
                                </div>
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

export default Empleados;