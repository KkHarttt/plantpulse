
import {
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateChecklistValueDto {
  @IsInt()
  templateItemId: number;

  @IsOptional()
  @IsNumber()
  numberValue?: number;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @IsString()
  failReason?: string;
}