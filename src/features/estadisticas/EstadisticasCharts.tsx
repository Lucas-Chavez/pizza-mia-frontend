import { ForwardedRef, forwardRef, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import styles from "./EstadisticasSection.module.css";
import { 
    fetchTopClientesPorPedidos, 
    fetchBalanceDiario, 
    fetchTopProductosVendidos 
} from "../../api/adminApi";
import { ClientePedidosDTO, ProductoVendidoDTO } from "../../types/adminTypes";
import { toast } from "react-toastify";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Función para obtener fecha de hace 7 días en formato YYYY-MM-DD
const getOneWeekAgo = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};

// Función para obtener fecha actual en formato YYYY-MM-DD
const getCurrentDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

// Calcular la popularidad basada en la cantidad vendida (respecto al máximo)
const calculatePopularity = (productos: ProductoVendidoDTO[]): (ProductoVendidoDTO & { popularidad: number })[] => {
    if (!productos.length) return [];
    
    const maxVentas = Math.max(...productos.map(p => p.cantidadVendida));
    
    return productos.map(producto => ({
        ...producto,
        popularidad: Math.round((producto.cantidadVendida / maxVentas) * 100)
    }));
};

// Devuelve un color basado en el nivel de popularidad
export const getPopularityColor = (popularity: number): string => {
    if (popularity >= 80) return '#5ACD40';
    if (popularity >= 60) return '#FAAE42';
    return '#D64C4C';
};

