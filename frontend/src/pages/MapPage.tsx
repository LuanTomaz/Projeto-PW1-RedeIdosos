import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CalendarHeart, HandHeart, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { companionshipsAPI, eldersAPI, volunteersAPI } from '@/lib/api';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const elderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const companionshipIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function SetViewOnLoad({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [activeTab, setActiveTab] = useState('all');

  const [eldersResult, volunteersResult, companionshipsResult] = useQueries({
    queries: [
      {
        queryKey: ['map', 'elders'],
        queryFn: async () => (await eldersAPI.getAll()).data,
      },
      {
        queryKey: ['map', 'volunteers'],
        queryFn: async () => (await volunteersAPI.getAll()).data,
      },
      {
        queryKey: ['map', 'companionships'],
        queryFn: async () => (await companionshipsAPI.getAll()).data,
      },
    ],
  });

  const elders = eldersResult.data ?? [];
  const volunteers = volunteersResult.data ?? [];
  const companionships = companionshipsResult.data ?? [];
  const isLoading = eldersResult.isLoading || volunteersResult.isLoading || companionshipsResult.isLoading;

  const center = useMemo<[number, number]>(() => {
    const firstWithPosition =
      elders.find((item) => item.latitude && item.longitude) ||
      volunteers.find((item) => item.latitude && item.longitude) ||
      companionships.find((item) => item.latitude && item.longitude);

    if (firstWithPosition && firstWithPosition.latitude && firstWithPosition.longitude) {
      return [firstWithPosition.latitude, firstWithPosition.longitude];
    }

    return [-23.555771, -46.639557];
  }, [companionships, elders, volunteers]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mapa</h1>
          <p className="mt-1 text-muted-foreground">
            Visualize a localização de idosos, voluntários e atividades
          </p>
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
            <CardContent className="overflow-hidden rounded-lg p-0">
              <div className="h-[500px] lg:h-[600px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Carregando mapa...
                  </div>
                ) : (
                  <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <SetViewOnLoad center={center} zoom={13} />

                    {(activeTab === 'all' || activeTab === 'elders') &&
                      elders
                        .filter((item) => item.latitude && item.longitude)
                        .map((elder) => (
                          <Marker
                            key={`elder-${elder.id}`}
                            position={[elder.latitude, elder.longitude]}
                            icon={elderIcon}
                          >
                            <Popup>
                              <div className="min-w-[150px] p-2">
                                <div className="mb-2 flex items-center gap-2">
                                  <UserCircle className="h-4 w-4 text-teal-600" />
                                  <span className="font-semibold">Idoso</span>
                                </div>
                                <p className="font-medium">{elder.usuario?.nome || 'Idoso'}</p>
                                <p className="text-sm text-muted-foreground">{elder.endereco}</p>
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                    {(activeTab === 'all' || activeTab === 'volunteers') &&
                      volunteers
                        .filter((item) => item.latitude && item.longitude)
                        .map((volunteer) => (
                          <Marker
                            key={`volunteer-${volunteer.id}`}
                            position={[volunteer.latitude as number, volunteer.longitude as number]}
                            icon={volunteerIcon}
                          >
                            <Popup>
                              <div className="min-w-[150px] p-2">
                                <div className="mb-2 flex items-center gap-2">
                                  <HandHeart className="h-4 w-4 text-orange-600" />
                                  <span className="font-semibold">Voluntário</span>
                                </div>
                                <p className="font-medium">{volunteer.usuario?.nome || 'Voluntário'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {volunteer.disponibilidade || 'Não informado'}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                    {(activeTab === 'all' || activeTab === 'companionships') &&
                      companionships
                        .filter((item) => item.latitude && item.longitude)
                        .map((comp) => (
                          <Marker
                            key={`comp-${comp.id}`}
                            position={[comp.latitude, comp.longitude]}
                            icon={companionshipIcon}
                          >
                            <Popup>
                              <div className="min-w-[180px] p-2">
                                <div className="mb-2 flex items-center gap-2">
                                  <CalendarHeart className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold">Companhia</span>
                                </div>
                                <p className="font-medium">{comp.atividade}</p>
                                <p className="text-sm text-muted-foreground">
                                  Idoso: {comp.idoso?.usuario?.nome || 'Não informado'}
                                </p>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {comp.status}
                                </Badge>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                  </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-teal-500" />
              <span className="text-sm">Idosos ({elders.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-orange-500" />
              <span className="text-sm">Voluntários ({volunteers.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              <span className="text-sm">Companhias ({companionships.length})</span>
            </div>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}


