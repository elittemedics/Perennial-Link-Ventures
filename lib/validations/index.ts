import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(8, 'Phone number is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(128),
  // Public registration can never create privileged accounts.
  role: z.enum(['VISITOR', 'BUSINESS_OWNER']).default('VISITOR'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  otp: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(128),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

export const ChangeEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Current password is required for confirmation.'),
});

export const BusinessListingSchema = z.object({
  name: z.string().min(2, 'Business name is required.'),
  tagline: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  categoryId: z.string().min(1, 'Category selection is required.'),
  subcategoryId: z.string().optional().nullable(),
  phone: z.string().optional().nullable().or(z.literal('')),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable().or(z.literal('')),
  website: z.string().optional().nullable().or(z.literal('')),
  address: z.string().min(3, 'Address is required.'),
  cityName: z.string().min(2, 'City name is required.'),
  stateName: z.string().optional().nullable(),
  countryName: z.string().default('Ghana'),
  zipCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  socialLinks: z.object({
    facebook: z.string().optional().nullable().or(z.literal('')),
    instagram: z.string().optional().nullable().or(z.literal('')),
    linkedin: z.string().optional().nullable().or(z.literal('')),
  }).optional(),
});

export const ReviewSchema = z.object({
  businessId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  comment: z.string().min(10, 'Review comment must be at least 10 characters.'),
});

export const ReviewReplySchema = z.object({
  reviewId: z.string().min(1),
  comment: z.string().min(2, 'Reply message is required.'),
});

export const InquirySchema = z.object({
  businessId: z.string().min(1),
  senderName: z.string().min(2, 'Your name is required.'),
  senderEmail: z.string().email('Valid email is required.'),
  senderPhone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export const CategorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
  icon: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export const AdvertisementSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  bannerUrl: z.string().min(1, 'Banner image URL is required.'),
  targetUrl: z.string().url('Target link must be a valid URL.'),
  placement: z.enum(['HOMEPAGE_HERO', 'SIDEBAR', 'CATEGORY_TOP', 'LISTING_FOOTER']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const SupportTicketSchema = z.object({
  subject: z.string().min(3, 'Subject is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().default('General'),
});

export const ProductSchema = z.object({
  businessId: z.string().min(1),
  title: z.string().min(2, 'Product title is required.'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative.'),
  originalPrice: z.number().optional().nullable(),
  currency: z.string().default('USD'),
  image: z.string().optional().nullable(),
  whatsappPhone: z.string().optional().nullable(),
  productCategory: z.string().default('Other categories'),
});

export const ServiceSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().min(2, 'Service name is required.'),
  description: z.string().optional(),
  price: z.number().optional().nullable(),
  currency: z.string().default('USD'),
  icon: z.string().optional().nullable(),
});
