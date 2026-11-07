import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';

const PASSWORD_HASH_ROUNDS = 12;

export class AdminProvisioningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminProvisioningError';
  }
}

export async function provisionInitialAdmin(): Promise<void> {
  const admin = env.initialAdmin;

  if (!admin) {
    return;
  }

  const existingUser = await UserModel.findOne({ email: admin.email }).select('+passwordHash');

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      throw new AdminProvisioningError(
        'Configured admin email belongs to an existing non-admin user',
      );
    }

    return;
  }

  const passwordHash = await bcrypt.hash(admin.password, PASSWORD_HASH_ROUNDS);

  try {
    await UserModel.create({
      name: 'EcoCompute Administrator',
      email: admin.email,
      passwordHash,
      role: 'admin',
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const concurrentUser = await UserModel.findOne({ email: admin.email });

    if (!concurrentUser || concurrentUser.role !== 'admin') {
      throw new AdminProvisioningError(
        'Configured admin email became occupied by a non-admin user',
      );
    }
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

