export type Company = {
  id: string;
  name: string;
  subdomain?: string;
  primaryColor?: string;
};

export type ProjectType = 'land_development' | 'building' | 'commercial';
export type ProjectStatus = 'planning' | 'pre_sale' | 'under_construction' | 'completed';

export type Project = {
  id: string;
  companyId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  location: {
    city: string;
    province: string;
    address?: string;
  };
  totalUnits: number;
  description?: string;
  masterplanImage?: string;
};

export type Visit = {
  id: string;
  leadId?: string;
  propertyId?: string;
  leadName?: string;
  propertyTitle?: string;
  phone?: string;
  email?: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
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
  description?: string;
  visits?: Visit[];
  
  // Enterprise / ERP fields
  projectId?: string;
  sectorName?: string;
  unitNumber?: string;
  status?: 'available' | 'reserved' | 'sold';
  services?: { electricity?: boolean; water?: boolean; gas?: boolean; sewage?: boolean; internet?: boolean };
  landFeatures?: { water?: boolean; electricity?: boolean; curb?: boolean; gravel?: boolean; sewage?: boolean; spaceType?: 'Abierto' | 'Semiabierto' | 'Cerrado' };
  isCovered?: boolean;
  commercialFeatures?: { showcaseLength?: number; hasBathroom?: boolean; mezzanine?: boolean; dualAccess?: boolean };
};

export type Lead = {
  id: string;
  companyId: string;
  name: string;
  origin: string;
  propertyIds: string[]; 
  projectId?: string;
  unitIds?: string[];
  stage: 'new' | 'contacted' | 'visiting' | 'negotiation' | 'closing';
  lastActivity: string;
  phone?: string;
  email?: string;
  visits?: Visit[];
};

export const companies: Company[] = [
  { id: 'c1', name: 'Bellomo Jujuy', subdomain: 'bellomo', primaryColor: '#2563eb' },
];

export const projects: Project[] = [
  {
    id: 'proj-san-jose',
    companyId: 'c1',
    name: 'Barrio San José',
    type: 'land_development',
    status: 'pre_sale',
    progress: 35,
    location: { city: 'Perico', province: 'Jujuy' },
    totalUnits: 40,
    description: 'Exclusivo loteo residencial con vistas a los cerros.',
    masterplanImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'proj-torre-bellomo',
    companyId: 'c1',
    name: 'Torre Bellomo',
    type: 'building',
    status: 'under_construction',
    progress: 65,
    location: { city: 'San Salvador de Jujuy', province: 'Jujuy', address: 'Belgrano 1234' },
    totalUnits: 45,
    description: 'Torre de lujo de 15 pisos en el centro de la ciudad.',
    masterplanImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'proj-shopping',
    companyId: 'c1',
    name: 'Shopping Gallery Centro',
    type: 'commercial',
    status: 'completed',
    progress: 100,
    location: { city: 'San Salvador de Jujuy', province: 'Jujuy', address: 'San Martín 500' },
    totalUnits: 30,
    description: 'Paseo comercial de primer nivel.',
    masterplanImage: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=600&auto=format&fit=crop'
  }
];

// Generar Propiedades
const sanJoseLotes: Property[] = [];
for (let i = 1; i <= 20; i++) {
  const statusRnd = Math.random();
  let status: 'available'|'reserved'|'sold' = 'available';
  if (statusRnd > 0.4) status = 'sold';
  else if (statusRnd > 0.3) status = 'reserved';

  sanJoseLotes.push({
    id: `lote-a-${i}`, companyId: 'c1', title: `Lote ${i} - Manzana A`, operation: 'sale', propertyType: 'Lote',
    price: 15000 + (i * 100), currency: 'USD', city: 'Perico', neighborhood: 'Barrio San José',
    bedrooms: 0, bathrooms: 0, area_m2: 300, projectId: 'proj-san-jose', sectorName: 'Manzana A', unitNumber: `Lote ${i}`, status,
    services: { electricity: true, water: true, gas: i % 2 === 0 }, visits: []
  });
}
for (let i = 1; i <= 20; i++) {
  const statusRnd = Math.random();
  let status: 'available'|'reserved'|'sold' = 'available';
  if (statusRnd > 0.6) status = 'sold';
  else if (statusRnd > 0.5) status = 'reserved';

  sanJoseLotes.push({
    id: `lote-b-${i}`, companyId: 'c1', title: `Lote ${i} - Manzana B`, operation: 'sale', propertyType: 'Lote',
    price: 14000 + (i * 100), currency: 'USD', city: 'Perico', neighborhood: 'Barrio San José',
    bedrooms: 0, bathrooms: 0, area_m2: 250, projectId: 'proj-san-jose', sectorName: 'Manzana B', unitNumber: `Lote ${i}`, status,
    services: { electricity: true, water: false, gas: false }, visits: []
  });
}

