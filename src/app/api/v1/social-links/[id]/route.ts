import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { SocialLinkService } from '@/services/social-link';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const link = await SocialLinkService.getById(params.id);
    if (!link) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch social link' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const link = await SocialLinkService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(link);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update social link' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SocialLinkService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Social link deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete social link' }, { status: 400 });
  }
}
