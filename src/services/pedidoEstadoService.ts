import websocketService from './websocketService';
import { EstadoApi } from '../types/adminTypes';
import { CambioEstadoDTO } from '../types/pedidosTypes';
import { toast } from 'react-toastify';

class PedidoEstadoService {
  private static instance: PedidoEstadoService;
  private listeners: ((cambio: CambioEstadoDTO) => void)[] = [];
  private initialized = false;
  private serverUrl = '';

  // Constructor privado (Singleton)
  private constructor() {}

  // Obtener instancia
  public static getInstance(): PedidoEstadoService {
    if (!PedidoEstadoService.instance) {
      PedidoEstadoService.instance = new PedidoEstadoService();
    }
    return PedidoEstadoService.instance;
  }

  // Inicializar el servicio y conectar al WebSocket
  public async init(serverUrl: string = 'http://localhost:8080/pizzamia-websocket'): Promise<void> {
    if (this.initialized) {
      console.log('Servicio ya inicializado');
      return;
    }

    this.serverUrl = serverUrl;
    console.log('Inicializando servicio WebSocket...');

    try {
      // Conectar al WebSocket
      await websocketService.connect(serverUrl);
      console.log('Conexión WebSocket exitosa');

      // Suscribirse al tópico de cambios de estado
      websocketService.subscribe('/topic/estado-pedidos', (message) => {
        this.handleStateChange(message);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error al inicializar WebSocket:', error);
      toast.error('Error de conexión con el servidor. Reintentando...');
      
      // Programar un reintento después de 5 segundos
      setTimeout(() => this.init(serverUrl), 5000);
    }
  }

  // Manejar mensajes de cambio de estado
  private handleStateChange(cambio: CambioEstadoDTO): void {
    console.log('Cambio de estado recibido:', cambio);
    
    if (cambio.error) {
      toast.error(`Error: ${cambio.error}`);
      return;
    }
    
    // Notificar a todos los listeners
    this.listeners.forEach(listener => listener(cambio));
    
    // Mostrar notificación de éxito
    toast.success(`Pedido #${cambio.pedidoId} actualizado a ${cambio.nuevoEstadoNombre}`);
  }

  // Suscribirse a cambios de estado
  public onStateChange(callback: (cambio: CambioEstadoDTO) => void): () => void {
    this.listeners.push(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Solicitar un cambio de estado
  public cambiarEstado(
    pedidoId: number,
    nuevoEstadoId: number,
    empleadoId: number,
    estadoAnteriorId?: number
  ): boolean {
    if (!empleadoId) {
      toast.error('No se pudo identificar al empleado');
      return false;
    }
    
    // Crear mensaje para el cambio de estado
    const cambio: CambioEstadoDTO = {
      pedidoId,
      nuevoEstadoId,
      empleadoId,
      estadoAnteriorId
    };
    
    // Verificar conexión y enviar mensaje
    if (!websocketService.isConnected()) {
      toast.warning('Intentando conectar al servidor...');
      
      // Intentar reconexión
      websocketService.connect(this.serverUrl)
        .then(() => {
          const enviado = websocketService.sendMessage('/app/cambiar-estado', cambio);
          if (enviado) {
            toast.info('Procesando cambio de estado...');
          } else {
            toast.error('No se pudo enviar la solicitud después de reconectar');
          }
        })
        .catch(() => {
          toast.error('No se pudo establecer conexión con el servidor');
        });
      
      return false;
    }
    
    // Enviar mensaje si ya estamos conectados
    const enviado = websocketService.sendMessage('/app/cambiar-estado', cambio);
    
    if (enviado) {
      toast.info('Procesando cambio de estado...');
    } else {
      toast.error('Error al enviar solicitud de cambio de estado');
    }
    
    return enviado;
  }

  // Verificar si la conexión está activa
  public isConnected(): boolean {
    return websocketService.isConnected();
  }

  // Intentar reconectar
  public async reconnect(): Promise<boolean> {
    try {
      const connected = await websocketService.connect(this.serverUrl);
      
      if (connected) {
        // Volver a suscribirse al tópico
        websocketService.subscribe('/topic/estado-pedidos', (message) => {
          this.handleStateChange(message);
        });
      }
      
      return connected;
    } catch (error) {
      console.error('Error al reconectar:', error);
      return false;
    }
  }

  // Verificar si un rol puede cambiar de un estado a otro
  public puedeRealizarCambio(estadoActual: string, nuevoEstado: string, rol: string | null): boolean {
    if (!rol) return false;
    
    // Admin puede hacer cualquier cambio
    if (rol.toUpperCase() === 'ADMIN') return true;
    
    switch (rol.toUpperCase()) {
      case 'CAJERO':
        return (estadoActual === 'EN ESPERA' && nuevoEstado === 'EN COCINA') ||
               (estadoActual === 'LISTO' && (nuevoEstado === 'FACTURADO' || nuevoEstado === 'EN DELIVERY')) ||
               (estadoActual === 'ENTREGADO' && nuevoEstado === 'FACTURADO');
      
      case 'COCINERO':
        return (estadoActual === 'EN COCINA' && nuevoEstado === 'EN PREPARACION') ||
               (estadoActual === 'EN PREPARACION' && nuevoEstado === 'LISTO');

      case 'DELIVERY':
        return (estadoActual === 'EN DELIVERY' && nuevoEstado === 'ENTREGADO');

      default:
        return false;
    }
  }

  // Obtener estados disponibles para un rol y estado actual
  public getEstadosDisponibles(estadoActual: string, rol: string | null, todosLosEstados: EstadoApi[]): EstadoApi[] {
    if (!rol) return [];
    
    // Admin puede ver todos los estados
    if (rol.toUpperCase() === 'ADMIN') return todosLosEstados;
    
    // Filtrar según rol y estado actual
    switch (rol.toUpperCase()) {
      case 'CAJERO':
        if (estadoActual === 'EN ESPERA') {
          return todosLosEstados.filter(e => e.denominacion === 'EN COCINA');
        } else if (estadoActual === 'LISTO') {
          return todosLosEstados.filter(e => e.denominacion === 'FACTURADO' || e.denominacion === 'EN DELIVERY');
        } else if (estadoActual === 'ENTREGADO') {
          return todosLosEstados.filter(e => e.denominacion === 'FACTURADO');
        }
        break;
      
      case 'COCINERO':
        if (estadoActual === 'EN COCINA') {
          return todosLosEstados.filter(e => e.denominacion === 'EN PREPARACION');
        } else if (estadoActual === 'EN PREPARACION') {
          return todosLosEstados.filter(e => e.denominacion === 'LISTO');
        }
        break;

      case 'DELIVERY':
      // El delivery puede cambiar el estado de EN DELIVERY a ENTREGADO
      if (estadoActual === 'EN DELIVERY') {
        return todosLosEstados.filter(e => e.denominacion === 'ENTREGADO');
      }
      break;
    }
    
    return [];
  }

  // Obtener estados visibles para un rol
  public getEstadosVisibles(rol: string | null): string[] {
    if (!rol) return [];
    
    // Admin puede ver todos los estados
    if (rol.toUpperCase() === 'ADMIN') {
      return ['EN ESPERA', 'EN COCINA', 'EN PREPARACION', 'LISTO', 'FACTURADO', 'EN DELIVERY', 'ENTREGADO'];
    }
    
    switch (rol.toUpperCase()) {
      case 'CAJERO':
        return ['EN ESPERA', 'LISTO', 'ENTREGADO', 'FACTURADO'];
      
      case 'COCINERO':
        return ['EN COCINA', 'EN PREPARACION'];

      case 'DELIVERY':
      return ['EN DELIVERY', 'ENTREGADO'];
      
      default:
        return [];
    }
  }

  // Limpiar recursos
  public cleanup(): void {
    if (websocketService.isConnected()) {
      // Cancelar suscripción
      websocketService.unsubscribe('/topic/estado-pedidos');
      
      // Desconectar
      websocketService.disconnect();
    }
    
    this.listeners = [];
    this.initialized = false;
  }
}

export default PedidoEstadoService.getInstance();