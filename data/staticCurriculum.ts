import {
  ELEMENTARY_CURRICULUM,
  LessonData,
  TopicContent,
  GradeContent,
} from './lessons/elementary.ts';
import { MIDDLE_CURRICULUM } from './lessons/middle.ts';
import { HIGH_CURRICULUM } from './lessons/high.ts';

export type { LessonData, TopicContent, GradeContent };

export const STATIC_DATA_DB: Record<string, GradeContent> = {
  ...ELEMENTARY_CURRICULUM,
  ...MIDDLE_CURRICULUM,
  ...HIGH_CURRICULUM,
};