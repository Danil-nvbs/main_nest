import { ArgumentMetadata, Injectable, PipeTransform, ValidationPipeOptions } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";


@Injectable()
export class ValidationPipe implements PipeTransform<ValidationPipeOptions> {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        const obj = plainToClass(metadata.metatype, value)
        const errors = await validate(obj, { skipMissingProperties: true })

        if (errors.length) {
            let messages = errors.map(err => {
                console.log(err)
                return `${err.property} - ${Object.values(err.constraints).join(', ')}`
            })
            throw new ValidationException(messages)
        }
        return value
    }
}