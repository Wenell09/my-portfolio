import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { CertificateService } from '@/services/certificate';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession();
    const publishedOnly = !session.isLoggedIn || searchParams.get('published') === 'true';

    const certificates = await CertificateService.getAll(publishedOnly);
    return NextResponse.json({ certificates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const certificate = await CertificateService.create(body);

    revalidatePath('/');
    return NextResponse.json(certificate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create certificate' }, { status: 400 });
  }
}
