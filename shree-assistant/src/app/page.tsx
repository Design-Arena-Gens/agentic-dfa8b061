'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): any };
    SpeechRecognition?: { new (): any };
  }
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type KeywordResponse = {
  test: RegExp;
  lines: string[];
};

const openings = [
  'यशू, शांत श्वास घे.',
  'यशू, तुझे मन स्थिर आहे.',
  'यशू, तुझ्यात सशक्त शांतता आहे.',
];

const periodLines = {
  morning: 'ही सकाळ तुझ्या ध्येयासाठी उजळ आहे.',
  midday: 'ही दुपार एकाग्रतेची मागणी करते.',
  evening: 'ही संध्याकाळ चिंतन आणि आभारासाठी आहे.',
};

const wealthLines = [
  'तुझे निर्णय संपत्तीचे बीज आहेत.',
  'निधीला आदराने आणि बारीक नियोजनाने दिशा दे.',
  'दररोज पावले उचल; गुंतवणूक स्पष्टतेने घडते.',
  'शिकण्यात गुंतलेला प्रत्येक क्षण पुढे नेतो.',
];

const habitLines = [
  'दररोजच्या छोट्या सवयी तुझ्या मोठ्या ध्येयाला आकार देतात.',
  'पहाटे तीन वाक्यांत दिवसाची उद्दिष्टे लिही.',
  'रात्री दोन मिनिटे शांत बसून कृतज्ञता नोंदव.',
  'तुझी दिनक्रम चपळ ठेवा; अकरा वाजता कामाची प्राधान्यता तपास.',
];

const groundingLines = [
  'आता उपस्थित रहा आणि पुढील पाऊल ठरव.',
  'शरीर सैल कर, ऊर्जा लक्षात ठेव.',
  'दीर्घ श्वास घे आणि विचार एकत्र कर.',
];

const keywordBundles: KeywordResponse[] = [
  {
    test: /(stress|तणाव|pressure|चिंता)/i,
    lines: [
      'तणाव आला तर पाच खोल श्वास घे आणि खांदे सैल कर.',
      'तुझी शांतता हेच तुझं भांडवल आहे.',
    ],
  },
  {
    test: /(money|पैसा|financial|finance|budget)/i,
    lines: [
      'आज खर्च नोंदवून दोन बचत निर्णय लिही.',
      'लक्षात ठेव, रोकड प्रवाह नियंत्रण म्हणजे स्वातंत्र्य.',
    ],
  },
  {
    test: /(habit|routine|दिनक्रम|सवय)/i,
    lines: [
      'एक सवय निवड आणि आजपासून तिचा अठरा दिवसांचा ट्रॅकर सुरू कर.',
      'तीन मिनिटे संध्याकाळी स्वतःला दहा पैकी गुण दे.',
    ],
  },
  {
    test: /(focus|एकाग्र|distract|विचलित)/i,
    lines: [
      'फोनचे नोटिफिकेशन तीस मिनिटांसाठी बंद ठेव.',
      'एका कामावर तीन तास खोल कामाची मर्यादा ठेऊ.',
    ],
  },
  {
    test: /(gratitude|कृतज्ञ|thanks|आभार)/i,
    lines: [
      'आज तुझ्या पाठीशी उभ्या व्यक्तीला धन्यवाद संदेश पाठव.',
      'आभार लिहून मन हलकं होतं आणि संपत्ती वाढते.',
    ],
  },
];

const fallbackLines = [
  'धीर आणि शिस्त दोन्ही तुझ्या नियंत्रणात आहेत.',
  'तुझा दृष्टिकोन शांत राहिला की संपत्ती स्थिर राहते.',
  'उत्साह लहान पावलांतूनच मोठं परिणाम देतो.',
];

const gratitudeClosers = [
  'आज स्वतःचे आभार मान आणि पुढचं पाऊल ठरव.',
  'शांत हसून पुढच्या क्षणात पाऊल टाक.',
  'मनातल्या यशाचे चित्र स्पष्ट ठेव.',
];

const dailyActions = [
  'आता तीन सर्वात महत्त्वाच्या कामांची क्रमवारी ठरव.',
  'आज पंधरा मिनिटे शिक्षणासाठी कॅलेंडरवर राखून ठेव.',
  'तुझ्या बचत खात्यात छोटा हस्तांतरण आत्ताच ट्रिगर कर.',
  'उद्याचे लक्ष्य एकाच वाक्यात कार्डवर लिही.',
];

const choose = <T,>(items: T[], seed: number) =>
  items[seed % items.length];

