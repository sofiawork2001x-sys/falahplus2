export type Role = "farmer" | "company" | "agri_expert" | "finance_expert" | "vet" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  farmer: "فلاح",
  company: "شركة",
  agri_expert: "خبير فلاحي",
  finance_expert: "خبير مالي",
  vet: "طبيب بيطري",
  admin: "مسؤول",
};

export const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: "farmer", label: "فلاح", desc: "أرفع أراضيّ للكراء واطلب الاستشارات والدعم." },
  { value: "company", label: "شركة معدات", desc: "أعرض الجرارات والآلات للكراء." },
  { value: "agri_expert", label: "خبير فلاحي", desc: "أرد على الاستشارات الفنية والتقنية." },
  { value: "vet", label: "طبيب بيطري", desc: "أرد على استشارات صحة الحيوانات." },
  { value: "finance_expert", label: "خبير مالي", desc: "أدرس ملفات الجدوى والدعم المالي." },
];

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  wilaya: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface Wilaya { code: number; name_ar: string; name_fr: string }

export interface LandRent {
  id: string;
  farmer_id: string;
  title: string;
  description: string;
  area_hectares: number;
  wilaya_code: number | null;
  city: string | null;
  price: string;
  images: string[];
  status: "active" | "rented" | "hidden";
  created_at: string;
}

export interface Equipment {
  id: string;
  company_id: string;
  name: string;
  description: string;
  category: string | null;
  wilaya_code: number | null;
  price: string;
  images: string[];
  status: "active" | "rented" | "hidden";
  created_at: string;
}

export type ConsultationType = "technical" | "vet" | "financial";
export const CONSULTATION_LABEL: Record<ConsultationType, string> = {
  technical: "استشارة فنية وتقنية",
  vet: "استشارة بيطرية (حيوانات)",
  financial: "استشارة مالية",
};

export interface Consultation {
  id: string;
  farmer_id: string;
  type: ConsultationType;
  title: string;
  body: string;
  images: string[];
  wilaya_code: number | null;
  status: "open" | "answered" | "closed";
  created_at: string;
}

export interface ConsultationReply {
  id: string;
  consultation_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export type FinancialKind = "feasibility" | "support_file";
export const FIN_KIND_LABEL: Record<FinancialKind, string> = {
  feasibility: "دراسة جدوى",
  support_file: "ملف دعم مالي",
};

export interface FinancialRequest {
  id: string;
  farmer_id: string;
  kind: FinancialKind;
  title: string;
  details: string;
  amount: string | null;
  files: string[];
  status: "pending" | "approved" | "rejected";
  reviewer_id: string | null;
  reviewer_note: string | null;
  created_at: string;
}
