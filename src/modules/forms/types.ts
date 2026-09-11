import type { InferSelectModel } from "drizzle-orm";

import type {
  forms,
  formVersions,
  FormDefinition,
  FormTheme,
} from "@/lib/db/schema";

export type Form = InferSelectModel<typeof forms>;
export type FormVersion = InferSelectModel<typeof formVersions>;

export type FormListItem = {
  id: string;
  title: string;
  enabled: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  groupCount: number;
  transactionGroupCount: number;
  itemGroupCount: number;
  producerName?: string | null;
};

export type CreateFormInput = {
  id?: string;
  title: string;
  definition?: FormDefinition;
  producerId?: string;
};

export type UpdateFormInput = {
  title?: string;
  enabled?: boolean;
  definition?: FormDefinition;
  allowedOrigins?: string[];
  theme?: FormTheme | null;
};
