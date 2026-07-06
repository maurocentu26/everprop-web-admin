export type Company = {
  id: string;
  name: string;
  subdomain?: string;
  primaryColor?: string;
};

export type Property = {
  id: string;
  companyId: string;
  title: string;
  operation: 'sale' | 'rent' | 'temporal';
  propertyType: string;
  price: number;
  currency: 'USD' | 'ARS';
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_m2?: number;
  mainImage?: string;
};

export type Lead = {
  id: string;
  companyId: string;
  name: string;
  origin: string;
  propertyId?: string;
  stage: 'new' | 'contacted' | 'visiting' | 'negotiation' | 'closing';
  lastActivity: string; // ISO date
  phone?: string;
  email?: string;
};

export const companies: Company[] = [
  { id: 'c1', name: 'Inmobiliaria A', subdomain: 'inmo-a', primaryColor: '#2563eb' },
];

export const properties: Property[] = [
  {
    id: 'p1',
    companyId: 'c1',
    title: 'Departamento 3 Ambientes con Cochera',
    operation: 'sale',
    propertyType: 'Departamento',
    price: 245000,
    currency: 'USD',
    city: 'Ciudad Autónoma de Buenos Aires',
    neighborhood: 'Palermo',
    bedrooms: 2,
    bathrooms: 2,
    area_m2: 85,
    mainImage: '',
  },
  {
    id: 'p2',
    companyId: 'c1',
    title: 'PH luminoso en Belgrano',
    operation: 'rent',
    propertyType: 'PH',
    price: 1800,
    currency: 'ARS',
    city: 'Buenos Aires',
    neighborhood: 'Belgrano',
    bedrooms: 3,
    bathrooms: 2,
    area_m2: 120,
  },
];

export const leads: Lead[] = [
  {
    id: 'l1',
    companyId: 'c1',
    name: 'Carla Méndez',
    origin: 'Web',
    propertyId: 'p1',
    stage: 'new',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    phone: '+54 9 11 1234 5678',
    email: 'carla.mendez@example.com',
  },
  {
    id: 'l2',
    companyId: 'c1',
    name: 'Diego Ramírez',
    origin: 'WhatsApp',
    propertyId: 'p2',
    stage: 'contacted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    phone: '+54 9 11 8765 4321',
    email: 'diego.ramirez@example.com',
  },
  {
    id: 'l3',
    companyId: 'c1',
    name: 'Mauro Centurión',
    origin: 'WhatsApp',
    propertyId: 'p2',
    stage: 'contacted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    phone: '+54 9 11 5555 6666',
    email: 'mauro.centurion@example.com',
  },
];

export default { companies, properties, leads };
