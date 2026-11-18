import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { ProjectService } from '@/services/project';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession();
    // If user is not authenticated admin, only return published items
    const publishedOnly = !session.isLoggedIn || searchParams.get('published') === 'true';

    const projects = await ProjectService.getAll(publishedOnly);
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const project = await ProjectService.create(body);

    revalidatePath('/');
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 400 });
  }
}
