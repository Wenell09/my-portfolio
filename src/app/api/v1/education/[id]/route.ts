import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { EducationService } from '@/services/education';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const item = await EducationService.getById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch education record' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await EducationService.update(params.id, body);

    revalidatePath('/');
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update education record' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await EducationService.delete(params.id);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Education record deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete education record' }, { status: 400 });
  }
}
