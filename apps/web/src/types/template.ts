export interface CustomerTemplate {
  id: string;
  customerId: string;
  templateLines: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OrderDescriptionData {
  id: string;
  orderId: string;
  descriptionData: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerTemplateData {
  templateLines: string[];
}

export interface UpdateCustomerTemplateData {
  templateLines: string[];
}

export interface CreateOrderDescriptionData {
  descriptionData: Record<string, string>;
}

export interface UpdateOrderDescriptionData {
  descriptionData: Record<string, string>;
}