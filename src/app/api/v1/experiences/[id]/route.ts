import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { ExperienceService } from '@/services/experience';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const experience = await ExperienceService.getById(params.id);
    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    return NextResponse.json(experience);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch experience' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const experience = await ExperienceService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(experience);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update experience' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ExperienceService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Experience deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete experience' }, { status: 400 });
  }
}
