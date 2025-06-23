export interface CambioEstadoDTO {
  pedidoId: number;
  nuevoEstadoId: number;
  empleadoId: number;
  estadoAnteriorId?: number;
  nuevoEstadoNombre?: string;
  error?: string;
}

export interface EmpleadoResponse {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  rol?: string;
  auth0Id?: string;
  activo?: boolean;
}