import { z } from 'zod';

export const createOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  items: z.array(
    z.object({
      foodId: z.string().min(1, 'Food ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
  orderType: z.enum(['PICKUP', 'DELIVERY']).optional().default('PICKUP'),
  specialInstructions: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
  ]),
  rejectionReason: z.string().optional(),
  note: z.string().optional(),
});
