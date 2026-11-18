import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { ExperienceService } from '@/services/experience';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession();
    const publishedOnly = !session.isLoggedIn || searchParams.get('published') === 'true';

    const experiences = await ExperienceService.getAll(publishedOnly);
    return NextResponse.json({ experiences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const experience = await ExperienceService.create(body);

    revalidatePath('/');
    return NextResponse.json(experience, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create experience' }, { status: 400 });
  }
}
