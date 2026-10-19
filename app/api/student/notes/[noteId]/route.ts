import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Context = {
  params: Promise<{ noteId: string }>;
};

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;
    const body = await req.json();

    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const data: { title?: string | null; content?: string } = {};

    if (typeof body.title === 'string') {
      data.title = body.title.trim() || null;
    }

    if (typeof body.content === 'string') {
      if (!body.content.trim()) {
        return NextResponse.json({ message: 'Note content cannot be empty' }, { status: 400 });
      }
      data.content = body.content.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'No valid changes provided' }, { status: 400 });
    }

    const note = await prisma.note.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Update student note error:', error);
    return NextResponse.json({ message: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    const result = await prisma.note.deleteMany({
      where: { id: noteId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete student note error:', error);
    return NextResponse.json({ message: 'Failed to delete note' }, { status: 500 });
  }
}
