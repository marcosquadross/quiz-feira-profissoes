import { IsString, IsOptional, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class RefIdDto {
  @IsMongoId()
  _id: string;
}

export class CreateResponseDto {
  @ValidateNested()
  @Type(() => RefIdDto)
  quiz: RefIdDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RefIdDto)
  session?: RefIdDto;

  @IsString()
  nickname: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RefIdDto)
  user?: RefIdDto;
}