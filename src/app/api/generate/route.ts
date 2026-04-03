import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { studentName, department, researchTitle, stage, outlineContext, username } = await req.json();

    if (!studentName || !department || !researchTitle || !stage) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة (اسم الطالب، القسم، عنوان البحث، المرحلة).' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'مفتاح Gemini API مفقود من ملف المتغيرات.' },
        { status: 500 }
      );
    }

    let updatedCredits = null;
    // ---- نظام الخصم الإلزامي (Strict Credit Deduction) ----
    if (stage === 'outline' && username) {
      const gasUrl = process.env.GAS_URL;
      if (!gasUrl) {
        return NextResponse.json({ error: 'خطأ في تكوين الخادم: رابط قاعدة البيانات مفقود.' }, { status: 500 });
      }

      try {
        const deductRes = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "deduct", username })
        });
        
        if (!deductRes.ok) {
          throw new Error('فشل الاتصال بقاعدة بيانات جوجل (خطأ شبكة)');
        }

        const contentType = deductRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await deductRes.text();
          console.error('GAS ERROR CONTENT:', text);
          throw new Error('سكريبت جوجل يواجه مشكلة في تنفيذ عملية الخصم. تأكد من وجود "action: deduct" في الكود الخاص بك.');
        }

        const dData = await deductRes.json();
        if (dData.error) {
          return NextResponse.json({ error: dData.error }, { status: 403 });
        }

        updatedCredits = dData.newCredits !== undefined ? dData.newCredits : dData.credits;
        console.log(`Deduction successful for ${username}. Remaining: ${updatedCredits}`);
      } catch (e: any) {
        console.error('Critical Deduction Error:', e);
        return NextResponse.json({ error: e.message || 'فشل التحقق من الرصيد' }, { status: 500 });
      }
    }

    let systemPrompt = '';
    let userMessage = '';
    
    const noMarkdown = "\nهام جداً: ممنوع تماماً استخدام رموز الهاشتاج (#) أو النجوم (**) أو أي رموز ماركداون في التنسيق. اكتب العناوين كنص عادي فقط.";

    if (stage === 'outline') {
      systemPrompt = `أنت مساعد ذكاء اصطناعي خبير ومؤلف أبحاث أكاديمية.
أطلب منك الآن كتابة "خطة البحث والعناوين الرئيسية والفرعية المقترحة" فقط.
لا تقم بكتابة أي محتوى كامل للبحث، بل اكتفِ بكتابة خطة الهيكل التنظيمي التي سيسير عليها البحث.
قسّم الخطة إلى: المقدمة، الأبواب أو الفصول (1 و 2 بتفريعاتهم)، ثم الخاتمة وقائمة المراجع.
اكتب العناوين كنص عادي صريح (مثلاً: الفصل الأول: [العنوان]) بدون أي رموز (#). 
لا تضف أي نص تمهيدي أو ملاحظات جانبية، بادر فوراً بسرد الفهرس والعناوين.
ملاحظة: البحث بالكامل سيكون بحجم يتراوح بين 10 إلى 20 صفحة، لذا الرجاء توفير عناوين رئيسية وفرعية كافية وكثيرة تغطي هذا الحجم الواسع.` + noMarkdown;
      userMessage = `موضوع البحث: ${researchTitle}\nإعداد الطالب: ${studentName}\nالقسم: ${department}\n\nيرجى بناء خطة عناوين وهيكل شامل وأكاديمي دقيق لهذا البحث.`;
    } else if (stage === 'intro') {
      systemPrompt = `أنت مساعد ذكاء اصطناعي خبير ومؤلف أبحاث أكاديمية.
أطلب منك الآن كتابة الجزء الأول فقط من البحث: "المقدمة والتمهيد".
يجب أن تتكون المقدمة من عدة فقرات تشرح أهمية الموضوع وخلفيته بدقة وبشكل مٌسهب ومطول، دون الدخول في تفاصيل الفصول المعمقة.` + noMarkdown;
      userMessage = `موضوع البحث: ${researchTitle}\n\nخطة البحث المعتمدة:\n${outlineContext}\n\nالرجاء كتابة المقدمة والتمهيد بشكل مفصل جداً ومطول بناءً على الخطة.`;
    } else if (stage === 'body1') {
      systemPrompt = `أنت مساعد ذكاء اصطناعي خبير ومؤلف أبحاث أكاديمية.
أطلب منك الآن كتابة الجزء الثاني من البحث (الفصل الأول من صلب الموضوع).
يجب أن يركز على المبادئ الأساسية وتغطيته للإطار النظري، مقسماً لعناوين فرعية بشكل سردي مطول وعميق جداً دون اختصار.
هام جداً: يجب إضافة جداول أو صور أو أشكال توضيحية (بشكل متخيل كنص Markdown)، ولابد من وضع رقم وعنوان لكل صورة أو جدول أو شكل يتم إضافته.
لا تكتب مقدمة ولا خاتمة، فقط اكتب محتويات الفصل الأول بالكامل.` + noMarkdown;
      userMessage = `موضوع البحث: ${researchTitle}\n\nخطة البحث المعتمدة:\n${outlineContext}\n\nأكمل كتابة البحث: اكتب الفصل الأول من صلب الموضوع استناداً للخطة المعطاة، وكن مفصلاً.`;
    } else if (stage === 'body2') {
      systemPrompt = `أنت مساعد ذكاء اصطناعي خبير ومؤلف أبحاث أكاديمية.
أطلب منك الآن كتابة الجزء الثالث من البحث (الفصل الثاني من صلب الموضوع).
ركز فيه على التحليل، التطبيقات، ودراسات الحالة أو الإيجابيات والسلبيات، مقسماً لعناوين فرعية بشكل سردي مطول وعميق جداً دون اختصار.
هام جداً: يجب إضافة جداول أو صور أو أشكال توضيحية (بشكل متخيل كنص Markdown)، ولابد من وضع رقم وعنوان لكل صورة أو جدول أو شكل يتم إضافته.
اكتب استكمالاً للبحث السابق لزيادة المعرفة، دون إضافة أي تنويهات خارجية.` + noMarkdown;
      userMessage = `موضوع البحث: ${researchTitle}\n\nخطة البحث المعتمدة:\n${outlineContext}\n\nأكمل كتابة البحث: اكتب الفصل الثاني من صلب الموضوع استناداً للخطة المعطاة، وبشكل مفصل جداً.`;
    } else if (stage === 'conclusion') {
      systemPrompt = `أنت مساعد ذكاء اصطناعي خبير ومؤلف أبحاث أكاديمية.
أطلب منك الآن كتابة الجزء الأخير من البحث: "الخاتمة وقائمة المراجع".
لخص النتائج بحترافية، ثم ضع قائمة بـ 5-7 مراجع منطقية مقترحة أكاديمياً (كتب/أبحاث).
هام جداً: في الصفحة الأخيرة والمخصصة للمصادر، يجب كتابة المصادر بالصيغة الأكاديمية التالية: (اسم المؤلف، وسنة النشر، وعنوان المقال أو الكتاب، والصفحة أو الصفحات التي تم الاقتباس منها).` + noMarkdown;
      userMessage = `موضوع البحث: ${researchTitle}\n\nخطة البحث المعتمدة:\n${outlineContext}\n\nاكتب الخاتمة الشاملة ثم مصادر ومراجع البحث في النهاية بشكل سليم.`;
    } else {
      return NextResponse.json({ error: 'مرحلة غير معروفة.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const streamingResponse = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        // نرسل الرصيد المحدث كأول قطعة في الستريم (بشكل مخفي أو محدد)
        // للحفاظ على البساطة، سنرسله كـ Header إذا كان ذلك ممكناً، 
        // أو نكتفي بتحديثه في الطلب الأول (Outline).
        
        for await (const chunk of streamingResponse.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // إضافة New-Credits كـ Header مخصص لكي يتم قراءته في الطلب الأول
    const headers = new Headers();
    if (updatedCredits !== null) {
      headers.set('X-New-Credits', updatedCredits.toString());
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...Object.fromEntries(headers.entries())
      },
    });

  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json(
      { error: `حدث خطأ غير متوقع في معالجة البحث. يرجى التأكد من استقرار الإنترنت.` },
      { status: 500 }
    );
  }
}