const torreUnidades: Property[] = [];
for (let f = 1; f <= 15; f++) {
  ['A', 'B', 'C'].forEach(depto => {
    const isStudio = depto === 'C';
    const statusRnd = Math.random();
    let status: 'available'|'reserved'|'sold' = 'available';
    if (statusRnd > 0.8) status = 'sold';
    else if (statusRnd > 0.7) status = 'reserved';

    torreUnidades.push({
      id: `torre-${f}${depto}`, companyId: 'c1', title: `Depto ${f}${depto} - Torre Bellomo`, operation: 'sale', propertyType: 'Departamento',
      price: isStudio ? 45000 : (depto === 'A' ? 85000 : 65000), currency: 'USD', city: 'San Salvador de Jujuy', neighborhood: 'Centro',
      bedrooms: isStudio ? 1 : (depto === 'A' ? 2 : 1), bathrooms: depto === 'A' ? 2 : 1, area_m2: isStudio ? 35 : (depto === 'A' ? 70 : 50),
      projectId: 'proj-torre-bellomo', sectorName: `Piso ${f}`, unitNumber: `${f}${depto}`, status, visits: []
    });
  });
}

const comerciales: Property[] = [];
for (let i = 1; i <= 10; i++) {
  const statusRnd = Math.random();
  comerciales.push({
    id: `local-${i}`, companyId: 'c1', title: `Local Comercial ${i}`, operation: 'rent', propertyType: 'Local',
    price: 350000 + (i * 10000), currency: 'ARS', city: 'San Salvador de Jujuy', neighborhood: 'Centro',
    bedrooms: 0, bathrooms: 1, area_m2: 45 + (i * 2), projectId: 'proj-shopping', sectorName: 'Planta Baja', unitNumber: `Local ${i}`,
    status: statusRnd > 0.5 ? 'sold' : (statusRnd > 0.3 ? 'reserved' : 'available'), visits: []
  });
}
for (let i = 1; i <= 20; i++) {
  const statusRnd = Math.random();
  comerciales.push({
    id: `cochera-${i}`, companyId: 'c1', title: `Cochera ${i}`, operation: 'rent', propertyType: 'Cochera',
    price: 30000, currency: 'ARS', city: 'San Salvador de Jujuy', neighborhood: 'Centro', bedrooms: 0, bathrooms: 0, area_m2: 12,
    projectId: 'proj-shopping', sectorName: 'Subsuelo 1', unitNumber: `C${i}`, status: statusRnd > 0.4 ? 'sold' : 'available', isCovered: true, visits: []
  });
}

const tradicional: Property[] = [
  { id: 't-casa-1', companyId: 'c1', title: 'Casa Minimalista en Los Perales', operation: 'sale', propertyType: 'Casa', price: 280000, currency: 'USD', city: 'SS de Jujuy', neighborhood: 'Los Perales', bedrooms: 4, bathrooms: 3, area_m2: 320, visits: [] },
  { id: 't-casa-2', companyId: 'c1', title: 'Chalet Clásico', operation: 'sale', propertyType: 'Casa', price: 150000, currency: 'USD', city: 'SS de Jujuy', neighborhood: 'Ciudad de Nieva', bedrooms: 3, bathrooms: 2, area_m2: 250, visits: [] },
  { id: 't-casa-3', companyId: 'c1', title: 'Casa con Pileta', operation: 'sale', propertyType: 'Casa', price: 195000, currency: 'USD', city: 'SS de Jujuy', neighborhood: 'Alto La Viña', bedrooms: 3, bathrooms: 3, area_m2: 290, visits: [] },
  { id: 't-casa-4', companyId: 'c1', title: 'Mansión Exclusiva', operation: 'sale', propertyType: 'Casa', price: 450000, currency: 'USD', city: 'SS de Jujuy', neighborhood: 'Los Perales', bedrooms: 5, bathrooms: 5, area_m2: 600, visits: [] },
  { id: 't-casa-5', companyId: 'c1', title: 'Casa a Reciclar', operation: 'sale', propertyType: 'Casa', price: 85000, currency: 'USD', city: 'SS de Jujuy', neighborhood: 'Centro', bedrooms: 2, bathrooms: 1, area_m2: 120, visits: [] },
  { id: 't-rent-1', companyId: 'c1', title: 'Depto 2 Ambientes', operation: 'rent', propertyType: 'Departamento', price: 250000, currency: 'ARS', city: 'SS de Jujuy', neighborhood: 'Centro', bedrooms: 1, bathrooms: 1, area_m2: 45, visits: [] },
];

