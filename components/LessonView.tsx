import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import Footer from './Footer.tsx';
import SimpleCalculator from './widgets/SimpleCalculator.tsx';
import InlineExercise from './widgets/InlineExercise.tsx';
import StepByStep from './widgets/StepByStep.tsx';
import MathVisualWidget from './widgets/MathVisualWidget.tsx';
import MathRenderer, { renderChildrenWithMath } from './MathRenderer.tsx';
import FormulaSheetModal from './FormulaSheetModal.tsx';
import { getFormulaSheetForTopic } from '../data/formulaSheets.ts';
import { formatClockTimer, formatDurationHebrew } from '../services/progressService.ts';

import { Difficulty, DIFFICULTY_LABELS, TopicCategory, VisualDemoType } from '../types.ts';

interface LessonViewProps {
  content: string;
  keywords: Record<string, string>;
  onStartQuiz: () => void;
  onBack: () => void;
  onOpenVisualLab?: () => void;
  onRecordTimeSpent?: (deltaSeconds: number) => void;
  totalTopicTimeSeconds?: number;
  isLoading?: boolean;
  contentSource?: 'static' | 'cache';
  difficulty?: Difficulty;
  topicId?: string;
  topicName?: string;
  topicCategory?: TopicCategory;
  gradeName?: string;
}

type SpeechStatus = 'idle' | 'speaking' | 'paused';
type SpeechRate = 0.85 | 1 | 1.15;

const SPEECH_RATES: { value: SpeechRate; label: string }[] = [
  { value: 0.85, label: 'איטי' },
  { value: 1, label: 'רגיל' },
  { value: 1.15, label: 'מהיר' },
];

const LessonSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-28 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-8">
        <div className="hidden lg:block space-y-4">
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 min-h-[420px]">
          <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="mt-8 h-36 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

const extractSectionTitle = (markdownChunk: string, index: number): string => {
  const match = markdownChunk.match(/^#{1,3}\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].replace(/[*_`]/g, '').trim();
  }
  return `חלק ${index + 1}`;
};

const normalizeMathExpressionForSpeech = (expr: string): string => {
  let s = expr;
  // Convert fractions iteratively for simple nested fractions
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 חלקי $2');
  }
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, 'שורש של $1');
  s = s.replace(/\\vec\{([^{}]+)\}/g, 'וקטור $1');
  s = s.replace(/\\overline\{([^{}]+)\}/g, 'צמוד של $1');
  s = s
    .replace(/\^2|²/g, ' בריבוע ')
    .replace(/\^3|³/g, ' בשלישית ')
    .replace(/\^\{([^{}]+)\}/g, ' בחזקת $1 ')
    .replace(/\^(\d+|[a-zA-Z])/g, ' בחזקת $1 ')
    .replace(/_\{([^{}]+)\}/g, ' $1 ')
    .replace(/_(\d+|[a-zA-Z])/g, ' $1 ')
    .replace(/\\pm|±/g, ' פלוס או מינוס ')
    .replace(/\\cdot|\\times|·|×/g, ' כפול ')
    .replace(/\\div|÷/g, ' חלקי ')
    .replace(/\\neq|≠/g, ' שונה מ ')
    .replace(/\\leq|\\le|≤/g, ' קטן או שווה ל ')
    .replace(/\\geq|\\ge|≥/g, ' גדול או שווה ל ')
    .replace(/\\approx|≈/g, ' בקירוב ')
    .replace(/\\Rightarrow|⇒|←|→/g, ', מכאן ש ')
    .replace(/\\infty|∞/g, ' אינסוף ')
    .replace(/\\alpha/g, ' אלפא ')
    .replace(/\\beta/g, ' בטא ')
    .replace(/\\gamma/g, ' גאמא ')
    .replace(/\\theta/g, ' תטא ')
    .replace(/\\pi|π/g, ' פאי ')
    .replace(/\\Delta|Δ/g, ' דלתא ')
    .replace(/\\sin/g, ' סינוס ')
    .replace(/\\cos/g, ' קוסינוס ')
    .replace(/\\tan/g, ' טנגנס ')
    .replace(/\\int/g, ' אינטגרל ')
    .replace(/\\sum/g, ' סכום ')
    .replace(/\\in|∈/g, ' שייך ל ')
    .replace(/\\mathbb\{R\}/g, ' מספרים ממשיים ')
    .replace(/\\degree|°/g, ' מעלות ')
    .replace(/\\quad|\\qquad|\\,/g, ' ')
    .replace(/\\left|\\right/g, '')
    .replace(/=/g, ' שווה ')
    .replace(/\+/g, ' ועוד ')
    .replace(/([a-zA-Z0-9\u0590-\u05FF])\s*-\s*([a-zA-Z0-9\u0590-\u05FF])/g, '$1 פחות $2')
    .replace(/>/g, ' גדול מ ')
    .replace(/</g, ' קטן מ ')
    .replace(/[{}]/g, ' ');
  return s;
};

