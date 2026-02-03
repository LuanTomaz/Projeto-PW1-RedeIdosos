import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, HandHeart, CalendarHeart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const elderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const companionshipIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mock data
const mockElders = [
  { id: '1', nome: 'Maria Silva', latitude: -23.550520, longitude: -46.633308, endereco: 'Centro' },
  { id: '2', nome: 'José Santos', latitude: -23.561414, longitude: -46.656012, endereco: 'Bela Vista' },
  { id: '3', nome: 'Ana Costa', latitude: -23.553170, longitude: -46.658620, endereco: 'Consolação' },
  { id: '4', nome: 'Pedro Oliveira', latitude: -23.562850, longitude: -46.669200, endereco: 'Jardins' },
];

const mockVolunteers = [
  { id: '1', nome: 'João Santos', latitude: -23.548520, longitude: -46.635308, disponibilidade: 'Manhãs' },
  { id: '2', nome: 'Carlos Lima', latitude: -23.558170, longitude: -46.660620, disponibilidade: 'Tardes' },
  { id: '3', nome: 'Lucia Ferreira', latitude: -23.565850, longitude: -46.665200, disponibilidade: 'Flexível' },
];

const mockCompanionships = [
  { id: '1', atividade: 'Caminhada no parque', latitude: -23.585000, longitude: -46.655000, status: 'aceito', idoso: 'Maria Silva' },
  { id: '2', atividade: 'Ida ao mercado', latitude: -23.560000, longitude: -46.650000, status: 'em_andamento', idoso: 'Ana Costa' },
  { id: '3', atividade: 'Consulta médica', latitude: -23.545000, longitude: -46.640000, status: 'pendente', idoso: 'José Santos' },
];

// Component to set map center
function SetViewOnLoad({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Center of São Paulo
  const center: [number, number] = [-23.555771, -46.639557];
  const zoom = 13;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mapa</h1>
          <p className="text-muted-foreground mt-1">Visualize a localização de idosos, voluntários e atividades</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="elders">Idosos</TabsTrigger>
            <TabsTrigger value="volunteers">Voluntários</TabsTrigger>
            <TabsTrigger value="companionships">Companhias</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <div className="h-[500px] lg:h-[600px]">
                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <SetViewOnLoad center={center} zoom={zoom} />

                  {/* Elders Markers */}
                  {(activeTab === 'all' || activeTab === 'elders') && mockElders.map((elder) => (
                    <Marker
                      key={`elder-${elder.id}`}
                      position={[elder.latitude, elder.longitude]}
                      icon={elderIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[150px]">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCircle className="w-4 h-4 text-teal-600" />
                            <span className="font-semibold">Idoso</span>
                          </div>
                          <p className="font-medium">{elder.nome}</p>
                          <p className="text-sm text-muted-foreground">{elder.endereco}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Volunteers Markers */}
                  {(activeTab === 'all' || activeTab === 'volunteers') && mockVolunteers.map((volunteer) => (
                    <Marker
                      key={`volunteer-${volunteer.id}`}
                      position={[volunteer.latitude, volunteer.longitude]}
                      icon={volunteerIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[150px]">
                          <div className="flex items-center gap-2 mb-2">
                            <HandHeart className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold">Voluntário</span>
                          </div>
                          <p className="font-medium">{volunteer.nome}</p>
                          <p className="text-sm text-muted-foreground">{volunteer.disponibilidade}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Companionships Markers */}
                  {(activeTab === 'all' || activeTab === 'companionships') && mockCompanionships.map((comp) => (
                    <Marker
                      key={`comp-${comp.id}`}
                      position={[comp.latitude, comp.longitude]}
                      icon={companionshipIcon}
                    >
                      <Popup>
                        <div className="p-2 min-w-[180px]">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarHeart className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">Companhia</span>
                          </div>
                          <p className="font-medium">{comp.atividade}</p>
                          <p className="text-sm text-muted-foreground">Idoso: {comp.idoso}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {comp.status}
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-teal-500" />
              <span className="text-sm">Idosos ({mockElders.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">Voluntários ({mockVolunteers.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm">Companhias ({mockCompanionships.length})</span>
            </div>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}
