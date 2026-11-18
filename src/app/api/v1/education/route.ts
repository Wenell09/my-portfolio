import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { EducationService } from '@/services/education';

export async function GET() {
  try {
    const education = await EducationService.getAll();
    return NextResponse.json({ education });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch education records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const education = await EducationService.create(body);

    revalidatePath('/');
    return NextResponse.json(education, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create education record' }, { status: 400 });
  }
}