const prepareSpeechText = (markdown: string): string => {
  if (!markdown) return '';

  let text = markdown;

  // Replace custom widget code blocks with natural Hebrew speech descriptions
  text = text.replace(/```steps\n([\s\S]*?)```/g, (_, body: string) => {
    const parts = body
      .trim()
      .split('|')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return '';
    const [title, ...steps] = parts;
    const spokenSteps = steps.map((step, i) => `שלב ${i + 1}: ${step}`).join('. ');
    return `\nפתרון צעד אחר צעד: ${title}. ${spokenSteps}.\n`;
  });

  text = text.replace(/```exercise\n([\s\S]*?)```/g, (_, body: string) => {
    const [question] = body.trim().split('|');
    return question ? `\nתרגול עצמי: ${question.trim()}.\n` : '';
  });

  text = text.replace(/```(?:calculator|visual)[\s\S]*?```/g, '');
  text = text.replace(/```(?:math|latex)?\n?([\s\S]*?)```/g, (_, inner: string) => ` ${inner} `);

  // Normalize display & inline math blocks
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math: string) =>
    ` ${normalizeMathExpressionForSpeech(math)} `
  );
  text = text.replace(/\$([^$\n]+)\$/g, (_, math: string) =>
    ` ${normalizeMathExpressionForSpeech(math)} `
  );

  // Strip remaining markdown formatting
  text = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, (_, code: string) => normalizeMathExpressionForSpeech(code))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Final cleanup of any stray LaTeX tokens and excessive whitespace
  text = normalizeMathExpressionForSpeech(text)
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
};

