import prisma from '../db/prisma.js';
import { generateId, encrypt } from '../lib/crypto.js';

export interface Credential {
  id: string;
  orgId: string;
  service: string;
  label: string | null;
  createdAt: Date;
  rotatedAt: Date | null;
}

/** Store a credential in the encrypted vault. */
export async function storeCredential(
  orgId: string,
  service: string,
  apiKey: string,
  label?: string,
): Promise<Credential> {
  const id = generateId('cred');
  const { encrypted, iv } = encrypt(apiKey);

  return prisma.credential.create({
    data: {
      id,
      orgId,
      service,
      label: label || null,
      encryptedKey: encrypted,
      iv,
    },
    select: {
      id: true,
      orgId: true,
      service: true,
      label: true,
      createdAt: true,
      rotatedAt: true,
    },
  });
}

/** List credentials for an org (metadata only, no decryption). */
export async function listCredentials(orgId: string): Promise<Credential[]> {
  return prisma.credential.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orgId: true,
      service: true,
      label: true,
      createdAt: true,
      rotatedAt: true,
    },
  });
}

/** Rotate a credential — replace the stored key. */
export async function rotateCredential(
  orgId: string,
  credentialId: string,
  newApiKey: string,
): Promise<Credential | null> {
  const { encrypted, iv } = encrypt(newApiKey);

  return prisma.credential.update({
    where: {
      id: credentialId,
      orgId,
    },
    data: {
      encryptedKey: encrypted,
      iv,
      rotatedAt: new Date(),
    },
    select: {
      id: true,
      orgId: true,
      service: true,
      label: true,
      createdAt: true,
      rotatedAt: true,
    },
  }).catch(() => null);
}

/** Delete a credential. */
export async function deleteCredential(orgId: string, credentialId: string): Promise<boolean> {
  try {
    await prisma.credential.delete({
      where: {
        id: credentialId,
        orgId,
      },
    });
    return true;
  } catch {
    return false;
  }
}

