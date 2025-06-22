import shared from '../../styles/common/Common.module.css';
import { useState } from "react";
import GestionTable from "./ui/GestionTable";
import HeaderFilterGestion from "./ui/HeaderFilterGestion"; // Importa el header

// Type para PedidoDetalle
export type PedidoDetalle = {
    id: number;
    cantidad: number;
    subTotal?: number;
    articuloInsumo?: {
        id: number;
        denominacion: string;
        precioVenta: number;
    };
    articuloManufacturado?: {
        id: number;
        denominacion: string;
        precioVenta: number;
    };
    promocion?: {
        id: number;
        descuento: number;
    };
};

// Type para Pedido
export type Pedido = {
    id: number;
    horaEstimadaFinalizacion: string; // ISO string para fechas
    total?: number;
    totalCosto?: number;
    estado: {
        id: number;
        nombre: string;
    };
    tipoEnvio: 'DOMICILIO' | 'RETIRO_LOCAL'; // Enum
    tipoPago: 'EFECTIVO' | 'TARJETA'; // Enum
    detalles: PedidoDetalle[];
    cliente: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
    };
    empleado: {
        id: number;
        nombre: string;
        apellido: string;
    };
};

// Datos de ejemplo hardcodeados. 
// ------------------------------
// MODIFICACIÓN: Elimina este array y reemplázalo por el estado que se llenará con la respuesta de la API.
const pedidosEjemplo: Pedido[] = [
    {
        id: 1001,
        horaEstimadaFinalizacion: "2025-06-22T12:30:00Z",
        total: 3500,
        totalCosto: 2500,
        estado: { id: 1, nombre: "En Preparacion" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 1, nombre: "Juan", apellido: "Pérez", email: "juan.perez@email.com" },
        empleado: { id: 1, nombre: "Pedro", apellido: "García" }
    },
    {
        id: 1002,
        horaEstimadaFinalizacion: "2025-06-22T13:00:00Z",
        total: 2200,
        totalCosto: 1800,
        estado: { id: 2, nombre: "Pendiente" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 2, nombre: "María", apellido: "López", email: "maria.lopez@email.com" },
        empleado: { id: 2, nombre: "Lucía", apellido: "Fernández" }
    },
    {
        id: 1003,
        horaEstimadaFinalizacion: "2025-06-22T13:30:00Z",
        total: 4100,
        totalCosto: 3200,
        estado: { id: 3, nombre: "Entregado" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 3, nombre: "Carlos", apellido: "Gómez", email: "carlos.gomez@email.com" },
        empleado: { id: 3, nombre: "Sofía", apellido: "Martínez" }
    },
    {
        id: 1004,
        horaEstimadaFinalizacion: "2025-06-22T14:00:00Z",
        total: 1800,
        totalCosto: 1500,
        estado: { id: 4, nombre: "En Camino" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 4, nombre: "Ana", apellido: "Torres", email: "ana.torres@email.com" },
        empleado: { id: 4, nombre: "Miguel", apellido: "Ruiz" }
    },
    {
        id: 1005,
        horaEstimadaFinalizacion: "2025-06-22T14:30:00Z",
        total: 2500,
        totalCosto: 2000,
        estado: { id: 1, nombre: "En Preparacion" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 5, nombre: "Laura", apellido: "Mendoza", email: "laura.mendoza@email.com" },
        empleado: { id: 5, nombre: "Javier", apellido: "Sosa" }
    },
    {
        id: 1006,
        horaEstimadaFinalizacion: "2025-06-22T15:00:00Z",
        total: 3200,
        totalCosto: 2700,
        estado: { id: 2, nombre: "Pendiente" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 6, nombre: "Diego", apellido: "Silva", email: "diego.silva@email.com" },
        empleado: { id: 6, nombre: "Valeria", apellido: "Castro" }
    },
    {
        id: 1007,
        horaEstimadaFinalizacion: "2025-06-22T15:30:00Z",
        total: 2900,
        totalCosto: 2100,
        estado: { id: 3, nombre: "Entregado" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 7, nombre: "Sergio", apellido: "Ramos", email: "sergio.ramos@email.com" },
        empleado: { id: 7, nombre: "Cecilia", apellido: "Moreno" }
    },
    {
        id: 1008,
        horaEstimadaFinalizacion: "2025-06-22T16:00:00Z",
        total: 1700,
        totalCosto: 1300,
        estado: { id: 4, nombre: "En Camino" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 8, nombre: "Paula", apellido: "Vega", email: "paula.vega@email.com" },
        empleado: { id: 8, nombre: "Marcos", apellido: "Luna" }
    },
    {
        id: 1009,
        horaEstimadaFinalizacion: "2025-06-22T16:30:00Z",
        total: 3600,
        totalCosto: 2900,
        estado: { id: 1, nombre: "En Preparacion" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 9, nombre: "Lucas", apellido: "Paz", email: "lucas.paz@email.com" },
        empleado: { id: 9, nombre: "Andrea", apellido: "Navarro" }
    },
    {
        id: 1010,
        horaEstimadaFinalizacion: "2025-06-22T17:00:00Z",
        total: 2100,
        totalCosto: 1600,
        estado: { id: 2, nombre: "Pendiente" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 10, nombre: "Martín", apellido: "Suárez", email: "martin.suarez@email.com" },
        empleado: { id: 10, nombre: "Patricia", apellido: "Giménez" }
    },
    {
        id: 1011,
        horaEstimadaFinalizacion: "2025-06-22T17:30:00Z",
        total: 4000,
        totalCosto: 3200,
        estado: { id: 3, nombre: "Entregado" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 11, nombre: "Camila", apellido: "Herrera", email: "camila.herrera@email.com" },
        empleado: { id: 11, nombre: "Gustavo", apellido: "Ortega" }
    },
    {
        id: 1012,
        horaEstimadaFinalizacion: "2025-06-22T18:00:00Z",
        total: 1800,
        totalCosto: 1400,
        estado: { id: 4, nombre: "En Camino" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 12, nombre: "Valentín", apellido: "Ríos", email: "valentin.rios@email.com" },
        empleado: { id: 12, nombre: "Elena", apellido: "Maldonado" }
    },
    {
        id: 1013,
        horaEstimadaFinalizacion: "2025-06-22T18:30:00Z",
        total: 3300,
        totalCosto: 2600,
        estado: { id: 1, nombre: "En Preparacion" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 13, nombre: "Agustina", apellido: "Sánchez", email: "agustina.sanchez@email.com" },
        empleado: { id: 13, nombre: "Ramiro", apellido: "Vargas" }
    },
    {
        id: 1014,
        horaEstimadaFinalizacion: "2025-06-22T19:00:00Z",
        total: 2700,
        totalCosto: 2100,
        estado: { id: 2, nombre: "Pendiente" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 14, nombre: "Emilia", apellido: "Cruz", email: "emilia.cruz@email.com" },
        empleado: { id: 14, nombre: "Federico", apellido: "Serrano" }
    },
    {
        id: 1015,
        horaEstimadaFinalizacion: "2025-06-22T19:30:00Z",
        total: 3900,
        totalCosto: 3100,
        estado: { id: 3, nombre: "Entregado" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 15, nombre: "Nicolás", apellido: "Peralta", email: "nicolas.peralta@email.com" },
        empleado: { id: 15, nombre: "Florencia", apellido: "Moya" }
    },
    {
        id: 1016,
        horaEstimadaFinalizacion: "2025-06-22T20:00:00Z",
        total: 1600,
        totalCosto: 1200,
        estado: { id: 4, nombre: "En Camino" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 16, nombre: "Lucía", apellido: "Bravo", email: "lucia.bravo@email.com" },
        empleado: { id: 16, nombre: "Tomás", apellido: "Roldán" }
    },
    {
        id: 1017,
        horaEstimadaFinalizacion: "2025-06-22T20:30:00Z",
        total: 3400,
        totalCosto: 2700,
        estado: { id: 1, nombre: "En Preparacion" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 17, nombre: "Joaquín", apellido: "Maldonado", email: "joaquin.maldonado@email.com" },
        empleado: { id: 17, nombre: "Martina", apellido: "Paredes" }
    },
    {
        id: 1018,
        horaEstimadaFinalizacion: "2025-06-22T21:00:00Z",
        total: 2600,
        totalCosto: 2000,
        estado: { id: 2, nombre: "Pendiente" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 18, nombre: "Mateo", apellido: "Soto", email: "mateo.soto@email.com" },
        empleado: { id: 18, nombre: "Julieta", apellido: "Campos" }
    },
    {
        id: 1019,
        horaEstimadaFinalizacion: "2025-06-22T21:30:00Z",
        total: 3800,
        totalCosto: 3000,
        estado: { id: 3, nombre: "Entregado" },
        tipoEnvio: "DOMICILIO",
        tipoPago: "TARJETA",
        detalles: [],
        cliente: { id: 19, nombre: "Santiago", apellido: "Reyes", email: "santiago.reyes@email.com" },
        empleado: { id: 19, nombre: "Lorena", apellido: "Benítez" }
    },
    {
        id: 1020,
        horaEstimadaFinalizacion: "2025-06-22T22:00:00Z",
        total: 1500,
        totalCosto: 1100,
        estado: { id: 4, nombre: "En Camino" },
        tipoEnvio: "RETIRO_LOCAL",
        tipoPago: "EFECTIVO",
        detalles: [],
        cliente: { id: 20, nombre: "Renata", apellido: "Figueroa", email: "renata.figueroa@email.com" },
        empleado: { id: 20, nombre: "Franco", apellido: "Correa" }
    }
];