const splitSpeechIntoChunks = (text: string, maxLength = 220): string[] => {
  if (!text) return [];
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = '';

  for (const sentence of sentences) {
    if (sentence.length > maxLength) {
      if (buffer) {
        chunks.push(buffer);
        buffer = '';
      }
      const words = sentence.split(/\s+/);
      let part = '';
      for (const word of words) {
        if ((part + ' ' + word).trim().length > maxLength) {
          if (part) chunks.push(part);
          part = word;
        } else {
          part = (part + ' ' + word).trim();
        }
      }
      if (part) chunks.push(part);
      continue;
    }

    if ((buffer + ' ' + sentence).trim().length > maxLength) {
      if (buffer) chunks.push(buffer);
      buffer = sentence;
    } else {
      buffer = (buffer + ' ' + sentence).trim();
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks;
};

const LessonView: React.FC<LessonViewProps> = ({
  content,
  keywords,
  onStartQuiz,
  onBack,
  onOpenVisualLab,
  onRecordTimeSpent,
  totalTopicTimeSeconds,
  isLoading = false,
  contentSource,
  difficulty = 'medium',
  topicId,
  topicName,
  topicCategory,
  gradeName,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<'full' | 'sections'>('full');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState<'base' | 'lg'>('base');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Active Lesson Session Timer state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [flushedInSession, setFlushedInSession] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );
  const unsavedSecondsRef = useRef(0);
  const onRecordTimeSpentRef = useRef(onRecordTimeSpent);

  useEffect(() => {
    onRecordTimeSpentRef.current = onRecordTimeSpent;
  }, [onRecordTimeSpent]);

  const flushPendingTime = useCallback(() => {
    const pending = unsavedSecondsRef.current;
    if (pending > 0) {
      unsavedSecondsRef.current = 0;
      setFlushedInSession((prev) => prev + pending);
      onRecordTimeSpentRef.current?.(pending);
    }
  }, []);

  const formulaCount = useMemo(
    () => getFormulaSheetForTopic(topicId, topicName, topicCategory).topicSheet.formulas.length,
    [topicId, topicName, topicCategory]
  );

  // Web Speech API (SpeechSynthesis) Read Aloud state
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [speechRate, setSpeechRate] = useState<SpeechRate>(1);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechSessionRef = useRef(0);

  const stopSpeech = useCallback(() => {
    speechSessionRef.current += 1;
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeechStatus('idle');
    setSpeechError(null);
  }, [isSpeechSupported]);

  // Load available browser voices (often populated asynchronously)
  useEffect(() => {
    if (!isSpeechSupported) return;
    const updateVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) {
        setVoices(list);
      }
    };
    updateVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoices);
    };
  }, [isSpeechSupported]);

  // Reset section index and stop reading whenever a new lesson loads
  useEffect(() => {
    setCurrentSectionIndex(0);
    stopSpeech();
  }, [content, stopSpeech]);

  // Stop speech when switching sections or unmounting
  useEffect(() => {
    stopSpeech();
  }, [currentSectionIndex, stopSpeech]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Reset Focus Mode when Study Mode is turned off
  useEffect(() => {
    if (!isStudyMode) {
      setIsFocusMode(false);
    }
  }, [isStudyMode]);

  // Reset timer when switching topics & flush pending seconds on unmount/topic switch
  useEffect(() => {
    setSessionSeconds(0);
    setFlushedInSession(0);
    setIsTimerPaused(false);
    unsavedSecondsRef.current = 0;

    return () => {
      flushPendingTime();
    };
  }, [topicId, flushPendingTime]);

  // Pause and flush timer when tab becomes hidden or page hides
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      if (!visible) {
        flushPendingTime();
      }
    };

    const handlePageHide = () => {
      flushPendingTime();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [flushPendingTime]);

  const isTimerRunning = !isLoading && isTabVisible && !isTimerPaused;

  useEffect(() => {
    if (!isTimerRunning) return;
    const intervalId = window.setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
      unsavedSecondsRef.current += 1;
      if (unsavedSecondsRef.current >= 15) {
        flushPendingTime();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerRunning, flushPendingTime]);

  const handleBackClick = () => {
    flushPendingTime();
    onBack();
  };

  const handleStartQuizClick = () => {
    flushPendingTime();
    onStartQuiz();
  };

  const sections = useMemo(() => {
    if (!content) return [];
    const splitContent = content
      .split(/(?=^#{1,2}\s)/gm)
      .filter((s) => s.trim().length > 0);
    if (splitContent.length === 0) return [content];
    // Merge standalone H1 intro into the first H2 section so section 1 is always substantial
    if (
      splitContent.length > 1 &&
      /^#\s+/.test(splitContent[0].trim()) &&
      !/^##\s+/m.test(splitContent[0])
    ) {
      return [`${splitContent[0].trim()}\n\n${splitContent[1].trim()}`, ...splitContent.slice(2)];
    }
    return splitContent;
  }, [content]);

  const sectionTitles = useMemo(() => {
    return sections.map((sec, idx) => extractSectionTitle(sec, idx));
  }, [sections]);

  const safeIndex = Math.min(currentSectionIndex, Math.max(0, sections.length - 1));

  const jumpToSection = useCallback(
    (idx: number) => {
      setCurrentSectionIndex(idx);
      if (displayMode === 'full') {
        const el = document.getElementById(`lesson-section-${idx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [displayMode]
  );

  const speakChunksFrom = useCallback(
    (chunks: string[], startIdx: number, rate: SpeechRate, sessionId: number) => {
      if (!isSpeechSupported || speechSessionRef.current !== sessionId) return;

      if (startIdx >= chunks.length) {
        setSpeechStatus('idle');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[startIdx]);
      const availableVoices =
        voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      const hebrewVoice = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('he') ||
          v.lang.toLowerCase().startsWith('iw')
      );

      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
        utterance.lang = hebrewVoice.lang;
      } else {
        utterance.lang = 'he-IL';
      }

      utterance.rate = rate;
      utterance.pitch = 1;

      utterance.onend = () => {
        if (speechSessionRef.current !== sessionId) return;
        speakChunksFrom(chunks, startIdx + 1, rate, sessionId);
      };

      utterance.onerror = (event) => {
        if (speechSessionRef.current !== sessionId) return;
        if (event.error === 'interrupted' || event.error === 'canceled') return;
        setSpeechStatus('idle');
        setSpeechError('הקראת הדפדפן הופסקה או שקול עברי אינו זמין במכשיר זה.');
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeechSupported, voices]
  );

  const startReadAloud = useCallback(
    (overrideRate?: SpeechRate) => {
      if (!isSpeechSupported) {
        setSpeechError('הדפדפן הנוכחי אינו תומך בהקראת טקסט.');
        return;
      }

      const activeText = displayMode === 'full' ? content : (sections[safeIndex] || '');
      const plainText = prepareSpeechText(activeText);
      if (!plainText) return;

      const chunks = splitSpeechIntoChunks(plainText);
      if (chunks.length === 0) return;

      window.speechSynthesis.cancel();
      const sessionId = speechSessionRef.current + 1;
      speechSessionRef.current = sessionId;

      setSpeechError(null);
      setSpeechStatus('speaking');
      speakChunksFrom(chunks, 0, overrideRate ?? speechRate, sessionId);
    },
    [isSpeechSupported, displayMode, content, sections, safeIndex, speechRate, speakChunksFrom]
  );

  const handleReadAloudToggle = () => {
    if (!isSpeechSupported) {
      setSpeechError('הדפדפן הנוכחי אינו תומך בהקראת טקסט.');
      return;
    }

    if (speechStatus === 'idle') {
      startReadAloud();
      return;
    }

    if (speechStatus === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechStatus('paused');
      return;
    }

    if (speechStatus === 'paused') {
      window.speechSynthesis.resume();
      setSpeechStatus('speaking');
    }
  };

  const handleSpeedChange = (newRate: SpeechRate) => {
    setSpeechRate(newRate);
    if (speechStatus !== 'idle') {
      startReadAloud(newRate);
    }
  };

  const handleNext = () => {
    if (safeIndex < sections.length - 1) {
      setCurrentSectionIndex(safeIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentSectionIndex(safeIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'שיעור במתמטיקה — MathMaster IL',
      text: content,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(content);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2500);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const progressPercentage =
    sections.length > 0 ? ((safeIndex + 1) / sections.length) * 100 : 0;

  const paragraphSizeClass = fontSize === 'lg' ? 'text-lg leading-loose' : 'text-base leading-relaxed';

  const markdownComponents: Components = {
    h1: ({ node, children, ...props }) => (
      <h1
        className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-5 leading-tight"
        {...props}
      >
        {renderChildrenWithMath(children)}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2
        className="font-display text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800"
        {...props}
      >
        {renderChildrenWithMath(children)}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3
        className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-2"
        {...props}
      >
        {renderChildrenWithMath(children)}
      </h3>
    ),
    ul: ({ node, ...props }) => (
      <ul
        className={`list-disc list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300 ${paragraphSizeClass}`}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className={`list-decimal list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300 ${paragraphSizeClass}`}
        {...props}
      />
    ),
    li: ({ node, children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {renderChildrenWithMath(children)}
      </li>
    ),
    hr: () => <hr className="my-6 border-slate-200 dark:border-slate-800" />,
    p: ({ node, children, ...props }) => {
      const dimClass = isFocusMode
        ? 'text-slate-300 dark:text-slate-700 transition-colors duration-300'
        : 'text-slate-700 dark:text-slate-300 transition-colors duration-200';

      return (
        <p className={`mb-4 ${paragraphSizeClass} ${dimClass}`} {...props}>
          {renderChildrenWithMath(children)}
        </p>
      );
    },
    table: ({ node, ...props }) => (
      <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-right border-collapse" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 font-semibold" {...props} />
    ),
    th: ({ node, children, ...props }) => (
      <th className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800" {...props}>
        {renderChildrenWithMath(children)}
      </th>
    ),
    td: ({ node, children, ...props }) => (
      <td className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300" {...props}>
        {renderChildrenWithMath(children)}
      </td>
    ),
    strong: ({ node, children, ...props }) => {
      const text = String(children);
      const description = keywords[text];

      let containerClass = 'relative inline-block ';
      let innerClass = 'font-semibold rounded px-1 transition-colors duration-200 inline-block ';

      if (isFocusMode) {
        innerClass +=
          'text-slate-950 dark:text-white bg-blue-50 dark:bg-sky-950/70 border border-blue-200 dark:border-sky-700 mx-0.5 ';
      } else if (isStudyMode && description) {
        innerClass +=
          'text-slate-900 dark:text-amber-100 bg-amber-100/80 dark:bg-amber-900/40 border-b border-amber-500 cursor-help ';
        containerClass += 'group cursor-help ';
      } else {
        innerClass += 'text-slate-900 dark:text-white font-bold ';
      }

      const termEl = (
        <strong className={innerClass} {...props}>
          {renderChildrenWithMath(children)}
        </strong>
      );

      if (isStudyMode && description) {
        return (
          <span className={containerClass}>
            {termEl}
            <span
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 text-right font-normal"
            >
              {description}
            </span>
          </span>
        );
      }

      return termEl;
    },
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const type = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');

      if (type === 'math' || type === 'latex') {
        return <MathRenderer text={value} block />;
      }

      if (type === 'calculator') {
        return <SimpleCalculator />;
      }

      if (type === 'exercise') {
        const [question, answer] = value.split('|');
        if (question && answer) {
          return <InlineExercise question={question.trim()} answer={answer.trim()} />;
        }
      }

      if (type === 'steps') {
        const parts = value.split('|').map((s) => s.trim());
        if (parts.length > 1) {
          const title = parts[0];
          const steps = parts.slice(1);
          return <StepByStep title={title} steps={steps} />;
        }
      }

      if (type === 'visual') {
        const visualKey = value.trim().toLowerCase() as VisualDemoType;
        const allowed: VisualDemoType[] = [
          'parabola',
          'linear',
          'pythagoras',
          'calculus',
          'trigonometry',
          'fractions',
        ];
        if (allowed.includes(visualKey)) {
          return <MathVisualWidget type={visualKey} compact />;
        }
      }

      if (
        (value.startsWith('$') && value.endsWith('$')) ||
        /\\(frac|sqrt|pm|cdot|sum|int|alpha|beta|gamma|theta|pi|le|ge|ne|in|times|div)\b/.test(value)
      ) {
        return <MathRenderer text={value} />;
      }

      return (
        <code
          className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-700 dark:text-sky-300 font-mono text-sm"
          dir="ltr"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ node, children, ...props }) => (
      <blockquote
        className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 my-5 text-slate-700 dark:text-slate-300"
        {...props}
      >
        {renderChildrenWithMath(children)}
      </blockquote>
    ),
  };

  if (isLoading) {
    return <LessonSkeleton />;
  }

  const sourceLabel =
    contentSource === 'cache' ? 'שמור במטמון המקומי' : 'מאגר לימוד מובנה';

  const readAloudButtonLabel =
    speechStatus === 'speaking'
      ? 'השהה הקראה'
      : speechStatus === 'paused'
      ? 'המשך הקראה'
      : 'הקראת השיעור';

  const liveTopicTotalSeconds =
    (typeof totalTopicTimeSeconds === 'number' ? totalTopicTimeSeconds : 0) +
    Math.max(0, sessionSeconds - flushedInSession);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-28 lg:pb-12 animate-fadeIn">
      {/* Top Action Row (Mobile & Desktop Back + Quick Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>חזרה לרשימת הנושאים</span>
        </button>

        {/* Mobile Quick Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {isSpeechSupported && (
            <button
              type="button"
              onClick={handleReadAloudToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                speechStatus !== 'idle'
                  ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
              aria-label={readAloudButtonLabel}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>{speechStatus === 'speaking' ? 'השהה' : speechStatus === 'paused' ? 'המשך' : 'הקראה'}</span>
            </button>
          )}
          {speechStatus !== 'idle' && (
            <button
              type="button"
              onClick={stopSpeech}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800"
              aria-label="עצור הקראה"
            >
              עצור
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsStudyMode(!isStudyMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isStudyMode
                ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 border-transparent'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            מונחים
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            title="העתקה או שיתוף"
            aria-label="שיתוף שיעור"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Two-Zone Desktop Academic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 lg:gap-8 items-start">
        {/* Right Sidebar (RTL Start Column): TOC, Study Controls & Quiz CTA */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
          {/* Section Navigator */}
          {sections.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>תוכן השיעור</span>
                <span className="font-mono tabular-nums">
                  {displayMode === 'full' ? `${sections.length} חלקים` : `${safeIndex + 1}/${sections.length}`}
                </span>
              </div>
              <nav className="space-y-1" aria-label="סעיפי השיעור">
                {sectionTitles.map((title, idx) => {
                  const active = idx === safeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => jumpToSection(idx)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                        active
                          ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="font-mono tabular-nums text-[11px] opacity-70">
                        0{idx + 1}
                      </span>
                      <span className="truncate">
                        <MathRenderer text={title} />
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Live Session Timer Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>זמן למידה בשיעור</span>
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isTimerPaused
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isTimerPaused ? 'מושהה' : 'פעיל'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                dir="ltr"
                className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
                aria-label={`משך השיעור הנוכחי ${formatClockTimer(sessionSeconds)}`}
              >
                {formatClockTimer(sessionSeconds)}
              </span>

              <button
                type="button"
                onClick={() => setIsTimerPaused((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                aria-label={isTimerPaused ? 'המשך מדידת זמן' : 'השהה מדידת זמן'}
              >
                {isTimerPaused ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>המשך</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                    </svg>
                    <span>השהה</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>זמן מצטבר בנושא:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                {formatDurationHebrew(liveTopicTotalSeconds)}
              </span>
            </div>
          </div>

          {/* Audio Read Aloud Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>הקראת השיעור בעברית</span>
              {speechStatus === 'speaking' && (
                <span className="text-[11px] font-semibold text-blue-600 dark:text-sky-400">
                  מקריא...
                </span>
              )}
              {speechStatus === 'paused' && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  מושהה
                </span>
              )}
            </div>

            {isSpeechSupported ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReadAloudToggle}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                      speechStatus !== 'idle'
                        ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200'
                    }`}
                  >
                    {speechStatus === 'speaking' ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                    <span>{readAloudButtonLabel}</span>
                  </button>

                  {speechStatus !== 'idle' && (
                    <button
                      type="button"
                      onClick={stopSpeech}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="עצור הקראה"
                      aria-label="עצור הקראה"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="6" y="6" width="12" height="12" rx="1.5" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    קצב דיבור:
                  </span>
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    {SPEECH_RATES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleSpeedChange(r.value)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          speechRate === r.value
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                הקראת טקסט אינה נתמכת בדפדפן זה.
              </p>
            )}
          </div>

          {/* Study Mode Tools */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              כלי למידה וקריאה
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                גודל גופן
              </span>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFontSize('base')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    fontSize === 'base'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  א
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    fontSize === 'lg'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  א+
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                הדגשת מונחים
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isStudyMode}
                onClick={() => setIsStudyMode(!isStudyMode)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isStudyMode ? 'bg-blue-600 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    isStudyMode ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isStudyMode && (
              <div className="flex items-center justify-between gap-2 pt-1 animate-fadeIn">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  מצב מיקוד במושגים
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFocusMode}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isFocusMode ? 'bg-blue-600 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                      isFocusMode ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-full mt-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copiedNotice ? 'התוכן הועתק ללוח' : 'העתקת תוכן השיעור'}</span>
            </button>
          </div>

          {/* Primary Quiz CTA */}
          <button
            type="button"
            onClick={handleStartQuizClick}
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>מעבר לתרגול החומר</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {onOpenVisualLab && (
            <button
              type="button"
              onClick={onOpenVisualLab}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400 text-xs font-semibold transition-colors"
            >
              מעבדת הדגמות ויזואליות
            </button>
          )}
        </aside>

        {/* Main Lesson Stage */}
        <div className="min-w-0">
          <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Top Progress Hairline */}
            {sections.length > 1 && displayMode === 'sections' && (
              <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <div
                  className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* Unboxed Metadata Bar + Display Mode Switcher + Inline Timer & Read Aloud Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{sourceLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>רמה: {DIFFICULTY_LABELS[difficulty]}</span>
                  {sections.length > 1 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {displayMode === 'full'
                          ? `${sections.length} חלקים בשיעור`
                          : `חלק ${safeIndex + 1} מתוך ${sections.length}`}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setIsTimerPaused((prev) => !prev)}
                    title={isTimerPaused ? 'המשך טיימר שיעור' : 'השהה טיימר שיעור'}
                    className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                      isTimerPaused
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span dir="ltr" className="font-mono tabular-nums font-semibold">
                      {formatClockTimer(sessionSeconds)}
                    </span>
                    {isTimerPaused && <span className="text-[11px]">(מושהה)</span>}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {sections.length > 1 && (
                    <div
                      className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      role="group"
                      aria-label="אופן תצוגת השיעור"
                    >
                      <button
                        type="button"
                        onClick={() => setDisplayMode('full')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          displayMode === 'full'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        שיעור מלא
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayMode('sections')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          displayMode === 'sections'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        חלק אחר חלק
                      </button>
                    </div>
                  )}

                  {isSpeechSupported && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleReadAloudToggle}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          speechStatus !== 'idle'
                            ? 'bg-blue-50 dark:bg-sky-950/60 border-blue-200 dark:border-sky-800 text-blue-700 dark:text-sky-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-sky-500'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span>{readAloudButtonLabel}</span>
                      </button>
                      {speechStatus !== 'idle' && (
                        <button
                          type="button"
                          onClick={stopSpeech}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          עצור
                        </button>
                      )}
                    </div>
                  )}

                  {sections.length > 1 && displayMode === 'sections' && (
                    <span className="font-mono tabular-nums text-blue-600 dark:text-sky-400 font-semibold">
                      {Math.round(progressPercentage)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile / Tablet Section Jump Bar */}
              {sections.length > 1 && (
                <div className="lg:hidden mb-6 -mx-1 px-1 overflow-x-auto pb-1">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {sectionTitles.map((title, idx) => {
                      const active = idx === safeIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => jumpToSection(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            active
                              ? 'bg-blue-50 dark:bg-sky-950/50 border-blue-200 dark:border-sky-800 text-blue-700 dark:text-sky-300 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-mono tabular-nums text-[11px] opacity-70">
                            0{idx + 1}
                          </span>
                          <span className="max-w-[160px] truncate">
                            <MathRenderer text={title} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {speechError && (
                <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                  <span>{speechError}</span>
                  <button
                    type="button"
                    onClick={() => setSpeechError(null)}
                    className="underline shrink-0"
                  >
                    סגירה
                  </button>
                </div>
              )}

              {copiedNotice && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-emerald-700 dark:text-emerald-400 lg:hidden">
                  תוכן השיעור הועתק ללוח
                </div>
              )}

              {displayMode === 'full' ? (
                <div className="max-w-3xl text-right space-y-10" dir="rtl">
                  {sections.map((sec, idx) => (
                    <section
                      key={idx}
                      id={`lesson-section-${idx}`}
                      className="scroll-mt-24"
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {sec}
                      </ReactMarkdown>
                    </section>
                  ))}

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      סיימתם לעבור על השיעור והתרגילים? המשיכו למבחן התרגול המסכם בנושא.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartQuizClick}
                      className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors inline-flex items-center gap-2"
                    >
                      <span>מעבר לתרגול המסכם</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="max-w-3xl text-right" dir="rtl">
                    <ReactMarkdown components={markdownComponents}>
                      {sections[safeIndex]}
                    </ReactMarkdown>
                  </div>

                  {/* Desktop Section Footer Navigation */}
                  {sections.length > 1 && (
                    <div className="hidden lg:flex items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={safeIndex === 0}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors inline-flex items-center gap-2 ${
                          safeIndex === 0
                            ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>החלק הקודם</span>
                      </button>

                      {safeIndex < sections.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
                        >
                          <span>המשך לחלק הבא</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartQuizClick}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors inline-flex items-center gap-2"
                        >
                          <span>סיימתי — התחלת תרגול</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </article>

          <Footer />
        </div>
      </div>

      {/* Compact Mobile Bottom Bar (<= 15% mobile viewport height) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {sections.length > 1 && displayMode === 'sections' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                aria-label="הקודם"
                className={`h-10 px-3 rounded-lg border text-xs font-medium ${
                  safeIndex === 0
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                הקודם
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={safeIndex === sections.length - 1}
                aria-label="הבא"
                className={`h-10 px-3 rounded-lg border text-xs font-medium ${
                  safeIndex === sections.length - 1
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                הבא
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartQuizClick}
            className="flex-1 h-10 bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>תרגול החומר</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Formula Sheet Action Button */}
      <button
        type="button"
        onClick={() => setIsFormulaModalOpen(true)}
        className="fixed bottom-20 lg:bottom-6 left-4 md:left-6 z-30 h-11 px-4 rounded-full bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 shadow-lg border border-slate-700/60 dark:border-sky-300/40 transition-all inline-flex items-center gap-2 text-xs md:text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label="פתיחת דף נוסחאות לנושא"
      >
        <span className="font-mono font-bold text-base leading-none" aria-hidden="true">
          ƒ
        </span>
        <span>דף נוסחאות</span>
        <span className="font-mono tabular-nums text-[11px] opacity-80">
          ({formulaCount})
        </span>
      </button>

      <FormulaSheetModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        topicId={topicId}
        topicName={topicName}
        topicCategory={topicCategory}
        gradeName={gradeName}
      />
    </div>
  );
};

export default LessonView;