import { api } from "./api";
import type { CreateOrderDTO, Order, UpdateOrderDTO } from "../types/order";

export async function getOrders(): Promise<Order[]> {
  const response = await api.get("/atendimento/all");
  return response.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get(`/atendimento/${id}`);
  return response.data;
}

export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const response = await api.post("/atendimento", data);
  return response.data;
}

export async function updateOrder(id: number, data: UpdateOrderDTO): Promise<Order> {
  const response = await api.put(`/atendimento/${id}`, data);
  return response.data;
}

export async function deleteOrder(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/atendimento/${id}`);
  return response.data;
}