import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo, LogoSimbolo, LogoTexto } from './Logo';

describe('Logo', () => {
  // O terceiro "o" de Controlog é uma forma desenhada, não a letra. Sem o
  // aria-label a marca seria anunciada como "Controlg" — é a regressão que
  // estes testes existem para pegar.
  test('o lockup se anuncia como "Controlog", não como o texto desenhado', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: 'Controlog' })).toBeInTheDocument();
  });

  test('o wordmark sozinho também se anuncia como "Controlog"', () => {
    render(<LogoTexto tema="claro" />);
    expect(screen.getByRole('img', { name: 'Controlog' })).toBeInTheDocument();
  });

  test('esconde o texto desenhado da árvore de acessibilidade', () => {
    render(<Logo />);
    // Lido letra a letra, o desenho é "Controlg" — ele existe no DOM, mas
    // precisa estar aria-hidden para não ser anunciado no lugar do rótulo.
    const desenho = screen.getByText('Controlg');
    expect(desenho).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('img', { name: 'Controlog' })).toContainElement(desenho);
  });

  test('o símbolo isolado é decorativo — quem rotula é o contexto', () => {
    const { container } = render(<LogoSimbolo tema="azul" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('cada tema aplica a paleta correspondente do design', () => {
    const { container: tinta } = render(<LogoSimbolo tema="tinta" />);
    expect(tinta.querySelector('path')).toHaveAttribute('stroke', '#60a5fa');
    expect(tinta.querySelector('circle')).toHaveAttribute('fill', '#2563eb');

    const { container: azul } = render(<LogoSimbolo tema="azul" />);
    expect(azul.querySelector('path')).toHaveAttribute('stroke', '#ffffff');
    expect(azul.querySelector('circle')).toHaveAttribute('fill', '#ffffff');
  });
});
