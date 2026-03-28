import { z } from "zod";

// --- Customer Validations ---
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shopName: z.string().optional().nullable(),
  phone: z.string().min(11, "Phone must be at least 11 digits"),
  shopAddress: z.string().optional().nullable(),
  permanentAddress: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
});

export const customerPaymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().min(0),
  discount: z.number().min(0),
  method: z.string(),
  description: z.string().optional(),
});

export const supplierPaymentSchema = z.object({
  supplierId: z.string(),
  amount: z.number().min(0),
  discount: z.number().min(0),
  method: z.string(),
  description: z.string().optional(),
});

// --- Supplier Validations ---
export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional(),
  address: z.string().optional(),
});

// --- Inventory Validations ---
export const productSchema = z.object({
  code: z.string().min(1, "Product code is required"),
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  stock: z.number().int().min(0),
});

// --- Sales Validations ---
export const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
});

export const saleSchema = z.object({
  customerId: z.string(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  subTotal: z.number().min(0),
  discount: z.number().min(0),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  dueAdded: z.number().min(0),
  method: z.string().optional(),
  courierName: z.string().optional(),
  courierBilty: z.string().optional(),
});

// --- Purchase Validations ---
export const purchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
});

export const purchaseSchema = z.object({
  supplierId: z.string(),
  invoiceNo: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0),
  discount: z.number().min(0),
  paidAmount: z.number().min(0),
  dueAdded: z.number().min(0),
  method: z.string().optional(),
});

// --- Expense Validations ---
export const expenseSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});
