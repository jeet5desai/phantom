import prisma from '../db/prisma.js';
import { generateId, encrypt } from '../lib/crypto.js';

export interface Credential {
  id: string;
  userId: string;
  service: string;
  label: string | null;
  createdAt: Date;
  rotatedAt: Date | null;
}

/** Store a credential in the encrypted vault. */
export async function storeCredential(
  userId: string,
  service: string,
  apiKey: string,
  label?: string,
): Promise<Credential> {
  const id = generateId('cred');
  const { encrypted, iv } = encrypt(apiKey);

  return prisma.credential.create({
    data: {
      id,
      userId,
      service,
      label: label || null,
      encryptedKey: encrypted,
      iv,
    },
    select: {
      id: true,
      userId: true,
      service: true,
      label: true,
      createdAt: true,
      rotatedAt: true,
    },
  });
}

/** List credentials for a user (metadata only, no decryption). */
export async function listCredentials(userId: string): Promise<Credential[]> {
  return prisma.credential.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      service: true,
      label: true,
      createdAt: true,
      rotatedAt: true,
    },
  });
}

/** Rotate a credential — replace the stored key. */
export async function rotateCredential(
  userId: string,
  credentialId: string,
  newApiKey: string,
): Promise<Credential | null> {
  const { encrypted, iv } = encrypt(newApiKey);

  return prisma.credential
    .update({
      where: {
        id: credentialId,
        userId,
      },
      data: {
        encryptedKey: encrypted,
        iv,
        rotatedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        service: true,
        label: true,
        createdAt: true,
        rotatedAt: true,
      },
    })
    .catch(() => null);
}

/** Delete a credential. */
export async function deleteCredential(userId: string, credentialId: string): Promise<boolean> {
  try {
    await prisma.credential.delete({
      where: {
        id: credentialId,
        userId,
      },
    });
    return true;
  } catch {
    return false;
  }
}
