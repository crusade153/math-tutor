import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 💡 해결: JWTPayload 타입에 정의된 정확한 속성명인 userId만 사용합니다.
    const userId = user.userId;
    
    const inquiries = user.role === 'admin' 
      ? await sql`SELECT pi.*, u.name as parent_name FROM parent_inquiries pi JOIN users u ON pi.parent_id = u.id ORDER BY pi.created_at DESC`
      : await sql`SELECT * FROM parent_inquiries WHERE parent_id = ${userId} ORDER BY created_at DESC`;
    
    return NextResponse.json(inquiries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'parent') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, content } = await req.json();
    
    // 💡 해결: 동일하게 userId만 가져옵니다.
    const userId = user.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID missing in token' }, { status: 400 });
    }

    await sql`
      INSERT INTO parent_inquiries (parent_id, title, content)
      VALUES (${userId}, ${title}, ${content})
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, replyContent } = await req.json();
    
    await sql`
      UPDATE parent_inquiries 
      SET reply_content = ${replyContent}, 
          status = 'answered', 
          answered_at = NOW() 
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH 문의내역 DB 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}