export const EstadisticasCharts = forwardRef(
    (
        {
            balanceRef,
            topProductosRef,
            topClientesRef,
            onDataUpdate
        }: {
            balanceRef: ForwardedRef<HTMLDivElement>;
            topProductosRef: ForwardedRef<HTMLDivElement>;
            topClientesRef: ForwardedRef<HTMLDivElement>;
            onDataUpdate?: (
                balanceData: any,
                topProductos: (ProductoVendidoDTO & { popularidad: number })[],
                topClientes: ClientePedidosDTO[]
            ) => void;
        },
        _
    ) => {
        // Estados para almacenar los datos de la API
        const [loading, setLoading] = useState<boolean>(true);
        const [balanceData, setBalanceData] = useState<{
            labels: string[];
            datasets: {
                label: string;
                data: number[];
                backgroundColor: string;
            }[];
        }>({
            labels: [],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [],
                    backgroundColor: '#5ACD40',
                },
                {
                    label: 'Gastos',
                    data: [],
                    backgroundColor: '#D64C4C',
                }
            ],
        });
        
        const [topProductos, setTopProductos] = useState<(ProductoVendidoDTO & { popularidad: number })[]>([]);
        const [topClientes, setTopClientes] = useState<ClientePedidosDTO[]>([]);

        // Actualizar datos para exportación cuando cambien
        useEffect(() => {
            if (onDataUpdate) {
                onDataUpdate(balanceData, topProductos, topClientes);
            }
        }, [balanceData, topProductos, topClientes, onDataUpdate]);

        // Cargar los datos al montar el componente
        useEffect(() => {
            const cargarDatos = async () => {
                setLoading(true);
                try {
                    // Obtener fechas para el rango de balance
                    const fechaInicio = getOneWeekAgo();
                    const fechaFin = getCurrentDate();

                    // Cargar datos de balance
                    const balanceResponse = await fetchBalanceDiario(fechaInicio, fechaFin);
                    
                    // Formatear los datos para el gráfico - CORREGIR AQUÍ EL PROBLEMA DE FECHAS
                    const labels = balanceResponse.map(b => {
                        // Corregir el problema de defasaje de fechas
                        // Formato de fecha recibida: "2025-06-24"
                        const [year, month, day] = b.fecha.split('-').map(Number);
                        
                        // Crear la fecha usando constructor con año, mes (0-indexed) y día
                        // Especificar timezone local para evitar conversiones automáticas
                        const fecha = new Date(year, month - 1, day, 12, 0, 0);
                        
                        return fecha.toLocaleDateString('es-AR', { 
                            weekday: 'short', 
                            day: 'numeric' 
                        });
                    });
                    
                    const ingresos = balanceResponse.map(b => b.ingresos);
                    const gastos = balanceResponse.map(b => b.gastos);
                    
                    setBalanceData({
                        labels,
                        datasets: [
                            {
                                label: 'Ingresos',
                                data: ingresos,
                                backgroundColor: '#5ACD40',
                            },
                            {
                                label: 'Gastos',
                                data: gastos,
                                backgroundColor: '#D64C4C',
                            }
                        ],
                    });

                    // Cargar datos de productos más vendidos
                    const productosResponse = await fetchTopProductosVendidos(5);
                    setTopProductos(calculatePopularity(productosResponse));

                    // Cargar datos de clientes con más pedidos
                    const clientesResponse = await fetchTopClientesPorPedidos(5);
                    setTopClientes(clientesResponse);

                } catch (error) {
                    console.error("Error al cargar datos de estadísticas:", error);
                    toast.error("Error al cargar estadísticas. Mostrando datos de ejemplo.");
                    
                    // Usar datos de ejemplo en caso de error
                    cargarDatosEjemplo();
                } finally {
                    setLoading(false);
                }
            };

            cargarDatos();
        }, []);

        // Función para cargar datos de ejemplo en caso de error
        const cargarDatosEjemplo = () => {
            // Datos de ejemplo para balance
            setBalanceData({
                labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [12000, 15000, 8000, 10000, 16000, 20000, 22000],
                        backgroundColor: '#5ACD40',
                    },
                    {
                        label: 'Gastos',
                        data: [8000, 9000, 7500, 9200, 10000, 12000, 13000],
                        backgroundColor: '#D64C4C',
                    },
                ],
            });

            // Datos de ejemplo para productos
            setTopProductos([
                { productoId: 1, tipo: "MANUFACTURADO", denominacion: 'Pizza Rústica', rubroDenominacion: 'Pizzas', cantidadVendida: 45, totalVentas: 45000, popularidad: 85 },
                { productoId: 2, tipo: "MANUFACTURADO", denominacion: 'Pizza Napolitana', rubroDenominacion: 'Pizzas', cantidadVendida: 40, totalVentas: 38000, popularidad: 78 },
                { productoId: 3, tipo: "MANUFACTURADO", denominacion: 'Pizza 4 Quesos', rubroDenominacion: 'Pizzas', cantidadVendida: 52, totalVentas: 52000, popularidad: 92 },
                { productoId: 4, tipo: "MANUFACTURADO", denominacion: 'Pizza Margarita', rubroDenominacion: 'Pizzas', cantidadVendida: 35, totalVentas: 33000, popularidad: 70 },
                { productoId: 5, tipo: "MANUFACTURADO", denominacion: 'Pizza Vegetariana', rubroDenominacion: 'Pizzas', cantidadVendida: 30, totalVentas: 29000, popularidad: 65 },
            ]);

            // Datos de ejemplo para clientes
            setTopClientes([
                { clienteId: 1, nombreCompleto: 'Lucas Chavez', email: 'lucas@example.com', cantidadPedidos: 20 },
                { clienteId: 2, nombreCompleto: 'Franco Castillo', email: 'franco@example.com', cantidadPedidos: 25 },
                { clienteId: 3, nombreCompleto: 'Mariana Rodríguez', email: 'mariana@example.com', cantidadPedidos: 18 },
                { clienteId: 4, nombreCompleto: 'Gabriel Torres', email: 'gabriel@example.com', cantidadPedidos: 22 },
                { clienteId: 5, nombreCompleto: 'Valentina López', email: 'valentina@example.com', cantidadPedidos: 15 },
            ]);
        };

        // Opciones para el gráfico de balance
        const balanceOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top' as const,
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                title: { display: false },
                tooltip: { enabled: true },
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#888', font: { size: 12 } },
                },
                y: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#888', font: { size: 12 } },
                    beginAtZero: true,
                },
            },
            elements: {
                bar: { borderRadius: 6, borderSkipped: false },
            },
        };

        return (
            <>
                {/* Sección de Balance */}
                <div className={styles.balanceContainer}>
                    <div className={styles.sectionContainer} ref={balanceRef}>
                        <h2 className={styles.sectionTitle}>Balance Semanal</h2>
                        {loading ? (
                            <div className={styles.loadingContainer}>Cargando datos...</div>
                        ) : (
                            <div className={styles.chartContainer}>
                                <Bar data={balanceData} options={balanceOptions} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenedor para las dos tablas inferiores */}
                <div className={styles.bottomTablesContainer}>
                    {/* Top Productos */}
                    <div className={styles.sectionContainer} ref={topProductosRef}>
                        <h2 className={styles.sectionTitle}>Top Productos</h2>
                        {loading ? (
                            <div className={styles.loadingContainer}>Cargando datos...</div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <table className={styles.customTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre</th>
                                            <th>Popularidad</th>
                                            <th>Ventas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProductos.map((producto, index) => (
                                            <tr key={producto.productoId}>
                                                <td>{index + 1}</td>
                                                <td>{producto.denominacion}</td>
                                                <td>
                                                    <div className={styles.popularityContainer}>
                                                        <div
                                                            className={styles.popularityBar}
                                                            style={{
                                                                width: `${producto.popularidad}%`,
                                                                backgroundColor: getPopularityColor(producto.popularidad),
                                                            }}
                                                        />
                                                        <span className={styles.popularityText}>{producto.popularidad}%</span>
                                                    </div>
                                                </td>
                                                <td>{producto.cantidadVendida}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {/* Top Clientes */}
                    <div className={styles.sectionContainer} ref={topClientesRef}>
                        <h2 className={styles.sectionTitle}>Top Clientes</h2>
                        {loading ? (
                            <div className={styles.loadingContainer}>Cargando datos...</div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <table className={styles.customTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre</th>
                                            <th>Compras</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topClientes.map((cliente, index) => (
                                            <tr key={cliente.clienteId}>
                                                <td>{index + 1}</td>
                                                <td>{cliente.nombreCompleto}</td>
                                                <td>{cliente.cantidadPedidos}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
);

// Necesario para que forwardRef funcione correctamente con TypeScript
EstadisticasCharts.displayName = 'EstadisticasCharts';