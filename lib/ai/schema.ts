import { z } from "zod";

export const difficultySchema = z.enum(["accessible", "graduate", "specialist"]);

export const briefingSchema = z.object({
  tldr: z.string().describe("Two-sentence plain-language summary of the paper's contribution."),
  audience: z.string().describe("Who should read this paper, in one sentence."),
  claims: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Core claims or findings, as short sentences."),
  methods: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key methods, datasets, or experimental setup."),
  limitations: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("Honest limitations, caveats, or untested assumptions."),
  whyItMatters: z.string().describe("Why a working researcher should care this week."),
  relatedQuestions: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("Sharp follow-up questions the paper leaves open."),
  difficulty: difficultySchema,
  novelty: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe("1 = incremental, 5 = field-shifting, based only on the abstract."),
});

export type PaperBriefing = z.infer<typeof briefingSchema>;
