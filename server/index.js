// Simple Express server for ChatGPT API integration
// To be run separately from the Vite dev server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({
        message: 'Server is running!',
        apiKey: process.env.OPENAI_API_KEY ? 'API Key loaded ✅' : 'API Key missing ❌',
        timestamp: new Date().toISOString()
    });
});

// Report generation endpoint
app.post('/api/generate-report', async (req, res) => {
    try {
        const { analysisData, studentName, formSelections, studentInfo } = req.body;

        if (!analysisData || !studentName || !formSelections) {
            return res.status(400).json({
                error: 'Missing required fields: analysisData, studentName, or formSelections'
            });
        }

        // 🔍 הדפס מה נשלח
        console.log('📤 ===== DATA SENT TO OPENAI =====');
        console.log('Student Name:', studentName);
        console.log('Analysis Data structure:', {
            hasOverallSummary: !!analysisData.overallSummary,
            hasDomainAnalysis: !!analysisData.domainAnalysis,
            domainAnalysisLength: analysisData.domainAnalysis?.length
        });
        console.log('Form Selections Keys:', Object.keys(formSelections));
        console.log('=====================================');

        // ✅ בדיקה: האם domainAnalysis קיים?
        if (!analysisData.domainAnalysis || !Array.isArray(analysisData.domainAnalysis)) {
            console.error('❌ analysisData.domainAnalysis is missing or not an array!');
            console.error('Received analysisData keys:', Object.keys(analysisData));
            return res.status(400).json({
                error: 'Invalid analysisData structure - missing domainAnalysis array'
            });
        }

        // ✅ בניית מבנה עשיר עם ההיגדים המלאים
        const enrichedDomains = analysisData.domainAnalysis.map(domain => {
            const domainData = formSelections[domain.domainId] || {};

            let allStrengths = [];
            let allWeaknesses = [];

            // אסוף מכל תת-תחום
            Object.entries(domainData).forEach(([subDomainId, subDomainData]) => {
                if (subDomainData && subDomainData.strengths) {
                    allStrengths = [...allStrengths, ...subDomainData.strengths];
                }
                if (subDomainData && subDomainData.weaknesses) {
                    allWeaknesses = [...allWeaknesses, ...subDomainData.weaknesses];
                }
            });

            return {
                domainName: domain.domainName,
                domainId: domain.domainId,
                strengthsCount: allStrengths.length,
                weaknessesCount: allWeaknesses.length,
                strengthStatements: allStrengths,
                weaknessStatements: allWeaknesses,
                strongestSubDomains: domain.strongestSubDomains,
                weakestSubDomains: domain.weakestSubDomains,
                semanticAnalysis: domain.semanticAnalysis
            };
        });

        console.log('📊 Enriched domains prepared with', enrichedDomains.length, 'domains');

        const systemMessage = `אתה מחנך ותיק עם 21 שנות ניסיון בחינוך מיוחד, מתמחה בעבודה עם תלמידות ותלמידים  אוטיסטיים  לא-וורבליות בגילאי 13-16.

אתה כותב דוח תל"א (תוכנית לימודים אישית) עבור ישיבת צוות רב-מקצועי הכוללת הורים, צוות חינוכי, ופרא-רפואי.

עקרונות הכתיבה שלך:
1. **אנושי ותומך** - אתה רואה את התלמיד.ה כאדם שלם עם פוטנציאל, לא כאוסף של קשיים
2. **לא שיפוטי** - השתמש במילים כמו "מתקשה", "זקוקה לתמיכה מוגברת", "ניכרת מגמה" אל תשתמש ב - "כושלת", "לא מסוגלת", "ליקוי"
3. **מקצועי אך מובן** - השתמש במינוח מקצועי (מוקדי כוח, מוקדים לחיזוק, תוכנית לימודים אישית, יעדים, מטרות) אך הסבר בבהירות
4. **קונקרטי** - תן דוגמאות ספציפיות מהנתונים, תמיד השתמש בשם התלמידה (לא "התלמידה")
5. **מאוזן עם דגש על חיזוק** - תאר גם מוקדי כוח וגם מוקדים לחיזוק, אך הרחב מעט יותר במוקדים לחיזוק

סגנון הכתיבה:
- פסקאות של 5-7 משפטים
- ללא נקודות רשימה - טקסט רצוף
- כותרות ברורות (H1, H2) לכל תחום
- אין להזכיר מספרים גולמיים - רק פרשנות איכותנית
- **כתוב בלשון נקבה** - התלמידות שלנו: תהילה, אנג'י, קסניה`;

        const userMessage = `
## נתוני הערכה עבור ${studentName}

### פרופיל כללי:
- **שם**: ${studentName}
- **תאריך הערכה**: ${new Date().toLocaleDateString('he-IL')}

### היגדים מפורטים שנבחרו לכל תחום:

${enrichedDomains.map(domain => {
            const hasStrengths = domain.strengthStatements.length > 0;
            const hasWeaknesses = domain.weaknessStatements.length > 0;

            return `
**${domain.domainName}:**

✅ **מוקדי כוח:**
${hasStrengths ? domain.strengthStatements.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'לא זוהו מוקדי כוח בתחום זה'}

⚠️ **מוקדים לחיזוק:**
${hasWeaknesses ? domain.weaknessStatements.map((w, i) => `${i + 1}. ${w}`).join('\n') : 'לא זוהו מוקדים לחיזוק בתחום זה'}

🔬 **ניתוח סמנטי:**
- רמת קריטיות: ${domain.semanticAnalysis?.criticalityScore > 70 ? 'גבוהה' : domain.semanticAnalysis?.criticalityScore > 40 ? 'בינונית' : 'נמוכה'}
- תבנית דומיננטית: ${domain.semanticAnalysis?.dominantPattern || 'לא זוהתה'}
${domain.semanticAnalysis?.keywordMatches?.length > 0 ? `- מילות מפתח זוהו: ${domain.semanticAnalysis.keywordMatches.slice(0, 5).map(m => m.keyword).join(', ')}` : ''}

📈 **תתי-תחומים מובילים:**
- בכוח: ${domain.strongestSubDomains?.map(sd => sd.name).join(', ') || 'לא זוהו'}
- לחיזוק: ${domain.weakestSubDomains?.map(sd => sd.name).join(', ') || 'לא זוהו'}
`;
        }).join('\n---\n')}

---

### סיכום כללי:
- **תמונה כללית**: זוהו ${analysisData.overallSummary.totalStrengths > analysisData.overallSummary.totalWeaknesses ? 'מוקדי כוח רבים יותר' : 'מוקדים רבים לחיזוק'} אצל ${studentName}
- **תחומים מובילים במוקדי כוח**: ${analysisData.overallSummary.topThreeStrengthDomains.join(', ')}
- **תחומים לחיזוק מרבי**: ${analysisData.overallSummary.topThreeWeaknessDomains.join(', ')}
- **תבנית דומיננטית כללית**: ${analysisData.overallSummary.globalSemanticAnalysis.dominantPattern}

---

## דרישות לדוח:

כתוב דוח תל"א (תוכנית לימודים אישית) מקצועי ומפורט עבור **${studentName}**.

**חשוב מאוד:** השתמש בפורמט Markdown המסודר הבא:

# דוח תל״א - [שם התלמיד/ה]

---

## חלק א: ניתוח לפי תחומי התפתחות

### 1. תקשורת

**מוקדי כוח:**
[כתוב פסקה של 3-4 משפטים המתבססת על ההיגדים שפורטו למעלה]

**מוקדים לחיזוק:**
[כתוב פסקה של 4-5 משפטים המתבססת על ההיגדים שפורטו למעלה, הרחב יותר]

---

### 2. ויסות רגשי

**מוקדי כוח:**
[...]

**מוקדים לחיזוק:**
[...]

---

[המשך כך לכל 7 התחומים]

---

## חלק ב: ניתוח מעמיק

### שלושת התחומים הדורשים חיזוק מרבי

**1. [שם התחום/תת-תחום]**

[פסקה של 4-5 משפטים המתארת:]
- אופי הקושי (בהתבסס על ההיגדים)
- השפעה על התפקוד היומיומי
- כיוון התערבות מוצע

**2. [שם התחום השני]**

[...]

**3. [שם התחום השלישי]**

[...]

---

### שלושת התחומים החזקים ביותר

**1. [שם התחום/תת-תחום]**

[פסקה של 3-4 משפטים המתארת את החוזקה וכיצד למנף אותה]

**2. [שם התחום השני]**

[...]

**3. [שם התחום השלישי]**

[...]

---

### מסקנות כלליות – פרופיל עומק

[פסקה מקיפה של 7-10 משפטים המסכמת את הפרופיל הייחודי]

---

## חלק ג: תוכנית עבודה לשנה הקרובה

### תחום עבודה 1: [שם התחום]

**מטרה שנתית:**
[משפט ברור ומדיד]

**אסטרטגיות עיקריות:**
[2-3 משפטים המפרטים כיצד נגיע למטרה]

**משאבים נדרשים:**
[רשימה קצרה: שעות, ציוד, וכו']

**אחראי/ת:**
[תפקיד מקצועי]

**מועדי הערכה:**
[רבעון/חצי שנה]

---

### תחום עבודה 2: [שם התחום]

[אותו פורמט]

---

### תחום עבודה 3: [שם התחום]

[אותו פורמט]

---

## חלק ד: סיכום

[פסקה מעצימה של 4-5 משפטים המדגישה פוטנציאל, שיתוף פעולה ואופטימיות]

---

**תאריך הכנת הדוח:** [תאריך]
**נערך על ידי:** צוות מקצועי TALLA

---

### הנחיות לכתיבה:

לכל תחום בחלק א', כתוב פסקה רצופה המתבססת על ההיגדים שפורטו למעלה:
1. **התבסס על ההיגדים הספציפיים** - אל תמציא, השתמש במה שניתן
2. **אל תזכיר מספרים** - רק תיאור איכותני
3. **השתמש בשם ${studentName}** - לא "התלמיד/ה"

4. **כתוב בלשון נקבה** אם ${studentName} היא תהילה, אנג'י או קסניה
5. **פסקאות רצופות** - ללא bullet points (חוץ מחלק ג')

---

**שבעת התחומים לחלק א:**
1. תקשורת
2. ויסות רגשי
3. תפקוד יומיומי ועצמאות
4. תנועה ומרחב
5. למידה וקוגניציה
6. תפקוד חברתי
7. עיבוד חושי

---

## דגשים חשובים:
- **השתמש תמיד בשם "${studentName}"** - לעולם אל תכתוב "התלמיד.ה"
- **כתוב בלשון נקבה כאשר מדובר בקסניה, תהילה או אנג'י** - מפגינה, מתקשה, זקוקה, נדרשת (לא מפגין/ה)
- **אל תזכיר מספרים** - במקום "15 חולשות בתחום X" כתוב "ניכרים קשיים משמעותיים בתחום X"
- **הימנע ממילים שיפוטיות** - אסור: "כושלת", "נכשלת", "לא מסוגלת", "ליקוי", "חמור"
- **השתמש במילים תומכות** - מומלץ: "מאתגר", "זקוקה לתמיכה מוגברת", "דורשת ליווי", "בהתפתחות", "ניכרת מגמה"
- **כתוב בפסקאות רצופות** - ללא נקודות רשימה (חוץ מחלק ג')
- **שמור על טון מקצועי אנושי חם** - כמו מחנך מנוסה ואוהב שמכיר את התלמיד.ה היטב

כתוב את הדוח כעת.
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage }
            ],
            max_tokens: 4000,
            temperature: 0.7,
        });

        const report = completion.choices[0]?.message?.content;

        if (!report) {
            return res.status(500).json({
                error: 'No content received from OpenAI'
            });
        }

        res.json({ report });

    } catch (error) {
        console.error('❌ Error generating report:', error);

        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                error: 'OpenAI API quota exceeded'
            });
        }

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                error: 'Invalid OpenAI API key'
            });
        }

        res.status(500).json({
            error: 'Report generation failed: ' + error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'TALLA Reports API Server is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;