// ================================================================
// TIPOS PARA INSUMOS
// ================================================================

/**
 * Tipo para representar un insumo en la API
 * @interface InsumoApi
 */
export type InsumoApi = {
    id: number;
    denominacion: string;
    precioCompra: number;
    precioVenta: number;
    esParaElaborar: boolean;
    stockActual: number;
    unidadMedida: string;
    rubro: { id: number; denominacion: string };
    fechaAlta: string;
    fechaBaja: string | null;
    estado?: string; // Calculado en el frontend: "Activo" | "Inactivo"
    imagen?: { id?: number; urlImagen: string }; 
};

/**
 * Tipo para representar un registro de movimiento de stock de insumos
 * @interface RegistroInsumoApi
 */
export type RegistroInsumoApi = {
    cantidad: number;
    tipoMovimiento: "INGRESO" | "EGRESO";
    motivo?: string;
    articuloInsumo: { id: number };
    sucursal: { id: number };
};

// ================================================================
// TIPOS PARA RUBROS
// ================================================================

/**
 * Tipo para representar un rubro en la API
 * @interface RubroApi
 */
export type RubroApi = {
    id: number | string;
    denominacion: string;
    tipoRubro: "INSUMO" | "MANUFACTURADO";
    rubroPadre?: RubroApi | null; // Permite objeto completo o null para jerarquía
    fechaAlta: string;
    fechaBaja: string | null;
};

/**
 * Tipo para representar un rubro en formato de tabla
 * @interface RubroTable
 */
export type RubroTable = {
    id: number | string;
    rubro: string;
    padre: string; // Denominación del rubro padre, vacío si es rubro principal
    estado: string; // "Activo" | "Inactivo"
};

// ================================================================
// TIPOS PARA ARTÍCULOS MANUFACTURADOS (PRODUCTOS)
// ================================================================

/**
 * Tipo para representar un detalle/ingrediente de un artículo manufacturado
 * @interface ArticuloManufacturadoDetalleApi
 */
export type ArticuloManufacturadoDetalleApi = {
    id?: number;
    cantidad: number;
    articuloInsumo: {
        id: number;
        denominacion?: string;
        unidadMedida?: string;
        precioCompra?: number;
    };
};

/**
 * Tipo para representar un artículo manufacturado en la API
 * @interface ArticuloManufacturadoApi
 */
export type ArticuloManufacturadoApi = {
    id: number;
    denominacion: string;
    descripcion: string;
    precioVenta: number;
    precioCosto: number; // Calculado automáticamente basado en los ingredientes
    tiempoEstimadoProduccion: number; // En minutos
    detalles: ArticuloManufacturadoDetalleApi[]; // Lista de ingredientes/insumos
    imagen: {
        id?: number;
        urlImagen: string;
    };
    rubro: {
        id: number;
        denominacion: string;
    };
    fechaAlta: string;
    fechaBaja: string | null;
    estado?: string; // Calculado en el frontend: "Activo" | "Inactivo"
};

/**
 * Tipo para representar un artículo manufacturado en formato de tabla
 * @interface ArticuloManufacturadoTable
 */
export type ArticuloManufacturadoTable = {
    id: number;
    nombre: string;
    rubro: string;
    precioVenta: number;
    tiempoPreparacion: number;
    estado: string; // "Activo" | "Inactivo"
    imagen?: string; // URL de la imagen para mostrar en la tabla
};

// ================================================================
// TIPOS PARA USUARIOS Y AUTENTICACIÓN
// ================================================================

/**
 * Tipo para representar un empleado
 * @interface EmpleadoApi
 */
export type EmpleadoApi = {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: number;
    user: UsuarioApi
    rol: RolApi;
    fechaAlta: string;
    fechaBaja: string | null;
    estado?: string; // "Activo" | "Inactivo"
};

/**
 * Tipo para representar un cliente
 * @interface ClienteApi
 */
export type ClienteApi = {
    id: number;
    nombre: string;
    apellido: string;
    user: UsuarioApi; // Usuario asociado al cliente
    email?: string;
    rol: RolApi; // Rol del cliente, puede ser "Cliente" o "Administrador"
    telefono?: number;
    domicilio?: DomicilioApi;
    fechaAlta: string;
    fechaBaja: string | null;
    estado?: string; // "Activo" | "Inactivo"
};

export type UsuarioApi = {
    authOId: string;
    username: string;
}

/**
 * Tipo para representar un rol de usuario
 * @interface RolApi
 */
