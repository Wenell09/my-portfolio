import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { SkillCategoryService } from '@/services/skill';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await SkillCategoryService.getById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Skill category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch skill category' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const category = await SkillCategoryService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update skill category' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SkillCategoryService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Skill category deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete skill category' }, { status: 400 });
  }
}
