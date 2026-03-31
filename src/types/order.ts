export interface Order {
  id: number;
  petId: number;
  quantity?: number;
  shipDate?: string;
  status?: string;
  complete?: boolean;
  owner_id: number;
}

export interface CreateOrderDTO {
  petId: number;
  quantity?: number;
  shipDate?: string;
  status?: string;
  complete?: boolean;
  owner_id: number;
}

export interface UpdateOrderDTO {
  petId?: number;
  quantity?: number;
  shipDate?: string;
  status?: string;
  complete?: boolean;
  owner_id?: number;
}