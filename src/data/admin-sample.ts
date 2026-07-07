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
  {
    id: 'p3',
    companyId: 'c1',
    title: 'Casa moderna con pileta en Nordelta',
    operation: 'sale',
    propertyType: 'Casa',
    price: 720000,
    currency: 'USD',
    city: 'Tigre',
    neighborhood: 'Nordelta',
    bedrooms: 4,
    bathrooms: 4,
    area_m2: 310,
  },
  {
    id: 'p4',
    companyId: 'c1',
    title: 'Monoambiente reciclado en Recoleta',
    operation: 'sale',
    propertyType: 'Departamento',
    price: 185000,
    currency: 'USD',
    city: 'Buenos Aires',
    neighborhood: 'Recoleta',
    bedrooms: 1,
    bathrooms: 1,
    area_m2: 42,
  },
  {
    id: 'p5',
    companyId: 'c1',
    title: 'Oficina corporativa en Microcentro',
    operation: 'rent',
    propertyType: 'Oficina',
    price: 3200,
    currency: 'USD',
    city: 'Buenos Aires',
    neighborhood: 'Microcentro',
    bedrooms: 0,
    bathrooms: 2,
    area_m2: 145,
  },
  {
    id: 'p6',
    companyId: 'c1',
    title: 'Casa con jardín en Pilar',
    operation: 'sale',
    propertyType: 'Casa',
    price: 980000,
    currency: 'USD',
    city: 'Pilar',
    neighborhood: 'La Delfina',
    bedrooms: 5,
    bathrooms: 4,
    area_m2: 360,
  },
  {
    id: 'p7',
    companyId: 'c1',
    title: 'Departamento a estrenar en Caballito',
    operation: 'sale',
    propertyType: 'Departamento',
    price: 198000,
    currency: 'USD',
    city: 'Buenos Aires',
    neighborhood: 'Caballito',
    bedrooms: 2,
    bathrooms: 2,
    area_m2: 78,
  },
  {
    id: 'p8',
    companyId: 'c1',
    title: 'Townhouse en Vicente López',
    operation: 'sale',
    propertyType: 'Townhouse',
    price: 410000,
    currency: 'USD',
    city: 'Vicente López',
    neighborhood: 'Olivos',
    bedrooms: 3,
    bathrooms: 3,
    area_m2: 165,
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
  {
    id: 'l4',
    companyId: 'c1',
    name: 'Julia Díaz',
    origin: 'Web',
    propertyId: 'p3',
    stage: 'visiting',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    phone: '+54 9 11 2345 6789',
    email: 'julia.diaz@example.com',
  },
  {
    id: 'l5',
    companyId: 'c1',
    name: 'Martín Ruiz',
    origin: 'Referido',
    propertyId: 'p5',
    stage: 'negotiation',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    phone: '+54 9 11 3456 7890',
    email: 'martin.ruiz@example.com',
  },
  {
    id: 'l6',
    companyId: 'c1',
    name: 'Sol López',
    origin: 'Portal',
    propertyId: 'p6',
    stage: 'closing',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    phone: '+54 9 11 4567 8901',
    email: 'sol.lopez@example.com',
  },
  {
    id: 'l7',
    companyId: 'c1',
    name: 'Agustina Ferreyra',
    origin: 'Instagram',
    propertyId: 'p4',
    stage: 'new',
    lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    phone: '+54 9 11 5678 9012',
    email: 'agustina.ferreyra@example.com',
  },
  {
    id: 'l8',
    companyId: 'c1',
    name: 'Federico Silva',
    origin: 'Web',
    propertyId: 'p7',
    stage: 'contacted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    phone: '+54 9 11 6789 0123',
    email: 'federico.silva@example.com',
  },
  {
    id: 'l9',
    companyId: 'c1',
    name: 'Camila Torres',
    origin: 'WhatsApp',
    propertyId: 'p8',
    stage: 'visiting',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    phone: '+54 9 11 7890 1234',
    email: 'camila.torres@example.com',
  },
  {
    id: 'l10',
    companyId: 'c1',
    name: 'Nicolás Ponce',
    origin: 'Referido',
    propertyId: 'p1',
    stage: 'negotiation',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    phone: '+54 9 11 8901 2345',
    email: 'nicolas.ponce@example.com',
  },
  {
    id: 'l11',
    companyId: 'c1',
    name: 'Paula Benítez',
    origin: 'Portal',
    propertyId: 'p2',
    stage: 'closing',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    phone: '+54 9 11 9012 3456',
    email: 'paula.benitez@example.com',
  },
  {
    id: 'l12',
    companyId: 'c1',
    name: 'Tomás Herrera',
    origin: 'Web',
    propertyId: 'p3',
    stage: 'new',
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    phone: '+54 9 11 0123 4567',
    email: 'tomas.herrera@example.com',
  },
];

export default { companies, properties, leads };
