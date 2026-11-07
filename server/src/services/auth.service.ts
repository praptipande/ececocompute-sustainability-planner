import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserModel, type UserDocument } from '../models/user.model.js';
import type { User } from '../types/user.js';

const PASSWORD_HASH_ROUNDS = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export function toPublicUser(user: UserDocument): User {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function createToken(user: UserDocument): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    issuer: 'ecocompute-api',
    subject: user._id.toString(),
  };

  return jwt.sign({ role: user.role }, env.jwtSecret, options);
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: 'user',
  });

  return {
    token: createToken(user),
    user: toPublicUser(user),
  };
}

export async function authenticateUser(input: LoginInput): Promise<AuthResult | null> {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return null;
  }

  return {
    token: createToken(user),
    user: toPublicUser(user),
  };
}

export async function findPublicUserById(id: string): Promise<User | null> {
  const user = await UserModel.findById(id);
  return user ? toPublicUser(user) : null;
}
