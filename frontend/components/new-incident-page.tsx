"use client";

import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Save, Sparkles, Upload } from "lucide-react";
import { analyzeIncident, saveIncident } from "@/lib/api";
import { sampleIncidents, sampleToIncidentInput } from "@/lib/samples";
import type { AnalysisResult, IncidentInput } from "@/lib/types";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { RiskPanel } from "@/components/risk-panel";

const complaintTypes = ["부당 요구형", "반복형", "시간 지연형", "폭언/폭력형", "스토킹형", "신상 공개형", "명예훼손형", "협박형"];
const targetTypes = ["학생", "보호자", "관리자"];
const emotions = ["불안", "압박", "협박", "일반"];

const initialInput: IncidentInput = {
  occurred_at: "",
  place: "",
  target_type: "보호자",
  complaint_type: "부당 요구형",
  content: "",
  memo: "",
  emotion: "일반"
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
};

export function NewIncidentPage({ allowSamples }: { allowSamples: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<IncidentInput>(initialInput);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setForm((current) => (
      current.occurred_at
        ? current
        : { ...current, occurred_at: new Date().toISOString().slice(0, 16) }
    ));
  }, []);

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!allowSamples) return;
    const sampleId = new URLSearchParams(window.location.search).get("sample");
    if (!sampleId) return;
    const sample = sampleIncidents.find((item) => item.id === sampleId);
    if (!sample) return;
    setForm((current) => ({ ...current, ...sampleToIncidentInput(sample) }));
    setAnalysis(null);
  }, [allowSamples]);

  function update<K extends keyof IncidentInput>(key: K, value: IncidentInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function appendTranscript(text: string) {
    setForm((current) => ({
      ...current,
      content: [current.content, text].filter(Boolean).join(current.content ? "\n" : "")
    }));
    setAnalysis(null);
  }

  function startRecording() {
    setVoiceMessage("");
    if (!speechSupported) {
      setVoiceMessage("이 브라우저는 음성 입력을 지원하지 않습니다. Chrome 사용을 권장합니다.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ");
      appendTranscript(transcript);
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function handleAudioFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const allowed = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"];
    const validExtension = /\.(mp3|wav|m4a)$/i.test(file.name);
    if (!allowed.includes(file.type) && !validExtension) {
      setUploadMessage("mp3, wav, m4a 파일만 업로드할 수 있습니다.");
      return;
    }
    const transcript = `녹취 내용이 텍스트로 변환되었습니다.\n파일명: ${file.name}\n더미 transcript: 민원인이 반복적인 항의와 압박성 발언을 했습니다.`;
    appendTranscript(transcript);
    setUploadMessage("녹취 내용이 텍스트로 변환되었습니다.");
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    handleAudioFiles(event.dataTransfer.files);
  }

  async function handleAnalyze() {
    setError("");
    setLoading(true);
    try {
      const result = await analyzeIncident({ ...form, occurred_at: new Date(form.occurred_at).toISOString() });
      setAnalysis(result);
    } catch (requestError) {
      const detail = requestError instanceof Error ? requestError.message : "알 수 없는 오류";
      setError(`분석 요청에 실패했습니다. ${detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!analysis) return;
    setLoading(true);
    try {
      const saved = await saveIncident({ ...form, occurred_at: new Date(form.occurred_at).toISOString() }, analysis);
      router.push(`/incidents/${saved.id}`);
    } catch (requestError) {
      const detail = requestError instanceof Error ? requestError.message : "알 수 없는 오류";
      setError(`저장에 실패했습니다. ${detail}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_0.9fr]">
      <Card className="p-5">
        <div className="border-b border-line pb-4">
          <p className="text-sm font-semibold text-gold">민원 기록 입력</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">상황을 시간순으로 남겨 주세요</h1>
        </div>
        <div className="mt-5 grid gap-4">
          <div className="flex flex-wrap gap-3">
            {!recording ? (
              <Button type="button" className="bg-white text-navy ring-1 ring-line hover:bg-paper" onClick={startRecording}>
                <Mic className="mr-2 h-4 w-4" /> 음성으로 기록
              </Button>
            ) : (
              <Button type="button" className="bg-red-700 hover:bg-red-800" onClick={stopRecording}>
                <MicOff className="mr-2 h-4 w-4" /> Stop Recording
              </Button>
            )}
            {voiceMessage && <p className="self-center text-sm text-red-700">{voiceMessage}</p>}
          </div>
          {allowSamples && (
            <>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-line bg-paper px-4 py-6 text-center text-sm text-slate-700 transition hover:border-gold"
              >
                <Upload className="mb-2 h-5 w-5 text-gold" />
                <span className="font-semibold text-navy">녹취 파일 업로드</span>
                <span className="mt-1">mp3, wav, m4a 파일을 드래그하거나 선택하세요.</span>
                <input type="file" accept=".mp3,.wav,.m4a,audio/*" className="hidden" onChange={(event) => handleAudioFiles(event.target.files)} />
              </label>
              {uploadMessage && <p className="rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-700">{uploadMessage}</p>}
            </>
          )}
          <Field label="발생 일시">
            <input className={inputClass} type="datetime-local" value={form.occurred_at} onChange={(event) => update("occurred_at", event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="장소">
              <input className={inputClass} value={form.place} onChange={(event) => update("place", event.target.value)} placeholder="예: 교무실, 상담실, 전화" />
            </Field>
            <Field label="대상">
              <select className={inputClass} value={form.target_type} onChange={(event) => update("target_type", event.target.value)}>
                {targetTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="민원 유형">
              <select className={inputClass} value={form.complaint_type} onChange={(event) => update("complaint_type", event.target.value)}>
                {complaintTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="감정 상태">
              <select className={inputClass} value={form.emotion} onChange={(event) => update("emotion", event.target.value)}>
                {emotions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </div>
          <Field label="상세 내용">
            <textarea
              className={`${inputClass} min-h-56 leading-7`}
              value={form.content}
              onChange={(event) => update("content", event.target.value)}
              placeholder="요구 내용, 표현, 반복 횟수, 통화/방문/문자 여부, 목격자 등을 가능한 그대로 기록합니다."
            />
          </Field>
          <Field label="첨부 메모">
            <textarea className={`${inputClass} min-h-28`} value={form.memo} onChange={(event) => update("memo", event.target.value)} placeholder="캡처 위치, 녹취 여부, 추가 확인 사항" />
          </Field>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button disabled={loading || form.content.length < 10 || !form.place} onClick={handleAnalyze}>
              <Sparkles className="mr-2 h-4 w-4" /> AI 분석
            </Button>
            <Button className="bg-gold text-navy hover:bg-[#a77925]" disabled={loading || !analysis} onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> 저장 후 보고서 생성
            </Button>
          </div>
        </div>
      </Card>
      <aside className="grid content-start gap-4">
        <Card className="border-gold/30 bg-[#fffaf0] p-4">
          <h2 className="font-semibold text-navy">긴급도 확인 기준</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            고소, 신고, 교육청, 언론, 찾아가겠다, SNS 공개, 협박 등 명시 키워드를 위험도 점수에 반영합니다.
          </p>
        </Card>
        {analysis ? <RiskPanel analysis={analysis} /> : <Card className="p-5 text-sm leading-6 text-slate-600">분석 결과가 이곳에 표시됩니다.</Card>}
      </aside>
    </main>
  );
}
