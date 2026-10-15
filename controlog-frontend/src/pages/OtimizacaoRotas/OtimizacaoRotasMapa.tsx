import { useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { aplicarFixIconesLeaflet } from '@/lib/leafletIconFix';
import { CINZA_SELECAO, depositoIcon, iconeColorido, pedidoIcon } from '@/lib/mapaIcones';
import { AjustarBounds, CapturaCliqueDesenho, PoligonoDesenho } from '@/components/shared/mapaDesenho';
import { pedidosNaoAtribuidos, type RotaSimulada } from './rotasSimuladas';
import type { Coordenada, Pedido } from './types';

aplicarFixIconesLeaflet();

interface Props {
  origem: Coordenada;
  todosPedidos: Pedido[];
  rotas: RotaSimulada[];
  pedidosSelecionadosIds: Set<string>;
  rotaEmFocoId?: string | null;
  modoDesenho: boolean;
  pontosPoligono: Coordenada[];
  onCliqueMapa: (ponto: Coordenada) => void;
}

export default function OtimizacaoRotasMapa({
  origem,
  todosPedidos,
  rotas,
  pedidosSelecionadosIds,
  rotaEmFocoId,
  modoDesenho,
  pontosPoligono,
  onCliqueMapa,
}: Props) {
  const [boundsIniciais] = useState<[number, number][]>(() =>
    [origem, ...todosPedidos].map((p): [number, number] => [p.lat, p.lng])
  );

  const pedidosPorId = useMemo(() => new Map(todosPedidos.map((p) => [p.id, p])), [todosPedidos]);
  const naoAtribuidos = useMemo(() => pedidosNaoAtribuidos(todosPedidos, rotas), [todosPedidos, rotas]);

  const boundsFoco = useMemo<[number, number][]>(() => {
    const rotaFocada = rotaEmFocoId ? rotas.find((r) => r.id === rotaEmFocoId) : undefined;
    // Rota focada sem nenhum pedido (ex.: acabou de ficar vazia por uma
    // reatribuição) — enquadrar só a origem daria zoom máximo num ponto só,
    // então cai pro conjunto completo em vez de "focar" em nada.
    if (!rotaFocada || rotaFocada.pedidoIds.length === 0) {
      return [origem, ...todosPedidos].map((p) => [p.lat, p.lng]);
    }

    const pontosRota = rotaFocada.pedidoIds
      .map((id) => pedidosPorId.get(id))
      .filter((p): p is Pedido => Boolean(p));
    return [origem, ...pontosRota].map((p) => [p.lat, p.lng]);
  }, [rotaEmFocoId, rotas, todosPedidos, origem, pedidosPorId]);

  return (
    <MapContainer
      bounds={boundsIniciais}
      boundsOptions={{ padding: [30, 30] }}
      style={{ height: '420px', width: '100%', borderRadius: '8px', cursor: modoDesenho ? 'crosshair' : undefined }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AjustarBounds bounds={boundsFoco} />
      <CapturaCliqueDesenho ativo={modoDesenho} onClique={onCliqueMapa} />

      <Marker position={[origem.lat, origem.lng]} icon={depositoIcon} interactive={!modoDesenho}>
        <Popup>🏭 Centro de Distribuição</Popup>
      </Marker>

      {naoAtribuidos.map((pedido) => {
        const selecionado = pedidosSelecionadosIds.has(pedido.id);
        return (
          <Marker
            key={pedido.id}
            position={[pedido.lat, pedido.lng]}
            icon={selecionado ? iconeColorido(CINZA_SELECAO, undefined, true) : pedidoIcon}
            interactive={!modoDesenho}
          >
            <Popup>{pedido.endereco}</Popup>
          </Marker>
        );
      })}

      {rotas.flatMap((rota) => {
        const emFoco = !rotaEmFocoId || rotaEmFocoId === rota.id;
        const ordemPorId = new Map((rota.resultado?.ordem ?? []).map((p) => [p.id, p.posicao]));

        return rota.pedidoIds.map((id) => {
          const pedido = pedidosPorId.get(id);
          if (!pedido) return null;
          const selecionado = pedidosSelecionadosIds.has(id);

          return (
            <Marker
              key={id}
              position={[pedido.lat, pedido.lng]}
              icon={iconeColorido(rota.cor, ordemPorId.get(id), selecionado)}
              opacity={emFoco ? 1 : 0.35}
              interactive={!modoDesenho}
            >
              <Popup>
                {pedido.endereco} — {rota.nome}
              </Popup>
            </Marker>
          );
        });
      })}

      {rotas
        .filter((rota) => rota.resultado && rota.pedidoIds.length > 0)
        .map((rota) => {
          const resultado = rota.resultado!;
          const linha: [number, number][] =
            resultado.rotaReal?.pontos ??
            [[origem.lat, origem.lng], ...resultado.ordem.map((p): [number, number] => [p.lat, p.lng])];
          const emFoco = !rotaEmFocoId || rotaEmFocoId === rota.id;

          return (
            <Polyline
              key={rota.id}
              positions={linha}
              color={rota.cor}
              weight={3}
              opacity={emFoco ? 1 : 0.25}
              dashArray={resultado.rotaReal ? undefined : '8, 8'}
            />
          );
        })}

      {modoDesenho && <PoligonoDesenho pontos={pontosPoligono} />}
    </MapContainer>
  );
}
