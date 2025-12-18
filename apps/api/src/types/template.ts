export interface CreateCustomerTemplateData {
  customerId: string;
  templateLines: string[];
  createdBy?: string;
}

export interface UpdateCustomerTemplateData {
  templateLines: string[];
}

export interface CreateOrderDescriptionData {
  orderId: string;
  descriptionData: Record<string, string>;
}

export interface UpdateOrderDescriptionData {
  descriptionData: Record<string, string>;
}

export interface CustomerTemplateResponse {
  id: string;
  customerId: string;
  templateLines: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OrderDescriptionResponse {
  id: string;
  orderId: string;
  descriptionData: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}