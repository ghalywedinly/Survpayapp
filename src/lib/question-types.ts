export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "short_text"
  | "long_text"
  | "rating"
  | "likert"
  | "number"
  | "date"
  | "yes_no"
  | "nps"
  | "matrix"
  | "ranking";

export interface QuestionTypeMeta {
  type: QuestionType;
  labelKey: string; // builder.type* dictionary key
  hasOptions: boolean;
  hasMatrixRows: boolean;
}

export const questionTypeList: QuestionTypeMeta[] = [
  { type: "single_choice", labelKey: "typeSingleChoice", hasOptions: true, hasMatrixRows: false },
  { type: "multiple_choice", labelKey: "typeMultipleChoice", hasOptions: true, hasMatrixRows: false },
  { type: "dropdown", labelKey: "typeDropdown", hasOptions: true, hasMatrixRows: false },
  { type: "short_text", labelKey: "typeShortText", hasOptions: false, hasMatrixRows: false },
  { type: "long_text", labelKey: "typeLongText", hasOptions: false, hasMatrixRows: false },
  { type: "rating", labelKey: "typeRating", hasOptions: false, hasMatrixRows: false },
  { type: "likert", labelKey: "typeLikert", hasOptions: true, hasMatrixRows: false },
  { type: "number", labelKey: "typeNumber", hasOptions: false, hasMatrixRows: false },
  { type: "date", labelKey: "typeDate", hasOptions: false, hasMatrixRows: false },
  { type: "yes_no", labelKey: "typeYesNo", hasOptions: false, hasMatrixRows: false },
  { type: "nps", labelKey: "typeNps", hasOptions: false, hasMatrixRows: false },
  { type: "matrix", labelKey: "typeMatrix", hasOptions: true, hasMatrixRows: true },
  { type: "ranking", labelKey: "typeRanking", hasOptions: true, hasMatrixRows: false },
];

export function defaultOptionsFor(type: QuestionType): { label: string; value: string }[] {
  if (type === "yes_no") return [];
  if (type === "likert") {
    return [
      { label: "Strongly disagree", value: "1" },
      { label: "Disagree", value: "2" },
      { label: "Neutral", value: "3" },
      { label: "Agree", value: "4" },
      { label: "Strongly agree", value: "5" },
    ];
  }
  if (["single_choice", "multiple_choice", "dropdown", "ranking"].includes(type)) {
    return [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
    ];
  }
  return [];
}

export interface ClientQuestionOption {
  id: string;
  label: string;
  labelAr?: string;
  value: string;
}

export interface ClientQuestion {
  id: string;
  type: QuestionType;
  text: string;
  textAr?: string;
  description?: string;
  descriptionAr?: string;
  required: boolean;
  isAttentionCheck: boolean;
  isDemographic: boolean;
  options: ClientQuestionOption[];
  matrixRows: string[];
  conditionQuestionId?: string | null;
  conditionOperator?: "equals" | "not_equals" | "any_of" | null;
  conditionValue?: string | null;
  attentionExpected?: string | null;
}

let counter = 0;
export function newId(prefix = "q") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

interface ServerQuestion {
  id: string;
  type: string;
  text: string;
  textAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  required: boolean;
  isAttentionCheck: boolean;
  isDemographic: boolean;
  validation: string | null;
  matrixRows: string | null;
  conditionQuestionId: string | null;
  conditionOperator: string | null;
  conditionValue: string | null;
  options: { id: string; label: string; labelAr: string | null; value: string }[];
}

export function fromServerQuestion(q: ServerQuestion): ClientQuestion {
  let attentionExpected: string | null = null;
  if (q.validation) {
    try {
      attentionExpected = JSON.parse(q.validation)?.expected ?? null;
    } catch {
      attentionExpected = null;
    }
  }
  return {
    id: q.id,
    type: q.type as QuestionType,
    text: q.text,
    textAr: q.textAr ?? undefined,
    description: q.description ?? undefined,
    descriptionAr: q.descriptionAr ?? undefined,
    required: q.required,
    isAttentionCheck: q.isAttentionCheck,
    isDemographic: q.isDemographic,
    options: q.options.map((o) => ({ id: o.id, label: o.label, labelAr: o.labelAr ?? undefined, value: o.value })),
    matrixRows: q.matrixRows ? JSON.parse(q.matrixRows) : [],
    conditionQuestionId: q.conditionQuestionId,
    conditionOperator: (q.conditionOperator as ClientQuestion["conditionOperator"]) ?? null,
    conditionValue: q.conditionValue,
    attentionExpected,
  };
}

export function createBlankQuestion(type: QuestionType = "single_choice"): ClientQuestion {
  return {
    id: newId(),
    type,
    text: "",
    required: true,
    isAttentionCheck: false,
    isDemographic: false,
    options: defaultOptionsFor(type).map((o) => ({ id: newId("opt"), ...o })),
    matrixRows: type === "matrix" ? ["Row 1", "Row 2"] : [],
    conditionQuestionId: null,
    conditionOperator: null,
    conditionValue: null,
  };
}
