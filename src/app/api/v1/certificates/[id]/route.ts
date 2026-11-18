import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { CertificateService } from '@/services/certificate';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const certificate = await CertificateService.getById(params.id);
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }
    return NextResponse.json(certificate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch certificate' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const certificate = await CertificateService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(certificate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update certificate' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await CertificateService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Certificate deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete certificate' }, { status: 400 });
  }
}
