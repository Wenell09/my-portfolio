import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { SocialLinkService } from '@/services/social-link';

export async function GET() {
  try {
    const socialLinks = await SocialLinkService.getAll();
    return NextResponse.json({ socialLinks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch social links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const link = await SocialLinkService.create(body);

    revalidatePath('/');
    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create social link' }, { status: 400 });
  }
}
