import { useEffect } from 'react';
import { CircleMarker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { COR_DESENHO } from '@/lib/mapaIcones';
import type { Coordenada } from '@/pages/OtimizacaoRotas/types';

// Peças comuns aos dois mapas que têm seleção por polígono (Otimização de
// Rotas e detalhe do Plano).

function assinaturaBounds(bounds: [number, number][]): string {
  return bounds.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(';');
}

// MapContainer.bounds só é lido no mount — não reage a mudanças depois. Pra
// re-enquadrar quando o foco de rota muda, precisa de um efeito imperativo
// via a instância do mapa (useMap), amarrado a uma assinatura estável (não
// ao array em si, que muda de referência a cada render).
export function AjustarBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  const assinatura = assinaturaBounds(bounds);

  useEffect(() => {
    if (bounds.length === 0) return;
    map.fitBounds(bounds, { padding: [30, 30] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura]);

  return null;
}

// Captura cliques no mapa pra desenhar o polígono, e desliga o zoom por
// duplo-clique enquanto isso (senão dois cliques rápidos de vértice
// próximos no tempo dão zoom sem querer). doubleClickZoom também só vale
// como prop estática no mount, precisa ser imperativo.
export function CapturaCliqueDesenho({
  ativo,
  onClique,
}: {
  ativo: boolean;
  onClique: (ponto: Coordenada) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (ativo) onClique({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (ativo) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [ativo, map]);

  return null;
}

export function PoligonoDesenho({ pontos }: { pontos: Coordenada[] }) {
  if (pontos.length === 0) return null;

  return (
    <>
      <Polygon
        positions={pontos.map((p): [number, number] => [p.lat, p.lng])}
        pathOptions={{ color: COR_DESENHO, dashArray: '4, 4', fillOpacity: 0.1 }}
      />
      {pontos.map((p, indice) => (
        <CircleMarker
          key={indice}
          center={[p.lat, p.lng]}
          radius={5}
          pathOptions={{ color: COR_DESENHO, fillColor: COR_DESENHO, fillOpacity: 1 }}
        />
      ))}
    </>
  );
}
