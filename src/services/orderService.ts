import { api } from "./api";
import type { CreateOrderDTO, Order, UpdateOrderDTO } from "../types/order";

export async function getOrders(): Promise<Order[]> {
  const response = await api.get("/order");
  return response.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get(`/order/${id}`);
  return response.data;
}

export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const response = await api.post("/order", data);
  return response.data;
}

export async function updateOrder(id: number, data: UpdateOrderDTO): Promise<Order> {
  const response = await api.put(`/order/${id}`, data);
  return response.data;
}

export async function deleteOrder(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/order/${id}`);
  return response.data;
}