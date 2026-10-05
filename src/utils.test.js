// src/utils.test.js
import { describe, it, expect } from 'vitest';
import { calcularFrete, calcularTotal } from './utils.js';

describe('calcularFrete', () => {
  it('cobra R$ 6 abaixo de R$ 100', () => expect(calcularFrete(80)).toBe(6));
  it('é grátis a partir de R$ 100', () => expect(calcularFrete(100)).toBe(0));
  it('não cobra com sacola vazia', () => expect(calcularFrete(0)).toBe(0));
});

describe('calcularTotal', () => {
  it('soma o frete ao subtotal', () => expect(calcularTotal(92)).toBe(98));
});