export const GestionSection: React.FC = () => {
    // Estado local para los pedidos.
    // MODIFICACIÓN: Inicializa como array vacío y usa useEffect para cargar desde la API.
    const [pedidos] = useState(pedidosEjemplo);

    // Estados para filtros
    const [estado, setEstado] = useState<string>("");
    const [cantidad, setCantidad] = useState<number>(10);
    const [search, setSearch] = useState<string>("");

    // Acciones de ejemplo
    const handleEdit = (pedido: any) => {
        alert(`Editar pedido #${pedido.id}`);
    };

    const handleVerReceta = (pedido: any) => {
        alert(`Ver detalle de pedido #${pedido.id}`);
    };

    const handleNuevoClick = () => {
        alert("Nuevo pedido");
    };

    // Filtrado simple (puedes mejorar la lógica según tus necesidades)
    // MODIFICACIÓN: Si la API soporta filtros, pásalos como parámetros en la consulta.
    const pedidosFiltrados = pedidos
        .filter(p =>
            (!estado || p.estado.nombre === estado) &&
            (`${p.cliente.nombre} ${p.cliente.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toString().includes(search))
        )
        .slice(0, cantidad);

    return (
        <div className={shared.adminContent}>
            <div className={shared.adminContentSection}>
                {/* Header con filtros */}
                <HeaderFilterGestion
                    title="Gestión de Pedidos"
                    estado={estado}
                    onEstadoChange={setEstado}
                    cantidad={cantidad}
                    onCantidadChange={setCantidad}
                    search={search}
                    onSearchChange={setSearch}
                    onNewClick={handleNuevoClick}
                />
                {/* Tabla de pedidos */}
                <div className={shared.tableContainer}>
                    <GestionTable
                        pedidos={pedidosFiltrados}
                        onEdit={handleEdit}
                        onVerReceta={handleVerReceta}
                    />
                </div>
            </div>
        </div>
    );
}