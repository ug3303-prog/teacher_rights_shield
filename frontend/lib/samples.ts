import type { IncidentInput } from "@/lib/types";

export type SampleIncident = {
  id: string;
  title: string;
  content: string;
};

export const sampleIncidents: SampleIncident[] = [
  {
    id: "sample_1",
    title: "반복 전화 항의",
    content: "학부모가 하루에 5번 이상 반복적으로 전화하며 담임 교체를 요구하고 있습니다."
  },
  {
    id: "sample_2",
    title: "협박 문자",
    content: "학부모가 교육청 신고와 언론 제보를 하겠다고 협박했습니다."
  },
  {
    id: "sample_3",
    title: "학교 방문 위협",
    content: "보호자가 직접 학교에 찾아오겠다고 하며 큰 소리로 항의하겠다고 했습니다."
  },
  {
    id: "sample_4",
    title: "SNS 공개 위협",
    content: "학부모가 교사 이름과 사진을 SNS에 올리겠다고 말했습니다."
  },
  {
    id: "sample_5",
    title: "학생 신상 문제 민원",
    content: "학생 관련 개인정보 공개와 민원을 동시에 제기하며 반복적으로 압박하고 있습니다."
  }
];

export function sampleToIncidentInput(sample: SampleIncident): Partial<IncidentInput> {
  return {
    place: "전화/문자",
    target_type: "보호자",
    complaint_type: sample.title.includes("협박") || sample.title.includes("위협") ? "협박형" : "반복형",
    content: sample.content,
    memo: `샘플 민원: ${sample.title}`,
    emotion: sample.title.includes("협박") || sample.title.includes("위협") ? "압박" : "불안"
  };
}
