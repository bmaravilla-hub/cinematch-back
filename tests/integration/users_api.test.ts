import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Paso 4: Pruebas de Integración de Registro y Consulta de Usuarios (/api/users)', () => {
  it('GET /api/users debe retornar la lista de usuarios precargados', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(5);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/users/:id debe retornar los datos de un usuario existente en O(1)', async () => {
    const res = await request(app).get('/api/users/u001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('u001');
    expect(res.body.data.name).toBe('Usuario CineMatch');
  });

  it('GET /api/users/:id debe retornar 404 para un usuario inexistente', async () => {
    const res = await request(app).get('/api/users/u_no_existe_999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users debe registrar un nuevo usuario con éxito', async () => {
    const uniqueEmail = `sofia_${Date.now()}@cinematch.com`;
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Sofía Herrera',
        email: uniqueEmail
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe('Sofía Herrera');
    expect(res.body.data.email).toBe(uniqueEmail);
    expect(res.body.data.id).toBeDefined();

    const getRes = await request(app).get(`/api/users/${res.body.data.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.name).toBe('Sofía Herrera');
  });

  it('POST /api/users debe permitir registrar un usuario con ID personalizado', async () => {
    const customId = `u_custom_${Date.now()}`;
    const customEmail = `marcos_${Date.now()}@cinematch.com`;
    const res = await request(app)
      .post('/api/users')
      .send({
        id: customId,
        name: 'Marcos Peña',
        email: customEmail
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(customId);
  });

  it('POST /api/users debe rechazar nombres vacíos o menores a 2 caracteres con 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: ' A ',
        email: 'valido@cinematch.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/al menos 2 caracteres/);
  });

  it('POST /api/users debe rechazar correos con formato inválido con 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Nombre Valido',
        email: 'correo-sin-arroba-ni-dominio'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/formato del correo/);
  });

  it('POST /api/users debe rechazar un ID de usuario duplicado con 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        id: 'u001',
        name: 'Intento Duplicado',
        email: `unico_${Date.now()}@cinematch.com`
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya existe/);
  });

  it('POST /api/users debe rechazar un correo duplicado con 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Otro Usuario',
        email: 'usuario@cinematch.com'
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya se encuentra registrado/);
  });

  it('Nuevo usuario registrado debe poder consultar recomendaciones (activando fallback)', async () => {
    const newUserId = `u_cold_${Date.now()}`;
    const registerRes = await request(app)
      .post('/api/users')
      .send({
        id: newUserId,
        name: 'Usuario Cold Start',
        email: `cold_${Date.now()}@cinematch.com`
      });
    expect(registerRes.status).toBe(201);

    const recsRes = await request(app)
      .get('/api/recommendations')
      .query({ userId: newUserId, limit: 3 });

    expect(recsRes.status).toBe(200);
    expect(recsRes.body.count).toBe(3);
    expect(recsRes.body.data[0].strategy).toBe('fallback_popularity');
  });
});
