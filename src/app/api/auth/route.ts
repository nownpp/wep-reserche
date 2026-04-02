import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gasUrl = process.env.GAS_URL;
    
    if (!gasUrl) {
      return NextResponse.json({ error: 'النظام قيد التحديث، رابط قاعدة البيانات مفقود.' }, { status: 500 });
    }

    const { action, username, password } = body;
    if (!username) {
        return NextResponse.json({ error: 'اسم المستخدم مطلوب' }, { status: 400 });
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, username, password }),
      cache: 'no-store'
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('GAS returned non-JSON response:', errorText);
        return NextResponse.json({ error: 'خادم البيانات أرسل استجابة غير صالحة. يرجى التأكد من نشر السكربت كـ JSON.' }, { status: 502 });
    }

    const data = await response.json();
    
    if (data.error) {
        return NextResponse.json({ error: data.error }, { status: 401 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: `فشل الاتصال بخادم الحسابات: ${error.message || 'خطأ غير معروف'}` }, { status: 500 });
  }
}
