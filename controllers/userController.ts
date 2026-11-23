import type { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';
import type { CreateUserDTO } from '../models';

export const userController = {
  createUser: (req: Request, res: Response) => {
    try {
      const { id, name, email, avatarUrl } = req.body;
      const service = CatalogService.getInstance();

      const userDto: CreateUserDTO = {
        id: typeof id === 'string' && id.trim() ? id.trim() : undefined,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        avatarUrl: typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : undefined
      };

      const newUser = service.registerNewUser(userDto);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: newUser
      });
    } catch (error: any) {
      const status = error.message.includes('ya existe') ? 409 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Error interno al registrar el usuario'
      });
    }
  },

  getAllUsers: (_req: Request, res: Response) => {
    try {
      const service = CatalogService.getInstance();
      const users = service.getAllUsers();

      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar usuarios',
        error: error.message
      });
    }
  },

  getUserById: (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const service = CatalogService.getInstance();
      const user = service.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuario con ID '${id}' no encontrado`
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar el usuario',
        error: error.message
      });
    }
  }
};
