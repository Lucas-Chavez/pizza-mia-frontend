import { 
    InsumoApi, 
    RegistroInsumoApi, 
    RubroApi, 
    RubroTable, 
    ArticuloManufacturadoApi,
    ArticuloManufacturadoDetalleApi,
    RolApi,
    ClienteApi
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
    const res = await fetch(`/api/insumos?page=${page}&size=${size}&sort=${sort}`);
    if (!res.ok) throw new Error('Error al obtener insumos');
    const data = await res.json();
    
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
    const res = await fetch(`/api/insumos/${id}/estado`, { method: "PATCH" });
    if (!res.ok) throw new Error('Error al cambiar estado del insumo');
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
    
    const res = await fetch("/api/insumos", {
        method: "POST",
        body: formData,
    });
    
    if (!res.ok) throw new Error('Error al crear el insumo');
    return res.json();
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
    
    const res = await fetch(`/api/insumos/${id}`, {
        method: "PUT",
        body: formData,
    });
    
    if (!res.ok) throw new Error('Error al actualizar el insumo');
    return res.json();
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
    const res = await fetch("/api/registros-insumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registroData),
    });
    if (!res.ok) throw new Error('Error al registrar movimiento de stock');
    return res.json();
};

// ================================================================
// ENDPOINTS PARA RUBROS
// ================================================================

/**
 * Obtiene todos los rubros en formato API
 * @returns Lista de rubros
 */
export const fetchRubros = async (): Promise<RubroApi[]> => {
    const res = await fetch("/api/rubros");
    if (!res.ok) throw new Error('Error al obtener rubros');
    return res.json();
};

/**
 * Obtiene todos los rubros en formato de tabla (para mostrar en tablas)
 * @returns Lista de rubros formateados para tabla
 */
export const fetchRubrosTable = async (): Promise<RubroTable[]> => {
    const res = await fetch("/api/rubros");
    if (!res.ok) throw new Error('Error al obtener rubros para tabla');
    const data: RubroApi[] = await res.json();
    
    return data.map((r) => ({
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
    const res = await fetch(`/api/rubros/${id}/estado`, { method: "PATCH" });
    if (!res.ok) throw new Error('Error al cambiar estado del rubro');
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
    const res = await fetch("/api/rubros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rubroData),
    });
    if (!res.ok) throw new Error('Error al crear el rubro');
    return res.json();
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
    const res = await fetch(`/api/rubros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rubroData),
    });
    if (!res.ok) throw new Error('Error al actualizar el rubro');
    return res.json();
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
    const res = await fetch(`/api/manufacturados?page=${page}&size=${size}&sort=${sort}`);
    if (!res.ok) throw new Error('Error al obtener artículos manufacturados');
    const data = await res.json();
    
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
    const res = await fetch(`/api/manufacturados/${id}`);
    if (!res.ok) throw new Error('Error al obtener el artículo manufacturado');
    const data = await res.json();
    
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
    const res = await fetch(`/api/manufacturados/${id}/estado`, { method: "PATCH" });
    if (!res.ok) throw new Error('Error al cambiar estado del artículo manufacturado');
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
    
    const res = await fetch("/api/manufacturados", {
        method: "POST",
        body: formData,
    });
    
    if (!res.ok) throw new Error('Error al crear el artículo manufacturado');
    return res.json();
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
    
    const res = await fetch(`/api/manufacturados/${id}`, {
        method: "PUT",
        body: formData,
    });
    
    if (!res.ok) throw new Error('Error al actualizar el artículo manufacturado');
    return res.json();
};

// ================================================================
// ENDPOINTS PARA ROLES
// ================================================================

/**
 * Obtiene todos los roles
 * @returns Lista de roles
 */
export const fetchRoles = async (): Promise<RolApi[]> => {
    const res = await fetch("/api/roles");
    if (!res.ok) throw new Error('Error al obtener roles');
    const data = await res.json();
    
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
    const res = await fetch(`/api/roles/${id}`);
    if (!res.ok) throw new Error('Error al obtener el rol');
    const data = await res.json();
    
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
    const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rolData),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al crear el rol: ${errorText}`);
    }
    
    const data = await res.json();
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
    const res = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rolData),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar el rol: ${errorText}`);
    }
    
    const data = await res.json();
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
    const res = await fetch(`/api/roles/${id}/estado`, { method: "PATCH" });
    if (!res.ok) throw new Error('Error al cambiar estado del rol');
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
    const res = await fetch(`/api/clientes?page=${page}&size=${size}&sort=${sort}`);
    if (!res.ok) throw new Error('Error al obtener clientes');
    const data = await res.json();
    
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
    const res = await fetch(`/api/clientes/${id}`);
    if (!res.ok) throw new Error('Error al obtener el cliente');
    const data = await res.json();
    
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
    email: string;
    rol: any;
}): Promise<ClienteApi> => {
    const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear el cliente');
    }
    
    const data = await res.json();
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
export const updateCliente = async (id: number, clienteData: {
    nombre: string;
    apellido: string;
    telefono?: number;
    email: string;
    rol: any;
}): Promise<ClienteApi> => {
    const res = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar el cliente');
    }
    
    const data = await res.json();
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
    const res = await fetch(`/api/clientes/${id}/estado`, { method: "PATCH" });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cambiar estado del cliente');
    }
    return res.json();
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
*/