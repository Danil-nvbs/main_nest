import { ApiProperty } from '@nestjs/swagger';

export class PromotionsExcelDto {
   
    @ApiProperty({ description: 'Дата создания файла', example: "2025-02-27T13:26:48Z" })
    uploadDate: string

    @ApiProperty({ description: 'Файл закодированный в Base64', example: "UEsDBBQACAAIAAAAAAAAAAAAAAAAAAAAAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1stP17jx3HmeeJ//97FQkNfoNuoFi..." })
    file: string
}
