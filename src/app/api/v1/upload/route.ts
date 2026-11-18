import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { StorageService } from '@/services/storage';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const replaceUrl = formData.get('replaceUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    let result;
    if (replaceUrl) {
      result = await StorageService.replace(replaceUrl, file, folder);
    } else {
      result = await StorageService.upload(file, folder);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to storage' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    await StorageService.delete(url);
    return NextResponse.json({ success: true, message: 'File deleted' });
  } catch (error: any) {
    console.error('Blob delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file from storage' },
      { status: 400 }
    );
  }
}
