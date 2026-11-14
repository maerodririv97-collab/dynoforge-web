/**
 * Contenido editable del sitio público. Todo lo que cambia con frecuencia (teléfono,
 * textos, fotos, fichas) vive aquí para no tocar los componentes.
 *
 * Fotos:  dejar el archivo en public/img/galeria/ (o la carpeta que quieras dentro de
 *         public/) y agregar una entrada en GALLERY con la ruta que empieza en /img/...
 * Fichas: dejar el PDF en public/fichas/ y poner su ruta en `file` (ej. '/fichas/moto.pdf').
 *         Mientras `file` sea null, el botón ofrece pedir la ficha por WhatsApp.
 */

export const COMPANY = {
  name: 'DynoForge',
  tagline: 'Performance Test System',
  // TODO: reemplazar por los datos reales.
  whatsapp: '573000000000', // solo dígitos, con indicativo de país (57 = Colombia)
  whatsappDisplay: '+57 300 000 0000',
  email: 'contacto@dynoforge.co',
  city: 'Colombia',
  hours: 'Lunes a viernes, 8:00 a. m. – 6:00 p. m.',
  instagram: '', // URL completa, vacío para ocultar
  facebook: '',
};

export const WHATSAPP_DEFAULT_MESSAGE = 'Hola DynoForge, quiero información sobre sus dinamómetros.';

export interface EquipmentLine {
  slug: string;
  name: string;
  short: string;
  description: string;
  image: string;
  highlights: string[];
}

export const EQUIPMENT: EquipmentLine[] = [
  {
    slug: 'moto',
    name: 'Banco para motos',
    short: 'Pruebas de potencia y torque en motocicletas de todo cilindraje.',
    description:
      'Dinamómetro de rodillo para motocicletas, pensado para talleres de preparación, concesionarios y centros de diagnóstico. Mide potencia en rueda, torque y RPM en tiempo real y guarda cada corrida para comparar antes y después de cada ajuste.',
    image: '/img/equipos/moto.webp',
    highlights: [
      'Lectura de RPM de rodillo y de motor sincronizadas',
      'Celda de carga calibrable desde el software',
      'Comparación de corridas antes / después',
      'Reportes listos para entregar al cliente',
    ],
  },
  {
    slug: 'carro',
    name: 'Banco para carros',
    short: 'Medición de potencia en rueda para automóviles y camionetas.',
    description:
      'Dinamómetro de rodillo para vehículos livianos. Ideal para reprogramación, puesta a punto y verificación de modificaciones, con corrección atmosférica para que los resultados sean comparables sin importar el clima del día.',
    image: '/img/equipos/carro.webp',
    highlights: [
      'Corrección atmosférica SAE J1349, DIN 70020 e ISO 1585',
      'Sensores de temperatura, EGT y AFR integrados al tablero',
      'Varios dinamómetros administrados desde una sola instalación',
      'Exportación automática de corridas como respaldo',
    ],
  },
  {
    slug: 'karts',
    name: 'Banco para karts',
    short: 'Puesta a punto de motores de competencia en karting.',
    description:
      'Dinamómetro compacto para karts y motores de competencia de baja cilindrada. Permite afinar carburación, encendido y escape con datos reales en vez de sensaciones en pista.',
    image: '/img/equipos/karts.webp',
    highlights: [
      'Alta frecuencia de adquisición para motores de altas RPM',
      'Curvas de potencia y torque en vivo',
      'Historial de pruebas por vehículo y por piloto',
      'Formato compacto para talleres y equipos de carreras',
    ],
  },
];

export const SOFTWARE_FEATURES = [
  { title: 'Datos en tiempo real', text: 'RPM, potencia, torque, temperaturas y sensores auxiliares en un tablero configurable.' },
  { title: 'Corrección atmosférica', text: 'Normaliza los resultados según SAE J1349, DIN 70020 o ISO 1585.' },
  { title: 'Comparación de corridas', text: 'Superpone varias corridas para ver el efecto real de cada modificación.' },
  { title: 'Multiusuario', text: 'Roles de administrador y técnico, con acceso controlado por taller y por equipo.' },
];

export type GalleryCategory = 'Equipos' | 'Software' | 'Marca';

export interface GalleryItem {
  src: string;
  title: string;
  category: GalleryCategory;
}

// TODO: agregar aquí las fotos reales de los equipos instalados.
export const GALLERY: GalleryItem[] = [
  { src: '/img/equipos/moto.webp', title: 'Línea de motos', category: 'Equipos' },
  { src: '/img/equipos/carro.webp', title: 'Línea de carros', category: 'Equipos' },
  { src: '/img/equipos/karts.webp', title: 'Línea de karts', category: 'Equipos' },
  { src: '/img/software/prueba-en-vivo.webp', title: 'Prueba en vivo', category: 'Software' },
  { src: '/img/software/comparacion.webp', title: 'Comparación de corridas', category: 'Software' },
  { src: '/img/software/configuracion.webp', title: 'Configuración de la prueba', category: 'Software' },
  { src: '/img/software/inicio-corrida.webp', title: 'Tablero listo para iniciar', category: 'Software' },
  { src: '/img/software/sincronizacion.webp', title: 'Calibración de RPM', category: 'Software' },
  { src: '/img/software/login.webp', title: 'Inicio de sesión', category: 'Software' },
  { src: '/img/software/reporte-1.webp', title: 'Informe de resultados', category: 'Software' },
  { src: '/img/software/reporte-2.webp', title: 'Informe: AFR y temperatura de escape', category: 'Software' },
  { src: '/img/software/reporte-3.webp', title: 'Informe: condiciones y comparación', category: 'Software' },
  { src: '/img/equipos/portada.webp', title: 'DynoForge', category: 'Marca' },
];

export interface Datasheet {
  title: string;
  description: string;
  /** Ruta dentro de public/, ej. '/fichas/dynoforge-moto.pdf'. null = aún no publicada. */
  file: string | null;
  size?: string;
}

export const DATASHEETS: Datasheet[] = [
  { title: 'Ficha técnica · Banco para motos', description: 'Dimensiones, capacidades y requisitos de instalación.', file: null },
  { title: 'Ficha técnica · Banco para carros', description: 'Dimensiones, capacidades y requisitos de instalación.', file: null },
  { title: 'Ficha técnica · Banco para karts', description: 'Dimensiones, capacidades y requisitos de instalación.', file: null },
  { title: 'Software DynoForge', description: 'Funciones, sensores compatibles y requisitos del PC.', file: null },
];
