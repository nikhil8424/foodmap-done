import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(2, 'Food item name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  isVeg: z.boolean().optional().default(true),
  category: z.string().optional().default('Main Course'),
  timeReady: z.string().optional().default('Ready Now'),
  image: z.string().optional(),
  spiciness: z.enum(['Mild', 'Medium', 'Spicy']).optional().default('Medium'),
});

export const updateFoodSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  available: z.boolean().optional(),
  status: z.enum(['AVAILABLE', 'LOW_STOCK', 'SOLD_OUT']).optional(),
  image: z.string().optional(),
  timeReady: z.string().optional(),
});
