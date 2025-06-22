import React, { useState } from "react";
import ProductosTable from "./ui/ProductosTable";
import SearchHeader from "../../components/SearchHeader/SearchHeader";
import ProductoModal from "./ui/ProductoModal";
import VerRecetaModal from "./ui/VerRecetaModal";
import Pagination from "../../components/Pagination/Pagination";
import useProductos from "./hooks/useProductos";
import type { ArticuloManufacturadoApi } from "../../types/adminTypes";
import shared from "../../styles/common/Common.module.css";

export const ProductosSection: React.FC = () => {
    const {
        // Estados del hook
        productos,
        loading,
        error,
        currentPage,
        totalPages,
        search,
        setSearch,
        
        // Métodos del hook
        handleSubmit,
        toggleEstadoProducto,
        handlePageChange,
        getRubrosPrincipales,
        getInsumosParaElaborar,
        getPaginationInfo,
        clearError
    } = useProductos();
    
    // Estados para modales
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [showRecetaModal, setShowRecetaModal] = useState(false);
    
    // Estados para datos de modales
    const [productoToEdit, setProductoToEdit] = useState<ArticuloManufacturadoApi | null>(null);
    const [productoToViewRecipe, setProductoToViewRecipe] = useState<ArticuloManufacturadoApi | null>(null);

    const handleToggleEstado = async (id: number) => {
        const success = await toggleEstadoProducto(id);
        if (!success) {
            alert("Error al cambiar el estado del producto");
        }
    };

    const handleProductoSubmit = async (id: number | null, productoData: any, imageFile?: File) => {
        try {
            const success = await handleSubmit(id, productoData, imageFile);
            if (success) {
                setShowProductoModal(false);
                setProductoToEdit(null);
                clearError();
            } else {
                throw new Error(`Error al ${id === null ? 'crear' : 'editar'} producto`);
            }
        } catch (error) {
            console.error(`Error al ${id === null ? 'crear' : 'editar'} producto:`, error);
            throw error; // Re-lanzar el error para que el modal lo maneje
        }
    };

    // Abrir modal para crear nuevo producto
    const handleNuevoClick = () => {
        setProductoToEdit(null);
        setShowProductoModal(true);
    };

    // Abrir modal para editar producto
    const handleEditClick = (producto: ArticuloManufacturadoApi) => {
        setProductoToEdit(producto);
        setShowProductoModal(true);
    };

    const handleVerRecetaClick = (producto: ArticuloManufacturadoApi) => {
        setProductoToViewRecipe(producto);
        setShowRecetaModal(true);
    };

    const handleCloseProductoModal = () => {
        setShowProductoModal(false);
        setProductoToEdit(null);
        clearError();
    };

    const handleCloseRecetaModal = () => {
        setShowRecetaModal(false);
        setProductoToViewRecipe(null);
    };

    if (loading && productos.length === 0) {
        return (
            <div className={shared.adminContent}>
                <div className={shared.adminContentSection}>
                    <div>Cargando productos...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                <SearchHeader
                    onNewClick={handleNuevoClick}
                    title="Administrador de productos"
                    search={search}
                    onSearchChange={setSearch}
                    placeholder="Buscar productos..."
                />

                {error && (
                    <div className={shared.error} style={{ marginBottom: '20px' }}>
                        {error}
                        <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
                    </div>
                )}

                <ProductosTable
                    productos={productos}
                    onToggleEstado={handleToggleEstado}
                    onEditProducto={handleEditClick}
                    onVerReceta={handleVerRecetaClick}
                />
                
                <div className={shared.paginationContainer}>
                    <div className={shared.paginationInfo}>{getPaginationInfo()}</div>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Modal unificado para Crear/Editar Producto */}
                <ProductoModal
                    isOpen={showProductoModal}
                    onClose={handleCloseProductoModal}
                    onSubmit={handleProductoSubmit}
                    producto={productoToEdit}
                    rubros={getRubrosPrincipales()}
                    insumos={getInsumosParaElaborar()}
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