export type RolApi = {
    id: number;
    denominacion: string;
    fechaAlta: string;
    fechaBaja: string | null;
    estado?: string; // Campo calculado en el frontend: "Activo" | "Inactivo"
};

/**
 * Tipo para representar un domicilio
 * @interface DomicilioApi
 */
export type DomicilioApi = {
    id?: number;
    calle: string;
    numero?: number;
    codigoPostal: string;
    localidad: LocalidadApi;
};

/**
 * Tipo para representar una localidad
 * @interface LocalidadApi
 */
export type LocalidadApi = {
    id: number;
    nombre: string;
    provincia: ProvinciaApi;
};

/**
 * Tipo para representar una provincia
 * @interface ProvinciaApi
 */
export type ProvinciaApi = {
    id: number;
    nombre: string;
    pais: PaisApi;
};

/**
 * Tipo para representar un país
 * @interface PaisApi
 */
export type PaisApi = {
    id: number;
    nombre: string;
};

// ================================================================
// TIPOS PARA PEDIDOS Y VENTAS
// ================================================================

/**
 * Tipo para representar un estado de pedido
 * @interface EstadoApi
 */
export type EstadoApi = {
    id: number;
    denominacion: string;
};

/**
 * Enumeración para tipos de envío
 */
export type TipoEnvio = 'DELIVERY' | 'LOCAL';

/**
 * Enumeración para tipos de pago
 */
export type TipoPago = 'EFECTIVO' | 'MERCADOPAGO';

/**
 * Tipo para representar un pedido de venta
 * @interface PedidoVentaApi
 */
export type PedidoVentaApi = {
    id: number;
    horaEstimadaFinalizacion: string; // LocalDateTime representado como ISO string
    total?: number;
    totalCosto?: number;
    estado: EstadoApi;
    tipoEnvio: TipoEnvio;
    tipoPago: TipoPago;
    detalles: PedidoVentaDetalleApi[];
    cliente: ClienteApi;
    empleado: EmpleadoApi;
};

/**
 * Tipo para representar un detalle de pedido de venta
 * @interface PedidoVentaDetalleApi
 */
export type PedidoVentaDetalleApi = {
    id: number;
    cantidad: number;
    subTotal?: number;
    articuloInsumo?: InsumoApi | null;
    articuloManufacturado?: ArticuloManufacturadoApi | null;
    promocion?: PromocionApi | null;
};

/**
 * Tipo para crear un nuevo pedido de venta
 * @interface NuevoPedidoVentaApi
 */
export type NuevoPedidoVentaApi = {
    horaEstimadaFinalizacion: string;
    tipoEnvio: TipoEnvio;
    tipoPago: TipoPago;
    detalles: {
        cantidad: number;
        articuloInsumoId?: number;
        articuloManufacturadoId?: number;
        promocionId?: number;
    }[];
    clienteId: number;
    empleadoId: number;
};

/**
 * Tipo para actualizar un pedido de venta
 * @interface ActualizarPedidoVentaApi
 */
export type ActualizarPedidoVentaApi = {
    horaEstimadaFinalizacion?: string;
    estadoId?: number;
    tipoEnvio?: TipoEnvio;
    tipoPago?: TipoPago;
    detalles?: {
        id?: number;
        cantidad: number;
        articuloInsumoId?: number;
        articuloManufacturadoId?: number;
        promocionId?: number;
    }[];
};

/**
 * Tipo para cambiar el estado de un pedido
 * @interface CambioEstadoPedidoApi
 */
export type CambioEstadoPedidoApi = {
    estadoId: number;
};

// ================================================================
// TIPOS PARA RESPUESTAS PAGINADAS
// ================================================================

/**
 * Tipo genérico para respuestas paginadas de la API
 * @interface PaginatedResponse
 */
export type PaginatedResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
};

// ================================================================
// TIPOS PARA FORMULARIOS
// ================================================================

/**
 * Tipo para datos de formulario de nuevo empleado
 * @interface NuevoEmpleadoForm
 */
export type NuevoEmpleadoForm = {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    password: string;
    repetirPassword: string;
    rol: string;
    localidad?: string;
    codigoPostal?: string;
    calle?: string;
    estado: "Activo" | "Inactivo";
};

/**
 * Tipo para datos de formulario de nuevo cliente
 * @interface NuevoClienteForm
 */
