import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Definición de tipos básicos
type MessageCallback = (message: any) => void;

class WebSocketService {
  private stompClient: any = null;
  private subscriptions: Map<string, any> = new Map();
  private serverUrl: string = '';

  // Inicializar y conectar al WebSocket
  connect(serverUrl: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.stompClient) {
        console.log('Ya existe una conexión WebSocket');
        resolve(true);
        return;
      }

      this.serverUrl = serverUrl;
      const socket = new SockJS(serverUrl);
      this.stompClient = Stomp.over(socket);

      // Opcional: desactivar logs detallados
      // this.stompClient.debug = null;

      this.stompClient.connect({}, 
        // Callback de conexión exitosa
        (frame: any) => {
          console.log('Conectado al WebSocket:', frame);
          resolve(true);
        }, 
        // Callback de error
        (error: any) => {
          console.error('Error de conexión WebSocket:', error);
          this.stompClient = null;
          reject(error);
        }
      );
    });
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.stompClient !== null && this.stompClient.connected;
  }

  // Suscribirse a un tópico
  subscribe(topic: string, callback: MessageCallback): void {
    if (!this.stompClient || !this.isConnected()) {
      console.error('No se puede suscribir: WebSocket no conectado');
      return;
    }

    // Cancelar suscripción existente al mismo tópico si existe
    if (this.subscriptions.has(topic)) {
      this.unsubscribe(topic);
    }

    // Crear nueva suscripción
    const subscription = this.stompClient.subscribe(topic, (message: any) => {
      try {
        const body = JSON.parse(message.body);
        console.log(`Mensaje recibido de ${topic}:`, body);
        callback(body);
      } catch (e) {
        console.error('Error al procesar mensaje:', e);
        callback(message.body);
      }
    });

    // Guardar la suscripción
    this.subscriptions.set(topic, subscription);
    console.log(`Suscrito a ${topic}`);
  }

  // Cancelar suscripción a un tópico
  unsubscribe(topic: string): void {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Suscripción cancelada a ${topic}`);
    }
  }

  // Enviar mensaje
  sendMessage(destination: string, body: any): boolean {
    if (!this.stompClient || !this.isConnected()) {
      console.error('No se puede enviar mensaje: WebSocket no conectado');
      return false;
    }

    try {
      const message = JSON.stringify(body);
      this.stompClient.send(destination, {}, message);
      console.log(`Mensaje enviado a ${destination}:`, body);
      return true;
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
      return false;
    }
  }

  // Desconectar
  disconnect(): void {
    if (this.stompClient && this.isConnected()) {
      // Cancelar todas las suscripciones
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Desconectar el cliente
      this.stompClient.disconnect(() => {
        console.log('Desconectado del WebSocket');
      });
      this.stompClient = null;
    }
  }
}

// Exportar una instancia única del servicio
const websocketService = new WebSocketService();
export default websocketService;