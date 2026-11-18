import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const ContactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional().nullable(),
  message: z.string().min(1, 'Message is required'),
});

export const ContactMessageUpdateSchema = z.object({
  read: z.boolean(),
});

export class MessageService {
  static async getAll() {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    return await prisma.contactMessage.findUnique({ where: { id } });
  }

  static async create(raw: unknown) {
    const data = ContactMessageSchema.parse(raw);
    return await prisma.contactMessage.create({
      data: {
        ...data,
        subject: data.subject || 'Portfolio Contact',
      },
    });
  }

  static async updateRead(id: string, read: boolean) {
    return await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });
  }

  static async delete(id: string) {
    return await prisma.contactMessage.delete({ where: { id } });
  }
}
