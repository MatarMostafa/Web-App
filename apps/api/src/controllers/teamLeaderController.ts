import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as teamLeaderService from "../services/teamLeaderService";
import * as teamService from "../services/teamService";
import * as orderService from "../services/orderService";

export const getDashboard = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    // Get employee ID from user
    const employee = await teamService.getEmployeeByUserId(authReq.user!.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const dashboard = await teamLeaderService.getTeamLeaderDashboard(employee.id);
    res.json(dashboard);
  } catch (error) {
    console.error("Error fetching team leader dashboard:", error);
    res.status(500).json({ message: "Error fetching dashboard", error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    // Get employee ID from user
    const employee = await teamService.getEmployeeByUserId(authReq.user!.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const orders = await teamLeaderService.getTeamLeaderOrders(employee.id, req.query);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching team leader orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    // Team leaders can create orders but without pricing fields
    const { hourlyRate, totalCost, profit, ...orderData } = req.body;
    
    const order = await orderService.createOrderService(orderData, authReq.user?.id);
    res.status(201).json(order);
  } catch (error) {
    console.error("Team leader create order error:", error);
    res.status(400).json({ 
      message: "Error creating order", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    
    // Get employee ID to verify team leadership
    const employee = await teamService.getEmployeeByUserId(authReq.user!.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify the order belongs to a team led by this user
    const order = await orderService.getOrderByIdService(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is assigned to a team led by this employee
    if (order.teamId) {
      const team = await teamService.getTeamById(order.teamId);
      if (!team || team.teamLeaderId !== employee.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      // Check if any team members are assigned to this order
      const team = await teamService.getTeamByLeader(employee.id);
      if (!team) {
        return res.status(403).json({ message: "Access denied - no team" });
      }
      
      const teamMemberIds = team.members?.map(member => member.employeeId) || [];
      
      const hasTeamMemberAssigned = order.employeeAssignments?.some(assignment => 
        teamMemberIds.includes(assignment.employeeId)
      );
      
      if (!hasTeamMemberAssigned) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Remove pricing fields from update data
    const { hourlyRate, totalCost, profit, ...updateData } = req.body;
    
    const updatedOrder = await orderService.updateOrderService(id, updateData, authReq.user?.id);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Team leader update order error:", error);
    res.status(400).json({ 
      message: "Error updating order", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== 'TEAM_LEADER') {
      return res.status(403).json({ message: "Access denied" });
    }

    const employee = await teamService.getEmployeeByUserId(authReq.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const teamMembers = await teamLeaderService.getTeamMembersByLeader(employee.id);
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};