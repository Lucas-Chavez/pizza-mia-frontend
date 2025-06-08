import React, { useState, useEffect } from "react";
import type { ArticuloManufacturadoApi, RubroApi, InsumoApi } from "../../types/adminTypes";
import { 
    fetchArticulosManufacturados, 
    patchEstadoArticuloManufacturado, 
    createArticuloManufacturado, 
    updateArticuloManufacturado, 
    fetchRubros, 
    fetchInsumos
} from "../../api/adminApi";
import ProductosTable from "./ui/ProductosTable";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import NuevoProductoModal from "./ui/NuevoProductoModal";
import EditarProductoModal from "./ui/EditarProductoModal";
import VerRecetaModal from "./ui/VerRecetaModal";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./ProductosSection.module.css";
import shared from "../../styles/common/Common.module.css";

export const ProductosSection: React.FC = () => {
    const [productos, setProductos] = useState<ArticuloManufacturadoApi[]>([]);
    const [rubros, setRubros] = useState<RubroApi[]>([]);
    const [insumos, setInsumos] = useState<InsumoApi[]>([]);
    const [search, setSearch] = useState("");
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(8);
    
    // Estados para modales
    const [showNuevoModal, setShowNuevoModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRecetaModal, setShowRecetaModal] = useState(false);
    
    // Estados para datos de modales
    const [productoToEdit, setProductoToEdit] = useState<ArticuloManufacturadoApi | null>(null);
    const [productoToViewRecipe, setProductoToViewRecipe] = useState<ArticuloManufacturadoApi | null>(null);
    
    // Estado para búsqueda demorada
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Efecto para demorar la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(0); // Resetear a la primera página al buscar
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        loadData();
    }, [currentPage, debouncedSearch]);

    // Cargar datos de rubros e insumos solo una vez al inicio
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Cargar rubros
                const rubrosData = await fetchRubros();
                setRubros(rubrosData);
                
                // Cargar insumos (todos los insumos activos para usar en los modales)
                const insumosResult = await fetchInsumos(0, 1000); // Obtenemos un número grande para tener todos
                const insumosActivos = insumosResult.content.filter(i => i.fechaBaja === null);
                setInsumos(insumosActivos);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                setRubros([]);
                setInsumos([]);
            }
        };
        
        loadInitialData();
    }, []);

    const loadData = async () => {
        try {
            // Si hay búsqueda, filtrar en frontend
            if (debouncedSearch) {
                const allProductos = await fetchArticulosManufacturados(0, 100); // Obtener más productos para búsqueda
                
                const filtered = allProductos.content.filter((item) =>
                    item.denominacion.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    (item.rubro?.denominacion?.toLowerCase() || "").includes(debouncedSearch.toLowerCase()) ||
                    item.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase())
                );
                
                setProductos(filtered);
                setTotalPages(Math.ceil(filtered.length / pageSize));
                setTotalElements(filtered.length);
            } else {
                // Si no hay búsqueda, usar paginación del backend
                const result = await fetchArticulosManufacturados(currentPage, pageSize);
                setProductos(result.content);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            setProductos([]);
            setTotalPages(1);
            setTotalElements(0);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleEstado = async (id: number) => {
        try {
            await patchEstadoArticuloManufacturado(id);
            await loadData(); // Recargar datos después del cambio
        } catch (error) {
            alert("Error al cambiar el estado del producto");
        }
    };

    const handleNuevoProducto = async (productoData: any, imageFile?: File) => {
        await createArticuloManufacturado(productoData, imageFile);
        await loadData(); // Recargar datos después de crear
    };

    const handleEditarProducto = async (id: number, productoData: any, imageFile?: File) => {
        await updateArticuloManufacturado(id, productoData, imageFile);
        await loadData(); // Recargar datos después de editar
    };

    const handleEditClick = (producto: ArticuloManufacturadoApi) => {
        setProductoToEdit(producto);
        setShowEditModal(true);
    };

    const handleVerRecetaClick = (producto: ArticuloManufacturadoApi) => {
        // Simplemente usar el producto que ya tenemos, sin hacer una petición adicional
        setProductoToViewRecipe(producto);
        setShowRecetaModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setProductoToEdit(null);
    };

    const handleCloseRecetaModal = () => {
        setShowRecetaModal(false);
        setProductoToViewRecipe(null);
    };

    // Mostrar información sobre paginación
    const paginationInfo = debouncedSearch
        ? `Mostrando ${productos.length} resultados de búsqueda`
        : `Mostrando ${productos.length} de ${totalElements} productos`;

    return (
        <div className={`${shared.adminContent} ${styles.adminContent}`}>
            <div className={shared.adminContentSection}>
                <SearchHeader
                    onNewClick={() => setShowNuevoModal(true)}
                    title="Administrador de productos"
                    search={search}
                    onSearchChange={setSearch}
                    placeholder="Buscar productos..."
                />

                <ProductosTable
                    productos={productos}
                    onToggleEstado={handleToggleEstado}
                    onEditProducto={handleEditClick}
                    onVerReceta={handleVerRecetaClick}
                />
                
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>{paginationInfo}</div>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Modal Nuevo Producto */}
                <NuevoProductoModal
                    isOpen={showNuevoModal}
                    onClose={() => setShowNuevoModal(false)}
                    onSubmit={handleNuevoProducto}
                    rubros={rubros}
                    insumos={insumos}
                />

                {/* Modal Editar Producto */}
                <EditarProductoModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onSubmit={handleEditarProducto}
                    producto={productoToEdit}
                    rubros={rubros}
                    insumos={insumos}
                />

                {/* Modal Ver Receta */}
                <VerRecetaModal
                    isOpen={showRecetaModal}
                    onClose={handleCloseRecetaModal}
                    producto={productoToViewRecipe}
                />
            </div>
        </div>
    );
};

export default ProductosSection;