import { Router, type Request, type Response, type NextFunction } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

export const validateUserCreation = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, id } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'El nombre de usuario es obligatorio y debe tener al menos 2 caracteres'
    });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'El correo electrónico es obligatorio'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'El formato del correo electrónico no es válido'
    });
  }

  if (id !== undefined && (typeof id !== 'string' || id.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'El identificador (id), si se proporciona, debe ser una cadena no vacía'
    });
  }

  next();
};

router.post('/', validateUserCreation, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

export default router;