export const properties: Property[] = [...sanJoseLotes, ...torreUnidades, ...comerciales, ...tradicional];

// Generar Leads (Total 30)
const leadNames = [
  "Facundo Moyano", "Martina González", "Valentina López", "Santiago Martínez", "Lucía Pérez",
  "Mateo Gómez", "Camila Sánchez", "Joaquín Díaz", "Sofía Fernández", "Tomás Torres",
  "Mía Ruiz", "Bautista Ramírez", "Isabella Flores", "Nicolás Acosta", "Catalina Benítez",
  "Juan Cruz Medina", "Victoria Herrera", "Agustín Castro", "Julieta Rojas", "Ignacio Silva",
  "Lautaro Giménez", "Renata Sosa", "Thiago Vargas", "Alma Romero", "Emiliano Quiroga",
  "Delfina Peralta", "Simón Domínguez", "Emma Luna", "Joaquín Navarro", "Zoe Campos"
];

const availableOrReservedProps = properties.filter(p => p.status === 'available' || p.status === 'reserved' || !p.status);
let unassignedProps = [...availableOrReservedProps];

export const leads: Lead[] = leadNames.map((name, index) => {
  const stages: Lead['stage'][] = ['new', 'contacted', 'visiting', 'negotiation', 'closing'];
  let stage = stages[index % 5];
  
  const leadId = `l${index + 1}`;
  let propertyIds: string[] = [];
  let projectId: string | undefined = undefined;
  
  // Asignar unidades a este lead asegurando que cubrimos el pool de unassignedProps
  if (unassignedProps.length > 0) {
    // Tomamos 1 o 2 propiedades no asignadas
    const toTake = Math.min(Math.floor(Math.random() * 2) + 1, unassignedProps.length);
    for (let i=0; i<toTake; i++) {
      const p = unassignedProps.pop()!;
      propertyIds.push(p.id);
      if (!projectId && p.projectId) projectId = p.projectId;
    }
  } else {
    // Si ya se asignaron todas, les damos alguna aleatoria para llenar
    const rndP = availableOrReservedProps[Math.floor(Math.random() * availableOrReservedProps.length)];
    propertyIds.push(rndP.id);
    if (rndP.projectId) projectId = rndP.projectId;
  }
  
  // Crear una visita para este lead si está en etapa 'visiting' o superior
  const visits: Visit[] = [];
  if (['visiting', 'negotiation', 'closing'].includes(stage)) {
    const v: Visit = {
      id: `v-${leadId}`,
      leadId,
      propertyId: propertyIds[0],
      leadName: name,
      propertyTitle: properties.find(p => p.id === propertyIds[0])?.title,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index % 5)).toISOString(),
      status: stage === 'visiting' ? 'scheduled' : 'completed'
    };
    visits.push(v);
    
    // Sincronizar visita en la propiedad
    const prop = properties.find(p => p.id === propertyIds[0]);
    if (prop) {
      if (!prop.visits) prop.visits = [];
      prop.visits.push(v);
    }
  }

  return {
    id: leadId,
    companyId: 'c1',
    name,
    origin: index % 2 === 0 ? 'WhatsApp' : 'Web',
    propertyIds,
    projectId,
    stage,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * (index + 1)).toISOString(),
    phone: `+54 9 388 4${Math.floor(100000 + Math.random() * 900000)}`,
    email: `${name.split(' ')[0].toLowerCase()}@example.com`,
    visits
  };
});

// Fallback: Si quedaron propiedades disponibles/reservadas sin asignar por la matemática, asignarlas al primer lead
if (unassignedProps.length > 0) {
  unassignedProps.forEach(p => {
    leads[0].propertyIds.push(p.id);
  });
}

const adminSample = { companies, projects, properties, leads };
export default adminSample; 
