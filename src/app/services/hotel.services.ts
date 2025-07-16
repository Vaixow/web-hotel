import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces opcionales para tipos de datos
export interface Cliente {
  id: string;
  nombre: string;
  email: string;
}

export interface Habitacion {
  id: string;
  numero: string;
  tipo: string;
  precio: number;
}

export interface Reserva {
  id: string;
  clienteId: string;
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
}

export interface Pago {
  id: string;
  reservaId: string;
  monto: number;
  fechaPago: string;
  metodo: string;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = 'http://localhost:3000/api'; // URL base de la API

  constructor(private http: HttpClient) {}

  // --- CLIENTES ---
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }
  getCliente(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }
  crearCliente(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, cliente);
  }
  actualizarCliente(id: string, cliente: Partial<Cliente>): Observable<any> {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, cliente);
  }
  eliminarCliente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  // --- HABITACIONES ---
  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/habitaciones`);
  }
  getHabitacion(id: string): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/habitaciones/${id}`);
  }
  crearHabitacion(habitacion: Habitacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitaciones`, habitacion);
  }
  actualizarHabitacion(id: string, habitacion: Partial<Habitacion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/habitaciones/${id}`, habitacion);
  }
  eliminarHabitacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/habitaciones/${id}`);
  }

  // --- RESERVAS ---
  getReservas(clienteId?: string): Observable<Reserva[]> {
    const url = clienteId ? `${this.apiUrl}/reservas?clienteId=${clienteId}` : `${this.apiUrl}/reservas`;
    return this.http.get<Reserva[]>(url);
  }
  getReserva(id: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/reservas/${id}`);
  }
  crearReserva(reserva: Reserva): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, reserva);
  }
  actualizarReserva(id: string, reserva: Partial<Reserva>): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${id}`, reserva);
  }
  eliminarReserva(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/${id}`);
  }

  // --- PAGOS ---
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/pagos`);
  }
  getPago(id: string): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/pagos/${id}`);
  }
  crearPago(pago: Pago): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos`, pago);
  }
  actualizarPago(id: string, pago: Partial<Pago>): Observable<any> {
    return this.http.put(`${this.apiUrl}/pagos/${id}`, pago);
  }
  eliminarPago(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pagos/${id}`);
  }
}
