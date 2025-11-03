// src/controllers/customerController.ts
import { Request, Response } from "express";
import * as customerService from "../services/customerService";

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Kunden", error });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ message: "Kunde nicht gefunden" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen des Kunden", error });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Erstellen des Kunden", error });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);

    if (!customer) {
      return res.status(404).json({ message: "Kunde nicht gefunden" });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Aktualisieren des Kunden", error });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteCustomer(id);

    if (!deleted) {
      return res.status(404).json({ message: "Kunde nicht gefunden" });
    }

    res.json({ message: "Kunde erfolgreich gelöscht" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Kunden", error });
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
    res.status(400).json({ message: "Fehler beim Erstellen des Unterkontos", error });
  }
};

// Get all for a customer
export const getSubAccounts = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const subAccounts = await customerService.getSubAccounts(customerId);
    res.json(subAccounts);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Unterkonten", error });
  }
};

// Update
export const updateSubAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subAccount = await customerService.updateSubAccount(id, req.body);

    if (!subAccount) {
      return res.status(404).json({ message: "Unterkonto nicht gefunden" });
    }

    res.json(subAccount);
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Aktualisieren des Unterkontos", error });
  }
};

// Delete
export const deleteSubAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteSubAccount(id);

    if (!deleted) {
      return res.status(404).json({ message: "Unterkonto nicht gefunden" });
    }

    res.json({ message: "Unterkonto erfolgreich gelöscht" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Unterkontos", error });
  }
};