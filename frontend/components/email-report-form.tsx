"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { sendReportEmail } from "@/lib/api";
import { Button, Card, inputClass } from "@/components/ui";

export function EmailReportForm({ incidentId }: { incidentId: number }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      const result = await sendReportEmail(incidentId, email);
      setMessage(result.message);
    } catch {
      setMessage("이메일 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-navy">관리자 이메일 전송</h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="manager@school.kr" />
        <Button disabled={loading || !email} onClick={submit}>
          <Mail className="mr-2 h-4 w-4" /> 전송
        </Button>
      </div>
      {message && <p className="mt-3 rounded-md border border-line bg-paper px-3 py-2 text-sm text-slate-700">{message}</p>}
    </Card>
  );
}
