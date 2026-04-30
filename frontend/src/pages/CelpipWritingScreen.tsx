import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Bot, RefreshCcw, Loader2, AlertTriangle, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import CelpipPlayerView from '@/components/celpip/CelpipPlayerView';
import CelpipResultDialog from '@/components/celpip/CelpipResultDialog';
import { celpipService } from '@/lib/celpipService';
import { AiGradingResult, CelpipWritingTaskData } from '@/types/celpip';
import AppHeader from '@/components/AppHeader';

const URL_VIDEO_CELPIP_WRITING = "https://s21.uupload.ir/files/mrghooghooli/podcast_memory_bank/writing_test/writing_1_1.mp4";
const MAX_WORDS = 200;

interface CelpipTask {
    title: string;
    contextTitle: string;
    contextText: string;
    contextNote?: string;
    questionTitle: string;
    questionText: string;
    option1?: string;
    option2?: string;
}

export default function CelpipWritingScreen() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // Static Texts for Intro
    const [staticTexts, setStaticTexts] = useState<string[]>([]);

    // Structured Data for Tasks
    const [tasks, setTasks] = useState<CelpipTask[]>([]);

    // State Machine
    const [counterQuestions, setCounterQuestions] = useState(0); // 0, 1, 2, 3
    const [isFinish, setIsFinish] = useState(false);

    // Timer
    const [timer, setTimer] = useState(0);

    // User Input
    const [userText, setUserText] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string>("");

    // Persistent State for Answers
    const [task1Answer, setTask1Answer] = useState("");
    const [task2Answer, setTask2Answer] = useState("");
    const [task2Option, setTask2Option] = useState("");

    // AI State
    const [aiResult, setAiResult] = useState<AiGradingResult | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [showRetry, setShowRetry] = useState(false);

    // Data Loading State
    const [loadingData, setLoadingData] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        loadData();
    }, [id, type]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        // Only run timer if we are in exam steps (2 or 3) and timer > 0
        if ((counterQuestions === 2 || counterQuestions === 3) && timer > 0) {
            interval = setInterval(() => setTimer(prev => Math.max(0, prev - 1)), 1000);
        }
        return () => clearInterval(interval);
    }, [timer, counterQuestions]);

    useEffect(() => {
        // Equivalent to setTextInTextViews logic for step changes
        setAiResult(null);
        setShowRetry(false);

        if (counterQuestions === 0) {
            // Instructions
             setUserText("");
             setWordCount(0);
             setTimer(0);
        } else if (counterQuestions === 1) {
            // Video
             setUserText("");
             setWordCount(0);
             setTimer(0);
        } else if (counterQuestions === 2) {
            // Task 1
            setUserText(task1Answer);
            setWordCount(countWords(task1Answer));
            startTimer(1620); // 27 minutes
        } else if (counterQuestions === 3) {
            // Task 2
            setUserText(task2Answer);
            setWordCount(countWords(task2Answer));
            setSelectedOption(task2Option);
            startTimer(1620); // 27 minutes
            setIsFinish(true); // Last step
        }

    }, [counterQuestions]);

    const startTimer = (seconds: number) => {
        setTimer(seconds);
    };

    const handleNext = () => {
        if (!isFinish) {
            if (counterQuestions < 3) {
                 setCounterQuestions(prev => prev + 1);
            }
        } else {
             // In Step 3, button says "Show Result" (in Android logic) -> Final Dialog
             // For now, we just stay or navigate back.
             // Android logic: finalResultDialog().
             // We can just verify logic works.
             toast.success("Test Completed!");
        }
    };

    const handleBack = () => {
        if (counterQuestions > 0) {
            setCounterQuestions(prev => prev - 1);
            setIsFinish(false); // Reset finish state if going back
        } else {
            navigate(-1);
        }
    };

    // Save answers when user types
    const handleTextChange = (text: string) => {
        const trimmedText = text.trim();
        const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
        const count = trimmedText.length === 0 ? 0 : words.length;
        let finalText = text;

        // Logic from Android: if (wordCount > MAX_WORDS) { limit text... }
        if (count > MAX_WORDS) {
             const limitedWords = words.slice(0, MAX_WORDS);
             finalText = limitedWords.join(" ");
             setWordCount(MAX_WORDS);
        } else {
            setWordCount(count);
        }

        setUserText(finalText);

        if (counterQuestions === 2) setTask1Answer(finalText);
        if (counterQuestions === 3) setTask2Answer(finalText);
    };

    const handleOptionChange = (opt: string) => {
        setSelectedOption(opt);
        if (counterQuestions === 3) setTask2Option(opt);
    };

    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    const loadData = async () => {
        setLoadingData(true);
        setLoadError(false);

        const staticList: string[] = [
            `Practice Test ${type} - Writing Test`, // 0
            "Writing Test Instructions", // 1
            "On the official test, if you do not finish Task 1 in 27 minutes, the screen will move to Task 2. You cannot go back to Task 1. However, in this practice test, in order to move forward in the test you must click on Next button", // 2
            "You have 53 minutes to complete this practice Writing Test. For more information on test format, click here.", // 3
            "Writing Instructional Video", // 4
        ];
        setStaticTexts(staticList);

        try {
            // Real API Call
            const rawData = await celpipService.getWritingTest(`writing test ${id}`);

            if (rawData && rawData.length > 0) {
                const testContent = rawData[0].test_content;
                let mainArray: any[] = [];

                if (typeof testContent === 'string') {
                    try {
                        // Standard parsing first (most robust for valid minified JSON)
                        mainArray = JSON.parse(testContent);
                    } catch (e) {
                         // Failed. Likely literal newlines in strings.
                         console.warn("Standard parse failed, attempting sanitized parse for control characters.");
                         try {
                            // Sanitize newlines/tabs inside double-quoted strings.
                            // Regex: Match " (non-quote OR escaped-char)* "
                            const sanitized = testContent.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
                                return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
                            });
                            mainArray = JSON.parse(sanitized);
                         } catch (e2) {
                            console.error("Sanitized parse also failed", e2);
                            // Last ditch: global replace (only if previous specific replace failed, though unlikely to help if specific failed)
                            try {
                                const globalSanitized = testContent.replace(/[\n\r]/g, "\\n").replace(/\t/g, "\\t");
                                mainArray = JSON.parse(globalSanitized);
                            } catch(e3) {
                                throw new Error("Invalid Data Format");
                            }
                         }
                    }
                } else if (Array.isArray(testContent)) {
                    mainArray = testContent;
                }

                if (mainArray.length > 0) {
                     // Index 0 for Type A, Index 1 for Type B (if available)
                     // If type is B, try to access index 1, otherwise fallback to 0.
                     const index = type === "B" ? 1 : 0;
                     const innerArray = mainArray[index] || mainArray[0];

                     if (Array.isArray(innerArray)) {
                         const parsedTasks: CelpipTask[] = innerArray.map((item: any) => ({
                             title: item.txt_title || "",
                             contextTitle: item.txt_title_2 || "",
                             contextText: item.txt_description_1 || "",
                             contextNote: item.txt_description_2 || undefined,
                             questionTitle: item.txt_title_3 || "",
                             questionText: item.txt_description_3 || "",
                             option1: item.rdb_1 || undefined,
                             option2: item.rdb_2 || undefined
                         }));

                         setTasks(parsedTasks);
                     } else {
                         throw new Error("Empty Inner Array");
                     }
                } else {
                    throw new Error("Empty Main Array");
                }
            } else {
                throw new Error("Empty API Response");
            }
        } catch (e) {
            console.error("Error loading writing test data", e);
            setLoadError(true);
            toast.error("Failed to load test data. Please check your connection.");
        } finally {
            setLoadingData(false);
        }
    };


    const handleAiCheck = async () => {
        if (wordCount < 1) {
            toast.error("Your message should be between 150 and 200 words.");
            return;
        }

        setLoadingAi(true);
        setShowRetry(false);

        const s1 = "میخوام نتیجه یک تست رایتینگ رو بررسی کنی... تست به این شکله که ما شرایط رایتینگی که قراره کاربر انجام بده را به کاربر میدیم و ازش میخواییم که متناسب با شرایطی که ما توضیح دادیم یک متن بعنوان تمرین رایتینگ بنویسه و در نهایت متن کاربر را به تو میدیم که بررسی کنی... شرایط رایتینگ :";

        let s2 = "";
        const currentTask = counterQuestions === 2 ? tasks[0] : tasks[1];

        if (currentTask) {
             s2 = `${currentTask.contextText}\n${currentTask.questionTitle}\n${currentTask.questionText}`;
             if (counterQuestions === 3 && selectedOption) {
                 s2 += `\nSelected Option: ${selectedOption}`;
             }
        }

        const s3 = "حالا جوابی که کاربر بعنوان رایتینگ نوشته: ";
        const s4 = userText;
        const s5 = "میخوام طبق شرایط و جواب (متن) کاربر نتیجه تست را تحلیل کنی و جواب رو به فرمتی که در ادامه میبینی تحویل بدی(خارج از این فرمت هیچ چیز اضافه تری ننویس و جوابت انگلیسی باشه) [{\"overal_score\": \"جواب کاربرو از لحاظ overal بررسی کن بهش یک امتیاز از 1 تا 12 بده مثلا 2\",\"coherance_score\": \"جواب کاربرو از لحاظ coherance بررسی کن بهش یک امتیاز از 1 تا 12 بده مثلا 2\",\"vocabulary_score\": \"جواب کاربرو از لحاظ vocabulary بررسی کن بهش یک امتیاز از 1 تا 12 بده مثلا 2\",\"readability_score\": \"جواب کاربرو از لحاظ readability بررسی کن بهش یک امتیاز از 1 تا 12 بده مثلا 2\",\"fullfilment_score\": \"جواب کاربرو از لحاظ fullfilment بررسی کن بهش یک امتیاز از 1 تا 12 بده مثلا 2\",\"coherance_issue\": \" در صورتی که امتیاز coherance_score کمتر از 12 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"coherance_improve\": \"در صورتی که مقدار coherance_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"coherance_advice\": \"متن کاربرو از لحاظ coherance بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"vocabulary_issue\": \"در صورتی که امتیاز vocabulary_score کمتر از 12 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"vocabulary_improve\": \"در صورتی که مقدار vocabulary_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"vocabulary_advice\": \"متن کاربرو از لحاظ vocabulary بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"readability_issue\": \" در صورتی که امتیاز readability_score کمتر از 12 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"readability_improve\": \"در صورتی که مقدار readability_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"readability_advice\": \"متن کاربرو از لحاظ readability بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"fullfilment_issue\": \" در صورتی که امتیاز fullfilment_score کمتر از 12 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"fullfilment_improve\": \"در صورتی که مقدار fullfilment_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"fullfilment_advice\": \"متن کاربرو از لحاظ fullfilmentبررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"advice\": \"متن جواب کاربرو کامل بررسی کن و یک مورد به طور خلاصه بعنوان advice اینجا بیان کن\",\"Score Improvement Tips\": \"متن جواب کاربرو کامل بررسی کن و یک مورد به طور خلاصه بعنوان Score Improvement Tips اینجا بیان کن\",\"revise_version\": \"اینجا نسخه اصلاح شده متن کاربر را بنویس\"}]";

        const fullPrompt = `${s1}\n${s2}\n${s3}\n${s4}\n${s5}`;

        try {
            const result = await celpipService.submitAiGrading(fullPrompt);
            setAiResult(result);
            setShowAiDialog(true);
        } catch (e) {
            toast.error("Failed to analyze text");
            setShowRetry(true);
        }
        setLoadingAi(false);
    };

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getScreenTitle = () => {
         if (loadingData || loadError || staticTexts.length === 0) return "";
         if (counterQuestions === 0) return staticTexts[0];
         if (counterQuestions === 1) return staticTexts[4];
         if (counterQuestions === 2) return tasks[0]?.title || "Task 1";
         return tasks[1]?.title || "Task 2";
    };

    // --- Components ---

    const SecondaryToolbar = () => (
        <div className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 mb-2 p-3 relative shadow-sm" dir="rtl">
            {/* Title Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className="text-gray-900 font-bold text-sm">
                    {getScreenTitle()}
                </h1>
            </div>

            <div className="flex justify-between items-center relative z-10 w-full">
                {/* Next Button (Start -> Right in RTL) */}
                <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-all active:scale-95 shadow-md shadow-blue-200"
                >
                    {counterQuestions === 3 ? "Show Result" : "Next"}
                </button>

                {/* Timer (End -> Left in RTL) */}
                {(counterQuestions === 2 || counterQuestions === 3) && (
                    <div className="flex flex-col items-end">
                        <span className="text-gray-900 font-bold text-xs mb-0.5">Time remaining</span>
                        <span className="text-gray-900 font-bold text-lg leading-none font-mono">
                            {timer > 0 ? formatTime(timer) : "00:00"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderNestedScrollViewContent = () => {
        // XML Structure Visibility Logic based on counterQuestions (Step)

        const isStep0 = counterQuestions === 0;
        const isStep1 = counterQuestions === 1;
        const isStep2 = counterQuestions === 2;
        const isStep3 = counterQuestions === 3;

        const currentTask = (isStep2) ? tasks[0] : (isStep3 ? tasks[1] : null);

        return (
            <div className="flex flex-col w-full pb-20" dir="ltr">
                {/* 1. PlayerView (Video) - Step 1 */}
                {isStep1 && (
                    <div className="w-full h-64 bg-black mt-3">
                         <CelpipPlayerView src={URL_VIDEO_CELPIP_WRITING} autoPlay />
                    </div>
                )}

                {/* 2. Info (Title 2) - Step 0, 2, 3 */}
                {(isStep0 || isStep2 || isStep3) && (
                    <div className="flex items-center justify-start gap-2 px-4 mt-2 mb-2">
                        <Info className="w-6 h-6 text-gray-500" />
                        <h2 className="text-gray-900 font-bold text-sm px-2">
                            {isStep0 ? (staticTexts[1] || "Writing Test Instructions") :
                             isStep2 ? (tasks[0]?.contextTitle) : (tasks[1]?.contextTitle)}
                        </h2>
                    </div>
                )}

                {/* 4. Description 1 - Step 0, 2, 3 */}
                {(isStep0 || isStep2 || isStep3) && (
                    <p className="px-4 py-2 text-gray-700 text-sm font-medium leading-relaxed whitespace-pre-line">
                        {isStep0 ? (staticTexts[2] || "") :
                         isStep2 ? (tasks[0]?.contextText) : (tasks[1]?.contextText)}
                    </p>
                )}

                {/* 5. Divider - Step 0, 2, 3 */}
                {(isStep0 || isStep2 || isStep3) && (
                    <div className="h-px bg-gray-200 mx-4 my-2" />
                )}

                {/* 6. Info Playbar Warning - Step 0 */}
                {isStep0 && (
                    <p className="px-4 py-1 text-gray-900 font-bold text-sm">
                        This playbar will not appear in the official test.
                    </p>
                )}

                {/* 7. Description 2 - Step 0, 2, 3 */}
                {(isStep0 || isStep2 || isStep3) && (
                    <div className="px-4 py-1 text-gray-700 text-sm font-medium leading-relaxed">
                        {isStep0 ? (staticTexts[3] || "") :
                         isStep2 ? (tasks[0]?.contextNote &&
                            <div className="bg-blue-50 p-2 rounded">{tasks[0]?.contextNote}</div>
                         ) :
                         (tasks[1]?.contextNote &&
                             <div className="bg-blue-50 p-2 rounded">{tasks[1]?.contextNote}</div>
                         )}
                    </div>
                )}

                {/* 8. Layout (Colored Box) - Step 2 & 3 */}
                {(isStep2 || isStep3) && currentTask && (
                    <div className="bg-blue-50/50 border-t border-b border-gray-100 mt-2 p-0 flex flex-col">

                        {/* 8.1 Info Question (Title 3) */}
                        <div className="flex items-center justify-start gap-2 px-4 py-2">
                            <Info className="w-6 h-6 text-gray-500" />
                            <h2 className="text-gray-900 font-bold text-sm px-2">
                                {currentTask.questionTitle || "Writing Task Instructions"}
                            </h2>
                        </div>

                        {/* 8.2 RadioGroup (Step 3 only) */}
                        {isStep3 && currentTask.option1 && currentTask.option2 && (
                             <div className="px-4 py-2 flex flex-col gap-2" dir="ltr">
                                {[currentTask.option1, currentTask.option2].map((opt, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="taskOptions"
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            checked={selectedOption === opt}
                                            onChange={() => handleOptionChange(opt)}
                                        />
                                        <span className={`text-sm font-bold ${selectedOption === opt ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {opt}
                                        </span>
                                    </label>
                                ))}
                             </div>
                        )}

                        {/* 8.3 Description 3 (Question Text) */}
                         <p className="px-4 py-2 text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-line">
                            {currentTask.questionText}
                        </p>

                        {/* 8.4 Words Count (Right Aligned) */}
                        <div className="flex justify-end px-4 py-1">
                             <span className={`text-sm font-bold ${wordCount > MAX_WORDS ? 'text-red-500' : 'text-rose-500'}`}>
                                Words: {wordCount}/{MAX_WORDS}
                             </span>
                        </div>

                        {/* 8.5 EditText (MultiLine) */}
                        <textarea
                            value={userText}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="mx-4 mb-4 mt-2 min-h-[200px] p-3 bg-white border border-gray-300 rounded-lg text-gray-800 font-bold text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm leading-relaxed"
                            placeholder="Type your answer here..."
                            dir="ltr"
                        />
                    </div>
                )}
            </div>
        );
    };

    const BottomBar = () => (
        <div className="bg-white px-4 py-3 border-t border-gray-100 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col gap-3" dir="rtl">
            {/* AI Result Button (Hidden initially) */}
            {aiResult && !showRetry && (
                 <button
                    onClick={() => setShowAiDialog(true)}
                    className="self-end bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md"
                >
                    View AI Result
                </button>
            )}

            {/* Retry / Check AI */}
            {(counterQuestions === 2 || counterQuestions === 3) && (
                <div className="flex justify-between items-center w-full">
                     {/* Back Button (Left/End) */}
                    <button
                        onClick={handleBack}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all shadow-md"
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                         {loadingAi && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}

                         <button
                            onClick={handleAiCheck}
                            disabled={loadingAi}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm transition-all"
                         >
                            {aiResult ? "Retry AI" : "Check with AI"}
                         </button>
                    </div>
                </div>
            )}
             {/* If not in task step, just back button */}
             {!(counterQuestions === 2 || counterQuestions === 3) && (
                 <div className="flex justify-start w-full">
                     <button
                        onClick={handleBack}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all shadow-md"
                    >
                        Back
                    </button>
                 </div>
             )}
        </div>
    );

    if (loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-3">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="text-sm font-medium">Loading Test Data...</span>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4 p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <h3 className="text-lg font-bold text-gray-800">Failed to Load Test</h3>
                <button
                    onClick={loadData}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-200"
                >
                    Retry
                </button>
                 <button onClick={() => navigate(-1)} className="text-gray-400 font-bold">Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
             {/* Top Toolbar (AppHeader - CustomToolbar in XML) */}
             {/* We pass empty actions to hide buttons as per XML */}
             <AppHeader
                title="Zaban Fly"
                className="shadow-none"
             />

             {/* Secondary Toolbar (White Box) */}
             <SecondaryToolbar />

             {/* Main Scrollable Content Container */}
             <div className="flex-1 overflow-y-auto">
                 {renderNestedScrollViewContent()}
             </div>

             {/* Bottom Bar Container */}
             <BottomBar />

             {aiResult && (
                <CelpipResultDialog
                    isOpen={showAiDialog}
                    onClose={() => setShowAiDialog(false)}
                    title="AI Analysis Result"
                    aiResult={aiResult}
                />
            )}
        </div>
    );
}
