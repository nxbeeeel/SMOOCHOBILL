import axios from 'axios';
import { Product, Category } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth interceptor
const menuApi = axios.create({
  baseURL: `${API_BASE_URL}/products`,
});

// Add auth token to requests
menuApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Default menu images mapping
export const defaultMenuImages: Record<string, string> = {
  // Signatures
  'prod-001': '/images/products/choco-tsunami.jpg',
  'prod-002': '/images/products/mango-tsunami.jpg',
  'prod-003': '/images/products/hazelnut-mango-cyclone.jpg',
  'prod-004': '/images/products/pista-mango-thunderstorm.jpg',
  'prod-005': '/images/products/biscoff-mango-hurricane.jpg',
  'prod-006': '/images/products/pista-hazelnut-earthquake.jpg',
  'prod-007': '/images/products/pista-biscoff-tsunami.jpg',
  'prod-008': '/images/products/coffee-mango-cyclone.jpg',
  'prod-009': '/images/products/pista-coffee-earthquake.jpg',
  
  // Choco Desserts
  'prod-010': '/images/products/choco-spunge.jpg',
  'prod-011': '/images/products/choco-spunge-premium.jpg',
  'prod-012': '/images/products/choco-brownie.jpg',
  'prod-013': '/images/products/choco-brownie-premium.jpg',
  'prod-014': '/images/products/coffee-spunge.jpg',
  'prod-015': '/images/products/coffee-spunge-premium.jpg',
  'prod-016': '/images/products/coffee-brownie.jpg',
  'prod-017': '/images/products/coffee-brownie-premium.jpg',
  
  // Crispy Rice Tubs
  'prod-018': '/images/products/hazelnut-white-crispy-rice.jpg',
  'prod-019': '/images/products/hazelnut-biscoff-crispy-rice.jpg',
  'prod-020': '/images/products/mango-hazelnut-crispy-rice.jpg',
  'prod-021': '/images/products/pista-hazelnut-crispy-rice.jpg',
  'prod-022': '/images/products/mango-pista-crispy-rice.jpg',
  'prod-023': '/images/products/biscoff-white-crispy-rice.jpg',
  'prod-024': '/images/products/pista-biscoff-crispy-rice.jpg',
  'prod-025': '/images/products/mango-biscoff-crispy-rice.jpg',
  'prod-026': '/images/products/coffee-hazelnut-crispy-rice.jpg',
  'prod-027': '/images/products/mango-coffee-crispy-rice.jpg',
  'prod-028': '/images/products/biscoff-coffee-crispy-rice.jpg',
  'prod-029': '/images/products/coffee-pista-crispy-rice.jpg',
  
  // Kunafa Bowls
  'prod-030': '/images/products/hazelnut-kunafa.jpg',
  'prod-031': '/images/products/white-chocolate-kunafa.jpg',
  'prod-032': '/images/products/pista-kunafa.jpg',
  'prod-033': '/images/products/biscoff-kunafa.jpg',
  'prod-034': '/images/products/hazelnut-white-kunafa.jpg',
  'prod-035': '/images/products/biscoff-hazelnut-kunafa.jpg',
  'prod-036': '/images/products/pista-white-kunafa.jpg',
  'prod-037': '/images/products/hazelnut-pista-kunafa.jpg',
  'prod-038': '/images/products/biscoff-white-kunafa.jpg',
  'prod-039': '/images/products/pista-biscoff-kunafa.jpg',
  'prod-040': '/images/products/coffee-hazelnut-kunafa.jpg',
  'prod-041': '/images/products/pista-coffee-kunafa.jpg',
  
  // Fruits Choco Mix
  'prod-042': '/images/products/choco-strawberry.jpg',
  'prod-043': '/images/products/choco-kiwi.jpg',
  'prod-044': '/images/products/choco-mixed-fruits.jpg',
  'prod-045': '/images/products/choco-mixed-fruits-premium.jpg',
  'prod-046': '/images/products/choco-mango.jpg',
  'prod-047': '/images/products/choco-mango-premium.jpg',
  'prod-048': '/images/products/choco-robusto.jpg',
  'prod-049': '/images/products/choco-robusto-premium.jpg',
  
  // Choco Icecreams
  'prod-050': '/images/products/choco-vanilla-scoop.jpg',
  'prod-051': '/images/products/choco-chocolate-scoop.jpg',
  'prod-052': '/images/products/choco-strawberry-scoop.jpg',
  'prod-053': '/images/products/choco-mango-scoop.jpg',
  
  // Drinks
  'prod-054': '/images/products/milo-dinauser.jpg',
  'prod-055': '/images/products/malaysian-mango-milk.jpg',
  'prod-056': '/images/products/korean-strawberry-milk.jpg',
  'prod-057': '/images/products/vietnamese-iced-coffee.jpg',
  'prod-058': '/images/products/premium-iced-coffee.jpg',
};

export const menuService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await menuApi.get('/');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await menuApi.get(`/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, categoryId?: string): Promise<Product[]> => {
    const params: any = { q: query };
    if (categoryId) {
      params.category_id = categoryId;
    }
    const response = await menuApi.get('/search', { params });
    return response.data;
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await menuApi.get('/categories');
    return response.data;
  },

  // Upload product image
  uploadProductImage: async (productId: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await menuApi.post(`/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product availability
  updateProductAvailability: async (productId: string, available: boolean): Promise<{ message: string }> => {
    const response = await menuApi.patch(`/${productId}/availability`, { available });
    return response.data;
  },

  // Helper function to get product image
  getProductImage: (productId: string): string => {
    return defaultMenuImages[productId] || '/images/default-product.svg';
  },

  // Helper function to get category image
  getCategoryImage: (categoryId: string): string => {
    return `/images/categories/${categoryId}.jpg` || '/images/default-category.svg';
  },
};