export type NuevoClienteForm = {
    nombre: string;
    apellido: string;
    usuario: string;
    email?: string;
    telefono?: string;
    estado: "Activo" | "Inactivo";
};

/**
 * Tipo para datos de formulario de nuevo insumo
 * @interface NuevoInsumoForm
 */
export type NuevoInsumoForm = {
    denominacion: string;
    unidadMedida: "GRAMOS" | "MILILITROS" | "UNIDADES";
    rubro: string;
    subRubro?: string;
    precioCompra: number;
    precioVenta: number;
    esParaElaborar: boolean;
};

/**
 * Tipo para datos de formulario de nuevo producto
 * @interface NuevoProductoForm
 */
export type NuevoProductoForm = {
    denominacion: string;
    descripcion: string;
    tiempoEstimadoProduccion: number;
    rubro: string;
    precioVenta?: number;
    detalles: {
        insumoId: number;
        cantidad: number;
    }[];
};

// ================================================================
// TIPOS PARA ESTADÍSTICAS
// ================================================================

/**
 * Tipo para estadísticas de clientes y sus pedidos
 * @interface ClientePedidosDTO
 */
export type ClientePedidosDTO = {
    clienteId: number;
    nombreCompleto: string;
    email: string;
    cantidadPedidos: number;
};

/**
 * Tipo para estadísticas de balance diario
 * @interface BalanceDiarioDTO
 */
export type BalanceDiarioDTO = {
    fecha: string;            // Fecha en formato ISO o similar (LocalDate en Java)
    ingresos: number;
    gastos: number;
    balance: number;
};

/**
 * Tipo para estadísticas de productos vendidos
 * @interface ProductoVendidoDTO
 */
export type ProductoVendidoDTO = {
    productoId: number;
    tipo: "MANUFACTURADO" | "INSUMO";
    denominacion: string;
    rubroDenominacion: string;
    cantidadVendida: number;
    totalVentas: number;
};

// ================================================================
// TIPOS PARA PROMOCIONES
// ================================================================

/**
 * Tipo para representar un detalle de promoción
 * @interface PromocionDetalleApi
 */
export type PromocionDetalleApi = {
    id?: number;
    cantidad: number;
    articuloManufacturado?: { id: number } | null; // Hacer opcional
    articuloInsumo?: { id: number, esParaElbarar: boolean } | null;        // Hacer opcional
};

/**
 * Tipo para representar una promoción en la API
 * @interface PromocionApi
 */
export type PromocionApi = {
    id: number;
    denominacion: string;           // Nuevo campo
    fechaInicio: string;
    fechaFin: string;
    descuento: number;
    precio?: number;
    imagen: {                       // Nuevo campo
        id?: number;
        urlImagen: string;
    };
    detalles: PromocionDetalleApi[];
};

// ================================================================
// ÍNDICE DE TIPOS POR CATEGORÍA
// ================================================================

/*
INSUMOS:
- InsumoApi                    - Datos completos del insumo
- RegistroInsumoApi           - Movimientos de stock

RUBROS:
- RubroApi                    - Datos completos del rubro
- RubroTable                  - Formato para mostrar en tablas

PRODUCTOS (ARTÍCULOS MANUFACTURADOS):
- ArticuloManufacturadoApi           - Datos completos del producto
- ArticuloManufacturadoDetalleApi    - Ingredientes del producto
- ArticuloManufacturadoTable         - Formato para mostrar en tablas

USUARIOS:
- EmpleadoApi                 - Datos de empleados
- ClienteApi                  - Datos de clientes
- RolApi                      - Roles de usuario

UBICACIÓN:
- DomicilioApi               - Direcciones
- LocalidadApi               - Localidades
- ProvinciaApi               - Provincias
- PaisApi                    - Países

PEDIDOS:
- PedidoApi                  - Datos completos del pedido
- DetallePedidoApi           - Items del pedido

FORMULARIOS:
- NuevoEmpleadoForm          - Formulario de empleado
- NuevoClienteForm           - Formulario de cliente
- NuevoInsumoForm            - Formulario de insumo
- NuevoProductoForm          - Formulario de producto

UTILIDADES:
- PaginatedResponse<T>       - Respuestas paginadas genéricas
- TopProductoStats           - Estadísticas de productos
- VentasStats                - Estadísticas de ventas
- StockStats                 - Estadísticas de inventario

PROMOCIONES:
- PromocionApi               - Datos completos de la promoción
- PromocionDetalleApi        - Detalles de la promoción
*/