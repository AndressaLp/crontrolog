import { useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { aplicarFixIconesLeaflet } from '@/lib/leafletIconFix';
import { CINZA_SELECAO, depositoIcon, iconeColorido, pedidoIcon } from '@/lib/mapaIcones';
import { AjustarBounds, CapturaCliqueDesenho, PoligonoDesenho } from '@/components/shared/mapaDesenho';
import type { Coordenada, ResultadoOtimizacao } from '@/pages/OtimizacaoRotas/types';
import type { Pedido } from '@/pages/Pedidos/types';

aplicarFixIconesLeaflet();

export interface GrupoNoMapa {
  indice: number;
  cor: string;
  pedidos: Pedido[];
  resultado: ResultadoOtimizacao | null;
}

interface Props {
  origem: Coordenada;
  grupos: GrupoNoMapa[];
  /** Pedidos do plano que ficaram fora de qualquer rota. */
  naoAtribuidos?: Pedido[];
  pedidosSelecionadosIds?: Set<string>;
  grupoEmFocoIndice?: number | null;
  modoDesenho?: boolean;
  pontosPoligono?: Coordenada[];
  onCliqueMapa?: (ponto: Coordenada) => void;
}

export default function PlanoMapa({
  origem,
  grupos,
  naoAtribuidos = [],
  pedidosSelecionadosIds = new Set(),
  grupoEmFocoIndice = null,
  modoDesenho = false,
  pontosPoligono = [],
  onCliqueMapa,
}: Props) {
  const [boundsIniciais] = useState<[number, number][]>(() => [
    [origem.lat, origem.lng],
    ...grupos.flatMap((grupo) => grupo.pedidos.map((p): [number, number] => [p.lat, p.lng])),
  ]);

  const todosPontos = useMemo<[number, number][]>(
    () => [
      [origem.lat, origem.lng],
      ...grupos.flatMap((g) => g.pedidos.map((p): [number, number] => [p.lat, p.lng])),
      ...naoAtribuidos.map((p): [number, number] => [p.lat, p.lng]),
    ],
    [origem, grupos, naoAtribuidos]
  );

  const boundsFoco = useMemo<[number, number][]>(() => {
    const grupoFocado = grupoEmFocoIndice
      ? grupos.find((g) => g.indice === grupoEmFocoIndice)
      : undefined;
    // Grupo focado sem pedidos (ex.: acabou de ficar vazio por uma
    // reatribuição) — enquadrar só a origem daria zoom máximo num ponto só.
    if (!grupoFocado || grupoFocado.pedidos.length === 0) return todosPontos;

    return [
      [origem.lat, origem.lng],
      ...grupoFocado.pedidos.map((p): [number, number] => [p.lat, p.lng]),
    ];
  }, [grupoEmFocoIndice, grupos, origem, todosPontos]);

  return (
    <MapContainer
      bounds={boundsIniciais}
      boundsOptions={{ padding: [30, 30] }}
      style={{
        height: '420px',
        width: '100%',
        borderRadius: '8px',
        cursor: modoDesenho ? 'crosshair' : undefined,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AjustarBounds bounds={boundsFoco} />
      <CapturaCliqueDesenho ativo={modoDesenho} onClique={onCliqueMapa ?? (() => {})} />

      <Marker position={[origem.lat, origem.lng]} icon={depositoIcon} interactive={!modoDesenho}>
        <Popup>🏭 Centro de Distribuição</Popup>
      </Marker>

      {naoAtribuidos.map((pedido) => (
        <Marker
          key={pedido.id}
          position={[pedido.lat, pedido.lng]}
          icon={
            pedidosSelecionadosIds.has(pedido.id)
              ? iconeColorido(CINZA_SELECAO, undefined, true)
              : pedidoIcon
          }
          interactive={!modoDesenho}
        >
          <Popup>{pedido.endereco} — sem rota</Popup>
        </Marker>
      ))}

      {grupos.flatMap((grupo) => {
        const ordemPorId = new Map((grupo.resultado?.ordem ?? []).map((p) => [p.id, p.posicao]));
        const emFoco = !grupoEmFocoIndice || grupoEmFocoIndice === grupo.indice;

        return grupo.pedidos.map((pedido) => (
          <Marker
            key={pedido.id}
            position={[pedido.lat, pedido.lng]}
            icon={iconeColorido(
              grupo.cor,
              ordemPorId.get(pedido.id),
              pedidosSelecionadosIds.has(pedido.id)
            )}
            opacity={emFoco ? 1 : 0.35}
            interactive={!modoDesenho}
          >
            <Popup>
              {pedido.endereco} — Rota {grupo.indice}
            </Popup>
          </Marker>
        ));
      })}

      {grupos.map((grupo) => {
        if (grupo.pedidos.length === 0) return null;

        const linha: [number, number][] =
          grupo.resultado?.rotaReal?.pontos ??
          [
            [origem.lat, origem.lng],
            ...(grupo.resultado?.ordem.map((p): [number, number] => [p.lat, p.lng]) ??
              grupo.pedidos.map((p): [number, number] => [p.lat, p.lng])),
          ];
        const emFoco = !grupoEmFocoIndice || grupoEmFocoIndice === grupo.indice;

        return (
          <Polyline
            key={grupo.indice}
            positions={linha}
            color={grupo.cor}
            weight={3}
            opacity={emFoco ? 1 : 0.25}
            dashArray={grupo.resultado?.rotaReal ? undefined : '8, 8'}
          />
        );
      })}

      {modoDesenho && <PoligonoDesenho pontos={pontosPoligono} />}
    </MapContainer>
  );
}
