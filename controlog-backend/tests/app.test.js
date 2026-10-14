import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

const app = createApp();

function tokenDe(perfil) {
  return jwt.sign({ perfil, nome: 'Teste' }, env.jwtSecret, { subject: 'u1', expiresIn: '1h' });
}

describe('app', () => {
  test('GET /health responde 200 com status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // RN01 — Apenas usuários autenticados podem acessar qualquer funcionalidade do sistema
  test('GET /api/rotas sem token responde 401', async () => {
    const res = await request(app).get('/api/rotas');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  test('POST /api/otimizacao-rotas/otimizar sem token responde 401', async () => {
    const res = await request(app).post('/api/otimizacao-rotas/otimizar').send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  test('GET /api/pedidos sem token responde 401', async () => {
    const res = await request(app).get('/api/pedidos');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  test('GET /api/planos sem token responde 401', async () => {
    const res = await request(app).get('/api/planos');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  test('POST /api/planos/:id/rotas/:rotaIndex/aprovar sem token responde 401', async () => {
    const res = await request(app).post('/api/planos/plano1/rotas/1/aprovar').send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  test('GET /api/minhas-rotas sem token responde 401', async () => {
    const res = await request(app).get('/api/minhas-rotas');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UnauthorizedError');
  });

  // O motorista só enxerga a própria visão restrita — gestão da operação é
  // bloqueada por perfil, não só escondida na interface.
  test('token de MOTORISTA recebe 403 nas rotas de gestão', async () => {
    const token = tokenDe('MOTORISTA');

    for (const path of ['/api/rotas', '/api/motoristas', '/api/planos', '/api/dashboard']) {
      const res = await request(app).get(path).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('ForbiddenError');
    }
  });

  test('token de GESTOR recebe 403 em /api/minhas-rotas', async () => {
    const res = await request(app)
      .get('/api/minhas-rotas')
      .set('Authorization', `Bearer ${tokenDe('GESTOR')}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ForbiddenError');
  });

  test('criar acesso de motorista é restrito ao GESTOR', async () => {
    const res = await request(app)
      .post('/api/motoristas/m1/acesso')
      .set('Authorization', `Bearer ${tokenDe('OPERADOR')}`)
      .send({ email: 'motorista@controlog.com', senha: 'senha12345' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ForbiddenError');
  });

  test('rota inexistente responde 404', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.status).toBe(404);
  });

  test('POST /api/auth/login com corpo inválido responde 422', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nao-e-email' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('ValidationError');
  });
});
