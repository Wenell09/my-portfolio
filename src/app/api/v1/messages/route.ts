import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { MessageService } from '@/services/message';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await MessageService.getAll();
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactMessage = await MessageService.create(body);

    return NextResponse.json({ success: true, contactMessage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit message' }, { status: 400 });
  }
}
