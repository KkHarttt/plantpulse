
import {
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Shift } from '@prisma/client';

export class CreateChecklistDto {
  @IsInt()
  templateId: number;

  @IsInt()
  departmentId: number;

  @IsDateString()
  date: string;

  @IsEnum(Shift)
  shift: Shift;

  @IsOptional()
  @IsString()
  comment?: string;
}
