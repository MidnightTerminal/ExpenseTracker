import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B', isCustom: false },
  { id: '2', name: 'Transport', icon: 'car', color: '#4ECDC4', isCustom: false },
  { id: '3', name: 'Shopping', icon: 'cart', color: '#45B7D1', isCustom: false },
  { id: '4', name: 'Entertainment', icon: 'game-controller', color: '#96CEB4', isCustom: false },
  { id: '5', name: 'Utilities', icon: 'flash', color: '#FFEAA7', isCustom: false },
  { id: '6', name: 'Health', icon: 'medical', color: '#DDA0DD', isCustom: false },
  { id: '7', name: 'Education', icon: 'school', color: '#98D8C8', isCustom: false },
  { id: '8', name: 'Rent', icon: 'home', color: '#F7DC6F', isCustom: false },
  { id: '9', name: 'Insurance', icon: 'shield-checkmark', color: '#85C1E9', isCustom: false },
  { id: '10', name: 'Gifts', icon: 'gift', color: '#F1948A', isCustom: false },
  { id: '11', name: 'Savings', icon: 'wallet', color: '#82E0AA', isCustom: false },
  { id: '12', name: 'Other', icon: 'ellipsis-horizontal', color: '#AEB6BF', isCustom: false },
];

export const ICON_OPTIONS = [
  'restaurant', 'car', 'cart', 'game-controller', 'flash', 'medical',
  'school', 'home', 'shield-checkmark', 'gift', 'wallet', 'ellipsis-horizontal',
  'airplane', 'basketball', 'beer', 'bicycle', 'book', 'briefcase',
  'brush', 'bus', 'cafe', 'camera', 'card', 'cash',
  'chatbubble', 'construct', 'desktop', 'document', 'fitness', 'flower',
  'glasses', 'globe', 'hammer', 'headset', 'heart', 'key',
  'laptop', 'leaf', 'library', 'musical-notes', 'newspaper', 'nutrition',
  'paw', 'people', 'phone-portrait', 'pizza', 'print', 'receipt',
  'rocket', 'shirt', 'sparkles', 'star', 'storefront', 'sunny',
  'tennisball', 'train', 'trophy', 'tv', 'umbrella', 'water',
];

export const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#85C1E9', '#F1948A', '#82E0AA', '#AEB6BF',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#01CBC6', '#F8B739', '#FC427B',
  '#6D214F', '#182C61', '#3B3B98', '#FD7272', '#9AECDB', '#D6A2E8',
];

export const CURRENCY_OPTIONS = [
  { label: 'BDT (৳)', value: 'BDT', symbol: '৳' },
  { label: 'USD ($)', value: 'USD', symbol: '$' },
  { label: 'EUR (€)', value: 'EUR', symbol: '€' },
  { label: 'GBP (£)', value: 'GBP', symbol: '£' },
  { label: 'INR (₹)', value: 'INR', symbol: '₹' },
  { label: 'JPY (¥)', value: 'JPY', symbol: '¥' },
  { label: 'CAD (C$)', value: 'CAD', symbol: 'C$' },
  { label: 'AUD (A$)', value: 'AUD', symbol: 'A$' },
  { label: 'NGN (₦)', value: 'NGN', symbol: '₦' },
  { label: 'KES (KSh)', value: 'KES', symbol: 'KSh' },
  { label: 'ZAR (R)', value: 'ZAR', symbol: 'R' },
];