export const sucursales = ['Centro', 'Aeropuerto', 'Terminal Norte', 'Puerto']

export const tiposVehiculo = ['Compacto', 'Sedan', 'SUV', 'Utilitario', 'Premium']

export const vehiculos = [
  {
    id: '1',
    marca: 'Toyota',
    modelo: 'Corolla',
    tipo: 'Sedan',
    sucursal: 'Centro',
    estado: 'Disponible',
    precioDiario: 42000,
    confort: ['Aire acondicionado', 'Caja automatica', 'Bluetooth', 'Control crucero'],
    imagenes: [
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'Sedan confiable y comodo para viajes urbanos o de ruta.',
  },
  {
    id: '2',
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    tipo: 'SUV',
    sucursal: 'Aeropuerto',
    estado: 'Disponible',
    precioDiario: 56000,
    confort: ['Aire acondicionado', 'Camara trasera', 'Pantalla multimedia', 'Isofix'],
    imagenes: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'SUV compacta con buen despeje y espacio para equipaje familiar.',
  },
  {
    id: '3',
    marca: 'Fiat',
    modelo: 'Cronos',
    tipo: 'Compacto',
    sucursal: 'Terminal Norte',
    estado: 'Alquilado',
    precioDiario: 35000,
    confort: ['Aire acondicionado', 'Direccion asistida', 'USB', 'Baul amplio'],
    imagenes: [
      'https://images.unsplash.com/photo-1549927681-0b673b8243ab?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'Opcion economica para traslados diarios con bajo consumo.',
  },
  {
    id: '4',
    marca: 'Ford',
    modelo: 'Ranger',
    tipo: 'Utilitario',
    sucursal: 'Puerto',
    estado: 'Disponible',
    precioDiario: 69000,
    confort: ['Doble cabina', 'Traccion 4x4', 'Control de estabilidad', 'Sensor de estacionamiento'],
    imagenes: [
      'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'Pick-up robusta para trabajo, traslados de carga liviana y terrenos exigentes.',
  },
  {
    id: '5',
    marca: 'Chevrolet',
    modelo: 'Onix',
    tipo: 'Compacto',
    sucursal: 'Centro',
    estado: 'Mantenimiento',
    precioDiario: 32000,
    confort: ['Aire acondicionado', 'Android Auto', 'Apple CarPlay', 'Alarma'],
    imagenes: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'Compacto agil para ciudad con conectividad y excelente consumo.',
  },
  {
    id: '6',
    marca: 'Mercedes-Benz',
    modelo: 'Clase C',
    tipo: 'Premium',
    sucursal: 'Aeropuerto',
    estado: 'Disponible',
    precioDiario: 98000,
    confort: ['Tapizado premium', 'Techo panoramico', 'Asientos calefaccionados', 'Asistencia de carril'],
    imagenes: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
    ],
    descripcion: 'Vehiculo ejecutivo para viajes especiales y traslados corporativos.',
  },
]

export const reservas = [
  {
    id: 'R-1024',
    cliente: 'Marina Gomez',
    vehiculo: 'Toyota Corolla',
    sucursal: 'Centro',
    inicio: '2026-06-12',
    devolucion: '2026-06-15',
    estado: 'Confirmada',
    costoEstimado: 126000,
  },
  {
    id: 'R-1025',
    cliente: 'Luis Pereira',
    vehiculo: 'Volkswagen T-Cross',
    sucursal: 'Aeropuerto',
    inicio: '2026-06-13',
    devolucion: '2026-06-18',
    estado: 'Pendiente',
    costoEstimado: 280000,
  },
  {
    id: 'R-1026',
    cliente: 'Camila Suarez',
    vehiculo: 'Ford Ranger',
    sucursal: 'Puerto',
    inicio: '2026-06-14',
    devolucion: '2026-06-17',
    estado: 'En curso',
    costoEstimado: 207000,
  },
]

export const alquileres = [
  {
    id: 'A-314',
    cliente: 'Camila Suarez',
    vehiculo: 'Ford Ranger',
    sucursal: 'Puerto',
    inicio: '2026-06-06',
    devolucionPrevista: '2026-06-10',
    estado: 'En curso',
    importe: 276000,
  },
  {
    id: 'A-315',
    cliente: 'Rafael Medina',
    vehiculo: 'Fiat Cronos',
    sucursal: 'Terminal Norte',
    inicio: '2026-06-04',
    devolucionPrevista: '2026-06-08',
    estado: 'Atrasado',
    importe: 140000,
  },
  {
    id: 'A-316',
    cliente: 'Paula Arias',
    vehiculo: 'Toyota Corolla',
    sucursal: 'Centro',
    inicio: '2026-06-01',
    devolucionPrevista: '2026-06-05',
    estado: 'Finalizado',
    importe: 168000,
  },
]

export const facturas = [
  { id: 'F-842', alquilerId: 'A-316', fecha: '2026-06-05', total: 168000 },
  { id: 'F-843', alquilerId: 'A-311', fecha: '2026-06-07', total: 112000 },
  { id: 'F-844', alquilerId: 'A-312', fecha: '2026-06-08', total: 196000 },
]

export const vehiculosAtrasados = [
  {
    id: 'VA-1',
    vehiculo: 'Fiat Cronos',
    cliente: 'Rafael Medina',
    sucursal: 'Terminal Norte',
    devolucionPrevista: '2026-06-08',
    diasAtraso: 1,
  },
]
