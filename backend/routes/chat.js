const express = require('express');
const router = express.Router();

// POST /api/chat - AI Chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // TODO: Integrate with Claude API or other LLM
        // For now, return a mock response to demonstrate the flow
        // In production, replace this with actual API call:
        /*
        const response = await fetch(process.env.AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1024,
                messages: [{ role: 'user', content: message }]
            })
        });
        const data = await response.json();
        */

        // Mock response for demonstration
        const mockResponses = [
            'شكراً على سؤالك! أنا هنا للمساعدة في أي استفسار يخص المنهج الدراسي أو المنصة.',
            'يمكنك تصفح المواد الدراسية من خلال صفحة "الصفوف" ثم اختيار الصف والمادة والشعبة المناسبة.',
            'إذا كنت معلمة، يمكنك تسجيل الدخول لرفع ملفاتك التعليمية وإدارتها.',
            'المنصة تدعم رفع ملفات PDF وWord وExcel وPowerPoint والصور.',
            'لأي مشكلة تقنية، يرجى التواصل مع إدارة المدرسة.'
        ];

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

        res.json({
            success: true,
            response: randomResponse,
            note: 'This is a mock response. To enable real AI, configure AI_API_KEY and AI_API_URL in .env file.'
        });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
