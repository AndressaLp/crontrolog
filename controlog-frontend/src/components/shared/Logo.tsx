/**
 * Logo do Controlog — símbolo "C de rota" e wordmark.
 *
 * Geometria e paleta vêm do design "Controlog C-route logo concept"
 * (símbolo 1b, "arrival leg"): o traço parte reto, faz a meia-volta e chega
 * num nó sólido — lê-se como C antes de se ler como rota. No wordmark, o
 * terceiro "o" de Contr-o-log é substituído por esse mesmo nó, que é o que
 * faz símbolo e texto parecerem a mesma família.
 *
 * Tudo escala a partir do `font-size` do elemento: as medidas estão em `em`,
 * como no design, então basta definir o tamanho no ponto de uso.
 */

/** Traçado do símbolo, no sistema de coordenadas 120×120 do design. */
const TRACADO = 'M88 30H60A30 30 0 0 0 60 90H80';
const NO = { cx: 80, cy: 90 };

/**
 * Recortes calculados no design para cada espessura de traço. O traço
 * transborda a geometria do path (metade da espessura para cada lado), e o nó
 * transborda ainda mais embaixo — por isso cada variante tem seu viewBox.
 */
const RECORTE = {
  /** Símbolo isolado, em caixa quadrada: favicon, bloco do login. */
  quadrado: { viewBox: '0 0 120 120', espessura: 10, raio: 9, deslocamento: 'translate(0 -2)' },
  /** Símbolo ao lado do wordmark, recortado junto à altura de maiúscula. */
  lockup: { viewBox: '22 22 74 81', espessura: 16, raio: 13, deslocamento: undefined },
} as const;

/** Temas 2a/2b/2c do design. */
const TEMAS = {
  /** 2a — azul-claro sobre tinta. Sidebar. */
  tinta: { traco: '#60a5fa', no: '#2563eb', texto: '#60a5fa', ponto: '#2563eb' },
  /** 2b — cinza-escuro sobre branco. Fundos claros. */
  claro: { traco: '#1f2937', no: '#2563eb', texto: '#1f2937', ponto: '#2563eb' },
  /** 2c — tudo branco, para vazar sobre o azul da marca. */
  azul: { traco: '#ffffff', no: '#ffffff', texto: '#ffffff', ponto: '#ffffff' },
} as const;

export type LogoTema = keyof typeof TEMAS;

/**
 * Métricas do wordmark em Archivo Bold a 88% de largura, medidas no design.
 * Em `em`, relativas ao font-size do lockup.
 */
const TIPOGRAFIA = {
  familia: "'Archivo Variable', Helvetica, sans-serif",
  largura: "'wdth' 88",
  /** Altura de maiúscula — é por ela que o símbolo é dimensionado. */
  maiuscula: '0.7em',
  /** Diâmetro do ponto que substitui o "o". */
  ponto: '0.53em',
  /** Respiro lateral do ponto, no lugar das laterais da letra. */
  pontoLateral: '0.035em',
  /** Distância entre símbolo e wordmark: a largura de um "o". */
  vao: '0.56em',
} as const;

interface LogoProps {
  tema?: LogoTema;
  className?: string;
}

/** Símbolo isolado, em caixa quadrada. Para favicon e blocos de ícone. */
export function LogoSimbolo({ tema = 'tinta', className }: LogoProps) {
  const { traco, no } = TEMAS[tema];
  const { viewBox, espessura, raio, deslocamento } = RECORTE.quadrado;

  return (
    <svg viewBox={viewBox} className={className} fill="none" aria-hidden="true" focusable="false">
      <g transform={deslocamento}>
        <path
          d={TRACADO}
          stroke={traco}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={NO.cx} cy={NO.cy} r={raio} fill={no} />
      </g>
    </svg>
  );
}

/**
 * A palavra desenhada, sem semântica — quem rotula é o componente que a
 * envolve. Fica sempre `aria-hidden` porque, lida caractere a caractere, ela
 * seria anunciada como "Controlg": o terceiro "o" não é uma letra, é uma forma.
 */
function PalavraVisual({ tema }: { tema: LogoTema }) {
  const { texto, ponto } = TEMAS[tema];

  return (
    <span
      aria-hidden="true"
      style={{
        fontFamily: TIPOGRAFIA.familia,
        fontVariationSettings: TIPOGRAFIA.largura,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: texto,
        whiteSpace: 'nowrap',
      }}
    >
      Control
      <span
        style={{
          display: 'inline-block',
          width: TIPOGRAFIA.ponto,
          height: TIPOGRAFIA.ponto,
          borderRadius: '50%',
          background: ponto,
          margin: `0 ${TIPOGRAFIA.pontoLateral} -0.012em`,
        }}
      />
      g
    </span>
  );
}

/** Wordmark sozinho — "Controlog" com o terceiro "o" virando o nó. */
export function LogoTexto({ tema = 'tinta', className }: LogoProps) {
  return (
    <span role="img" aria-label="Controlog" className={className}>
      <PalavraVisual tema={tema} />
    </span>
  );
}

/**
 * Lockup horizontal: símbolo à esquerda, wordmark à direita, alinhados pela
 * base. Validado no design a 224×32px, que é a largura útil da sidebar.
 */
export function Logo({ tema = 'tinta', className }: LogoProps) {
  const { traco, no } = TEMAS[tema];
  const { viewBox, espessura, raio } = RECORTE.lockup;

  return (
    <span
      role="img"
      aria-label="Controlog"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: TIPOGRAFIA.vao, lineHeight: 1 }}
    >
      <svg
        viewBox={viewBox}
        fill="none"
        aria-hidden="true"
        focusable="false"
        style={{ height: TIPOGRAFIA.maiuscula, width: 'auto', display: 'block', overflow: 'visible' }}
      >
        <path
          d={TRACADO}
          stroke={traco}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={NO.cx} cy={NO.cy} r={raio} fill={no} />
      </svg>
      <PalavraVisual tema={tema} />
    </span>
  );
}