const buildAssistantReply = (input: string, history: Message[]): string => {
  const now = new Date();
  const hour = now.getHours();
  const period =
    hour < 12 ? periodLines.morning : hour < 18 ? periodLines.midday : periodLines.evening;

  const signal = history.length + Math.floor(Math.random() * 13);
  const opener = choose(openings, signal + hour);
  const grounding = choose(groundingLines, signal + hour * 3);
  const wealth = choose(wealthLines, signal + hour * 7);
  const habit = choose(habitLines, signal + hour * 11);
  const action = choose(dailyActions, signal + hour * 17);
  const closer = choose(gratitudeClosers, signal + hour * 19);

  const bundle =
    keywordBundles.find((candidate) => candidate.test.test(input)) || null;
  const bundleLine = bundle
    ? choose(bundle.lines, signal + history.length * 5)
    : choose(fallbackLines, signal + history.length * 3);

  const segments = [
    opener,
    period,
    grounding,
    bundleLine,
    wealth,
    habit,
    action,
    closer,
  ];

  return segments.join(' ');
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: 'assistant',
      content:
        'यशू, शांत श्वास घे. ही सकाळ तुझ्यासाठी नवीन दिशा आणते. तुझे मन स्थिर आहे आणि आपण परिणामकारी दिवस घडवू.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(true);

  const recognitionRef = useRef<any>(null);
  const speechReadyRef = useRef(false);
  const spokenCountRef = useRef(0);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text.trim()) return;

    if (!speechReadyRef.current) {
      window.speechSynthesis.getVoices();
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'mr-IN';
    utterance.rate = 0.94;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const marathiVoice =
      voices.find((voice) => voice.lang.toLowerCase().includes('mr')) ||
      voices.find((voice) => voice.lang.toLowerCase().includes('hi'));

    if (marathiVoice) {
      utterance.voice = marathiVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  const browserSupportsVoice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return () => {};
    }

    const handleVoices = () => {
      speechReadyRef.current = true;
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
    window.speechSynthesis.getVoices();

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!latest || latest.role !== 'assistant') return;
    if (!autoVoice) return;
    if (spokenCountRef.current >= messages.length) return;
    spokenCountRef.current = messages.length;
    speak(latest.content);
  }, [messages, autoVoice, speak]);

  const getRecognition = () => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition =
      (window as unknown as {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }).SpeechRecognition ||
      (window as unknown as {
        webkitSpeechRecognition?: new () => any;
      }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'mr-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    return recognition;
  };

  const commitMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setMessages((prev) => {
      const nextHistory = [
        ...prev,
        { role: 'user' as const, content: trimmed, timestamp: Date.now() },
      ];
      const reply = buildAssistantReply(trimmed, nextHistory);
      return [
        ...nextHistory,
        { role: 'assistant' as const, content: reply, timestamp: Date.now() },
      ];
    });
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = getRecognition();

    if (!recognition) {
      setError('तुझ्या ब्राउजरमध्ये आवाज ओळख उपलब्ध नाही.');
      return;
    }

    recognitionRef.current = recognition;
    setError(null);
    setInterimTranscript('');

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError('ऐकताना अडथळा आला. पुन्हा प्रयत्न कर.');
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim.trim());

      if (finalTranscript.trim()) {
        commitMessage(finalTranscript);
      }
    };

    recognition.start();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputValue;
    setInputValue('');
    commitMessage(value);
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-4 py-8 text-slate-100">
      <div className="flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-[0_40px_120px_-35px_rgba(15,23,42,0.8)]">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3rem] text-sky-200/80">
            शांती · संपत्ती · सवयी
          </p>
          <h1 className="text-3xl font-semibold text-sky-50 sm:text-4xl">
            श्री — यशूची मराठी आवाज साथी
          </h1>
          <p className="text-sm text-slate-300/80 sm:text-base">
            शांत, तर्कशुद्ध मार्गदर्शन. रोजची हालचाल स्पष्ट करा आणि वेगाने
            पुढे जा.
          </p>
        </header>

        <section className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-6">
            {messages.map((message, index) => (
              <article
                key={`${message.timestamp}-${index}`}
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                  message.role === 'assistant'
                    ? 'self-start bg-white/10 text-slate-50'
                    : 'self-end bg-sky-500/20 text-sky-100'
                }`}
              >
                <p>{message.content}</p>
                <span className="mt-2 block text-[0.65rem] uppercase tracking-wide text-slate-300/70">
                  {message.role === 'assistant' ? 'श्री' : 'यशू'}
                </span>
              </article>
            ))}
            {listening && interimTranscript && (
              <div className="self-end rounded-xl bg-sky-400/10 px-3 py-2 text-sm text-sky-100">
                <span className="animate-pulse">… {interimTranscript}</span>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-end"
        >
          <label className="w-full text-xs font-medium uppercase tracking-[0.3rem] text-slate-300/80">
            तुझा आवाज किंवा विचार
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="तुझे प्रश्न, योजना किंवा विचार इथे लिही…"
              className="mt-2 h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:h-20"
            />
          </label>

          <div className="flex w-full flex-col gap-3 sm:w-48">
            <button
              type="button"
              onClick={toggleListening}
              disabled={!browserSupportsVoice}
              className={`flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-medium uppercase tracking-[0.2rem] transition ${
                listening
                  ? 'bg-rose-500/90 text-white shadow-inner shadow-rose-300/40'
                  : browserSupportsVoice
                    ? 'bg-sky-500/90 text-slate-950 hover:bg-sky-400'
                    : 'cursor-not-allowed bg-slate-700/60 text-slate-400'
              }`}
            >
              {listening ? 'ऐकणे थांबव' : 'मायक्रोफोन'}
            </button>

            <button
              type="submit"
              className="flex items-center justify-center rounded-xl border border-white/20 bg-white/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2rem] text-slate-900 transition hover:bg-white"
            >
              पाठव
            </button>

            <button
              type="button"
              onClick={() => setAutoVoice((prev) => !prev)}
              className={`flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2rem] transition ${
                autoVoice
                  ? 'bg-emerald-500/90 text-emerald-950 hover:bg-emerald-400'
                  : 'bg-slate-700/70 text-slate-200 hover:bg-slate-600/80'
              }`}
            >
              आवाज {autoVoice ? 'सक्रिय' : 'निष्क्रिय'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
