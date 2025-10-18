// src/controllers/customerController.ts
import { Request, Response } from "express";
import * as customerService from "../services/customerService";

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Error creating customer", error });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: "Error updating customer", error });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteCustomer(id);

    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};

/* Subaccounts */
// Create
export const createSubAccount = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const subAccount = await customerService.createSubAccount(customerId, req.body);
    res.status(201).json(subAccount);
  } catch (error) {
    res.status(400).json({ message: "Error creating subaccount", error });
  }
};

// Get all for a customer
export const getSubAccounts = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const subAccounts = await customerService.getSubAccounts(customerId);
    res.json(subAccounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subaccounts", error });
  }
};

// Update
export const updateSubAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subAccount = await customerService.updateSubAccount(id, req.body);

    if (!subAccount) {
      return res.status(404).json({ message: "Subaccount not found" });
    }

    res.json(subAccount);
  } catch (error) {
    res.status(400).json({ message: "Error updating subaccount", error });
  }
};

// Delete
export const deleteSubAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteSubAccount(id);

    if (!deleted) {
      return res.status(404).json({ message: "Subaccount not found" });
    }

    res.json({ message: "Subaccount deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subaccount", error });
  }
};