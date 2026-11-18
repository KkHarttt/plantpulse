
export class NormCheckResultDto {
  checklistValueId: number;
  parameter: string;
  value: number;
  unit: string | null;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  message: string;
  min: number | null;
  max: number | null;
  warnMin: number | null;
  warnMax: number | null;
}
