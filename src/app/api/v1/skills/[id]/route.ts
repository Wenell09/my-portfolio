import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { SkillService } from '@/services/skill';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const skill = await SkillService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(skill);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update skill' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SkillService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Skill deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete skill' }, { status: 400 });
  }
}
