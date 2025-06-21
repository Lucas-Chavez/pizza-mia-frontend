import interceptorApi from './interceptorApi';
import { 
    InsumoApi, 
    RegistroInsumoApi, 
    RubroApi, 
    RubroTable, 
    ArticuloManufacturadoApi,
    ArticuloManufacturadoDetalleApi,
    RolApi,
    ClienteApi,
    PromocionApi,
    EmpleadoApi,
} from "../types/adminTypes";

// ================================================================
// ENDPOINTS PARA INSUMOS
// ================================================================

/**
 * Obtiene una lista paginada de insumos
 * @param page - Número de página (default: 0)
 * @param size - Tamaño de página (default: 8)
 * @param sort - Campo de ordenamiento (default: "id")
 * @returns Objeto con contenido paginado e información de paginación
 */
export const fetchInsumos = async (
    page: number = 0,
    size: number = 8,
    sort: string = "id"
): Promise<{
    content: InsumoApi[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}> => {
    const response = await interceptorApi.get(`/insumos?page=${page}&size=${size}&sort=${sort}`);
    const data = response.data;
    
    // Mapear el contenido para añadir la propiedad estado
    return {
        ...data,
        content: data.content.map((insumo: InsumoApi) => ({
            ...insumo,
            estado: insumo.fechaBaja === null ? "Activo" : "Inactivo"
        }))
    };
};

/**
 * Cambia el estado de un insumo (activo/inactivo)
 * @param id - ID del insumo
 */
export const patchEstadoInsumo = async (id: number) => {
    const response = await interceptorApi.patch(`/insumos/${id}/estado`);
    return response.data;
};

/**
 * Crea un nuevo insumo
 * @param insumoData - Datos del insumo a crear
 * @param imageFile - Archivo de imagen opcional
 * @returns Datos del insumo creado
 */
export const createInsumo = async (
    insumoData: {
        denominacion: string;
        unidadMedida: string;
        rubro: { id: string };
        precioCompra: number;
        precioVenta: number;
        esParaElaborar: boolean;
    }, 
    imageFile?: File
) => {
    const formData = new FormData();
    
    // Agregar el JSON del insumo
    formData.append("insumo", new Blob([JSON.stringify(insumoData)], {
        type: 'application/json'
    }));
    
    // Agregar el archivo si existe
    if (imageFile) {
        formData.append("file", imageFile);
    }
    
    const response = await interceptorApi.post("/insumos", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

/**
 * Actualiza un insumo existente
 * @param id - ID del insumo a actualizar
 * @param insumoData - Nuevos datos del insumo
 * @param imageFile - Archivo de imagen opcional
 * @returns Datos del insumo actualizado
 */
export const updateInsumo = async (id: number, insumoData: any, imageFile?: File) => {
    const formData = new FormData();
    
    // Agregar el JSON del insumo
    formData.append("insumo", new Blob([JSON.stringify(insumoData)], {
        type: 'application/json'
    }));
    
    // Agregar el archivo si existe
    if (imageFile) {
        formData.append("file", imageFile);
    }
    
    const response = await interceptorApi.put(`/insumos/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

// ================================================================
// ENDPOINTS PARA REGISTRO DE INSUMOS (MOVIMIENTOS DE STOCK)
// ================================================================

/**
 * Registra un movimiento de stock para un insumo (entrada/salida)
 * @param registroData - Datos del registro de movimiento
 * @returns Datos del registro creado
 */
export const createRegistroInsumo = async (registroData: RegistroInsumoApi) => {
    const response = await interceptorApi.post("/registros-insumo", registroData);
    return response.data;
};

// ================================================================
// ENDPOINTS PARA RUBROS
// ================================================================

/**
 * Obtiene todos los rubros en formato API
 * @returns Lista de rubros
 */
export const fetchRubros = async (): Promise<RubroApi[]> => {
    const response = await interceptorApi.get("/rubros");
    return response.data;
};

/**
 * Obtiene todos los rubros en formato de tabla (para mostrar en tablas)
 * @returns Lista de rubros formateados para tabla
 */
export const fetchRubrosTable = async (): Promise<RubroTable[]> => {
    const response = await interceptorApi.get("/rubros");
    const data = response.data;
    
    return data.map((r: RubroApi) => ({
        id: r.id,
        rubro: r.denominacion,
        padre: r.rubroPadre ? r.rubroPadre.denominacion : "",
        estado: r.fechaBaja === null ? "Activo" : "Inactivo",
    }));
};

/**
 * Cambia el estado de un rubro (activo/inactivo)
 * @param id - ID del rubro
 */
export const patchEstadoRubro = async (id: number | string) => {
    const response = await interceptorApi.patch(`/rubros/${id}/estado`);
    return response.data;
};

/**
 * Crea un nuevo rubro
 * @param rubroData - Datos del rubro a crear
 * @returns Datos del rubro creado
 */
export const createRubro = async (rubroData: {
    denominacion: string;
    tipoRubro: string;
    rubroPadre?: { id: string | number } | null;
}): Promise<RubroApi> => {
    const response = await interceptorApi.post("/rubros", rubroData);
    return response.data;
};

/**
 * Actualiza un rubro existente
 * @param id - ID del rubro a actualizar
 * @param rubroData - Nuevos datos del rubro
 * @returns Datos del rubro actualizado
 */
export const updateRubro = async (id: number | string, rubroData: {
    denominacion: string;
    tipoRubro: string;
    rubroPadre?: { id: string | number } | null;
}): Promise<RubroApi> => {
    const response = await interceptorApi.put(`/rubros/${id}`, rubroData);
    return response.data;
};

// ================================================================
// ENDPOINTS PARA ARTÍCULOS MANUFACTURADOS (PRODUCTOS)
// ================================================================

/**
 * Obtiene una lista paginada de artículos manufacturados
 * @param page - Número de página (default: 0)
 * @param size - Tamaño de página (default: 8)
 * @param sort - Campo de ordenamiento (default: "id")
 * @returns Objeto con contenido paginado e información de paginación
 */
export const fetchArticulosManufacturados = async (
    page: number = 0,
    size: number = 8,
    sort: string = "id"
): Promise<{
    content: ArticuloManufacturadoApi[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}> => {
    const response = await interceptorApi.get(`/manufacturados?page=${page}&size=${size}&sort=${sort}`);
    const data = response.data;
    
    // Mapear el contenido para añadir la propiedad estado
    return {
        ...data,
        content: data.content.map((articulo: ArticuloManufacturadoApi) => ({
            ...articulo,
            estado: articulo.fechaBaja === null ? "Activo" : "Inactivo"
        }))
    };
};

/**
 * Obtiene un artículo manufacturado por su ID
 * @param id - ID del artículo manufacturado
 * @returns Datos del artículo manufacturado
 */
export const fetchArticuloManufacturadoById = async (id: number): Promise<ArticuloManufacturadoApi> => {
    const response = await interceptorApi.get(`/manufacturados/${id}`);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Cambia el estado de un artículo manufacturado (activo/inactivo)
 * @param id - ID del artículo manufacturado
 */
export const patchEstadoArticuloManufacturado = async (id: number) => {
    const response = await interceptorApi.patch(`/manufacturados/${id}/estado`);
    return response.data;
};

/**
 * Crea un nuevo artículo manufacturado
 * @param articuloData - Datos del artículo a crear
 * @param imageFile - Archivo de imagen opcional
 * @returns Datos del artículo creado
 */
export const createArticuloManufacturado = async (
    articuloData: {
        denominacion: string;
        descripcion: string;
        tiempoEstimadoProduccion: number;
        rubro: { id: string | number };
        detalles: ArticuloManufacturadoDetalleApi[];
        precioVenta?: number;
        precioCosto?: number;
    }, 
    imageFile?: File
) => {
    const formData = new FormData();
    
    // Agregar el JSON del artículo manufacturado
    formData.append("manufacturado", new Blob([JSON.stringify(articuloData)], {
        type: 'application/json'
    }));
    
    // Agregar el archivo si existe
    if (imageFile) {
        formData.append("file", imageFile);
    }
    
    const response = await interceptorApi.post("/manufacturados", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

/**
 * Actualiza un artículo manufacturado existente
 * @param id - ID del artículo a actualizar
 * @param articuloData - Nuevos datos del artículo
 * @param imageFile - Archivo de imagen opcional
 * @returns Datos del artículo actualizado
 */
export const updateArticuloManufacturado = async (id: number, articuloData: any, imageFile?: File) => {
    const formData = new FormData();
    
    // Agregar el JSON del artículo manufacturado
    formData.append("manufacturado", new Blob([JSON.stringify(articuloData)], {
        type: 'application/json'
    }));
    
    // Agregar el archivo si existe
    if (imageFile) {
        formData.append("file", imageFile);
    }
    
    const response = await interceptorApi.put(`/manufacturados/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

// ================================================================
// ENDPOINTS PARA ROLES
// ================================================================

/**
 * Obtiene todos los roles
 * @returns Lista de roles
 */
export const fetchRoles = async (): Promise<RolApi[]> => {
    const response = await interceptorApi.get("/roles");
    const data = response.data;
    
    // Mapear para añadir el estado calculado
    return data.map((rol: any) => ({
        ...rol,
        estado: rol.fechaBaja === null ? "Activo" : "Inactivo"
    }));
};

/**
 * Obtiene un rol por su ID
 * @param id - ID del rol
 * @returns Datos del rol
 */
export const fetchRolById = async (id: number): Promise<RolApi> => {
    const response = await interceptorApi.get(`/roles/${id}`);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Crea un nuevo rol
 * @param rolData - Datos del rol a crear
 * @returns Datos del rol creado
 */
export const createRol = async (rolData: {
    denominacion: string;
}): Promise<RolApi> => {
    const response = await interceptorApi.post("/roles", rolData);
    const data = response.data;
    
    return {
        ...data,
        estado: "Activo" // Un rol recién creado siempre está activo
    };
};

/**
 * Actualiza un rol existente
 * @param id - ID del rol a actualizar
 * @param rolData - Nuevos datos del rol
 * @returns Datos del rol actualizado
 */
export const updateRol = async (id: number, rolData: {
    denominacion: string;
}): Promise<RolApi> => {
    const response = await interceptorApi.put(`/roles/${id}`, rolData);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Cambia el estado de un rol (activo/inactivo)
 * @param id - ID del rol
 */
export const patchEstadoRol = async (id: number) => {
    const response = await interceptorApi.patch(`/roles/${id}/estado`);
    return response.data;
};

// ================================================================
// ENDPOINTS PARA CLIENTES
// ================================================================

/**
 * Obtiene una lista paginada de clientes
 * @param page - Número de página (default: 0)
 * @param size - Tamaño de página (default: 8)
 * @param sort - Campo de ordenamiento (default: "id")
 * @returns Objeto con contenido paginado e información de paginación
 */
export const fetchClientes = async (
    page: number = 0,
    size: number = 8,
    sort: string = "id"
): Promise<{
    content: ClienteApi[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}> => {
    const response = await interceptorApi.get(`/clientes?page=${page}&size=${size}&sort=${sort}`);
    const data = response.data;
    
    // Mapear el contenido para añadir la propiedad estado
    return {
        ...data,
        content: data.content.map((cliente: any) => ({
            ...cliente,
            estado: cliente.fechaBaja === null ? "Activo" : "Inactivo"
        }))
    };
};

/**
 * Obtiene un cliente por su ID
 * @param id - ID del cliente
 * @returns Datos del cliente
 */
export const fetchClienteById = async (id: number): Promise<ClienteApi> => {
    const response = await interceptorApi.get(`/clientes/${id}`);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Crea un nuevo cliente
 * @param clienteData - Datos del cliente a crear
 * @returns Datos del cliente creado
 */
export const createCliente = async (clienteData: {
    nombre: string;
    apellido: string;
    telefono?: number;
    password: string;
    email: string;
    rol: any;
}): Promise<ClienteApi> => {
    const response = await interceptorApi.post("/clientes", clienteData);
    const data = response.data;
    
    return {
        ...data,
        estado: "Activo" // Un cliente recién creado siempre está activo
    };
};

/**
 * Actualiza un cliente existente
 * @param id - ID del cliente a actualizar
 * @param clienteData - Nuevos datos del cliente
 * @returns Datos del cliente actualizado
 */
export const updateCliente = async (id: number, UpdateCliente: {
    nombre: string;
    apellido: string;
    telefono?: number;
    email: string;
    auth0Id: string;
}): Promise<ClienteApi> => {
    const response = await interceptorApi.put(`/clientes/${id}`, UpdateCliente);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Cambia el estado de un cliente (activo/inactivo)
 * @param id - ID del cliente
 */
export const patchEstadoCliente = async (id: number) => {
    const response = await interceptorApi.patch(`/clientes/${id}/estado`);
    return response.data;
};

// ================================================================
// ENDPOINTS PARA PROMOCIONES
// ================================================================

/**
 * Obtiene todas las promociones
 * @returns Lista de promociones
 */
export const fetchPromociones = async (): Promise<PromocionApi[]> => {
    const response = await interceptorApi.get("/promociones");
    return response.data;
};

/**
 * Obtiene una promoción por su ID
 * @param id - ID de la promoción
 * @returns Datos de la promoción
 */
export const fetchPromocionById = async (id: number): Promise<PromocionApi> => {
    const response = await interceptorApi.get(`/promociones/${id}`);
    return response.data;
};

/**
 * Obtiene todas las promociones activas
 * @returns Lista de promociones activas
 */
export const fetchPromocionesActivas = async (): Promise<PromocionApi[]> => {
    const response = await interceptorApi.get("/promociones/activas");
    return response.data;
};


/**
 * Crea una nueva promoción
 * @param promocionData - Datos de la promoción a crear
 * @returns Datos de la promoción creada
 */
export const createPromocion = async (promocionData: Omit<PromocionApi, "id">): Promise<PromocionApi> => {
    const response = await interceptorApi.post("/promociones", promocionData);
    return response.data;
};

/**
 * Actualiza una promoción existente
 * @param id - ID de la promoción a actualizar
 * @param promocionData - Nuevos datos de la promoción
 * @returns Datos de la promoción actualizada
 */
export const updatePromocion = async (
    id: number,
    promocionData: Omit<PromocionApi, "id">
): Promise<PromocionApi> => {
    const response = await interceptorApi.put(`/promociones/${id}`, promocionData);
    return response.data;
};

// ================================================================
// ENDPOINTS PARA EMPLEADOS
// ================================================================

/**
 * Obtiene una lista paginada de empleados
 * @param page - Número de página (default: 0)
 * @param size - Tamaño de página (default: 8)
 * @param sort - Campo de ordenamiento (default: "id")
 * @returns Objeto con contenido paginado e información de paginación
 */
export const fetchEmpleados = async (
    page: number = 0,
    size: number = 8,
    sort: string = "id"
): Promise<{
    content: EmpleadoApi[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}> => {
    const response = await interceptorApi.get(`/empleados?page=${page}&size=${size}&sort=${sort}`);
    const data = response.data;
    
    // Mapear el contenido para añadir la propiedad estado
    return {
        ...data,
        content: data.content.map((empleado: any) => ({
            ...empleado,
            estado: empleado.fechaBaja === null ? "Activo" : "Inactivo"
        }))
    };
};

/**
 * Obtiene un empleado por su ID
 * @param id - ID del empleado
 * @returns Datos del empleado
 */
export const fetchEmpleadoById = async (id: number): Promise<EmpleadoApi> => {
    const response = await interceptorApi.get(`/empleados/${id}`);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Verifica si un usuario Auth0 corresponde a un empleado
 * @param auth0Id - ID de Auth0 del usuario
 * @returns Datos del empleado o false si no existe
 */
export const getUserByAuthId = async (auth0Id: string): Promise<EmpleadoApi | boolean> => {
    try {
        const response = await interceptorApi.post("/empleados/getUserById", { auth0Id });
        return response.data;
    } catch (error) {
        return false;
    }
};

/**
 * Crea un nuevo empleado
 * @param empleadoData - Datos del empleado a crear
 * @returns Datos del empleado creado
 */
export const createEmpleado = async (empleadoData: {
    nombre: string;
    apellido: string;
    telefono: number;
    password: string;
    email: string;
    rol: { id: number };
}): Promise<EmpleadoApi> => {
    const response = await interceptorApi.post("/empleados", empleadoData);
    const data = response.data;
    
    return {
        ...data,
        estado: "Activo" // Un empleado recién creado siempre está activo
    };
};

/**
 * Actualiza un empleado existente
 * @param id - ID del empleado a actualizar
 * @param empleadoData - Nuevos datos del empleado
 * @returns Datos del empleado actualizado
 */
export const updateEmpleado = async (id: number, UpdateEmpleado: {
    nombre: string;
    apellido: string;
    telefono: number;
    email: string;
    auth0Id: string;
    rol?: { id: number };
}): Promise<EmpleadoApi> => {
    const response = await interceptorApi.put(`/empleados/${id}`, UpdateEmpleado);
    const data = response.data;
    
    return {
        ...data,
        estado: data.fechaBaja === null ? "Activo" : "Inactivo"
    };
};

/**
 * Cambia el estado de un empleado (activo/inactivo)
 * @param id - ID del empleado
 */
export const patchEstadoEmpleado = async (id: number) => {
    const response = await interceptorApi.patch(`/empleados/${id}/estado`);
    return response.data;
};

// ================================================================
// ÍNDICE DE FUNCIONES POR SECCIÓN
// ================================================================

/*
INSUMOS:
- fetchInsumos()               - GET /api/insumos (paginado)
- patchEstadoInsumo()         - PATCH /api/insumos/{id}/estado
- createInsumo()              - POST /api/insumos
- updateInsumo()              - PUT /api/insumos/{id}

REGISTRO DE INSUMOS:
- createRegistroInsumo()      - POST /api/registros-insumo

RUBROS:
- fetchRubros()               - GET /api/rubros
- fetchRubrosTable()          - GET /api/rubros (formato tabla)
- patchEstadoRubro()          - PATCH /api/rubros/{id}/estado
- createRubro()               - POST /api/rubros
- updateRubro()               - PUT /api/rubros/{id}

ARTÍCULOS MANUFACTURADOS:
- fetchArticulosManufacturados()     - GET /api/manufacturados (paginado)
- fetchArticuloManufacturadoById()   - GET /api/manufacturados/{id}
- patchEstadoArticuloManufacturado() - PATCH /api/manufacturados/{id}/estado
- createArticuloManufacturado()      - POST /api/manufacturados
- updateArticuloManufacturado()      - PUT /api/manufacturados/{id}

ROLES:
- fetchRoles()               - GET /api/roles
- fetchRolById()             - GET /api/roles/{id}
- createRol()                - POST /api/roles
- updateRol()                - PUT /api/roles/{id}
- patchEstadoRol()           - PATCH /api/roles/{id}/estado

CLIENTES:
- fetchClientes()             - GET /api/clientes (paginado)
- fetchClienteById()         - GET /api/clientes/{id}
- createCliente()            - POST /api/clientes
- updateCliente()            - PUT /api/clientes/{id}
- patchEstadoCliente()       - PATCH /api/clientes/{id}/estado

PROMOCIONES:
- fetchPromociones()         - GET /api/promociones
- fetchPromocionById()       - GET /api/promociones/{id}
- fetchPromocionesActivas()  - GET /api/promociones/activas
- createPromocion()          - POST /api/promociones
- updatePromocion()          - PUT /api/promociones/{id}

EMPLEADOS:
- fetchEmpleados()             - GET /api/empleados (paginado)
- fetchEmpleadoById()         - GET /api/empleados/{id}
- getUserByAuthId()           - POST /api/empleados/getUserById
- createEmpleado()            - POST /api/empleados
- updateEmpleado()            - PUT /api/empleados/{id}
- patchEstadoEmpleado()       - PATCH /api/empleados/{id}/estado
*/