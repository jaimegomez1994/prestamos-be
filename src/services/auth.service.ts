import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../lib/password';
import { generateToken } from '../lib/jwt';
import type { LoginDTO, AuthResponse, UserInfo } from '../types/auth.types';

export class AuthService {
  static async login(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    await UserRepository.updateLastLogin(user.id);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  static async getCurrentUser(userId: string): Promise<{ user: UserInfo }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }
}
