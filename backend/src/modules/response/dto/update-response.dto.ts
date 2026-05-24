

import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateResponseDto {
    // _id da Response (coleção própria)
    @IsMongoId()
    _id: string;

    @IsString()
    nickname: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    finalScore?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    finalTime?: number;
}