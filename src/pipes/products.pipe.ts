import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { BigbaseService } from "src/bigbase/bigbase.service";
import { CreateProductDto } from "src/bigbase/dto";


@Injectable()
export class ProductsPipe implements PipeTransform<any> {
    constructor(private bigbaseService: BigbaseService) { }

    private barcodesCols = [
        'ШК поставщика EAN13',
        'ШК поставщика EAN13-2',
        'ШК поставщика EAN13-3',
        'ШК поставщика EAN13-4',
        'ШК поставщика EAN13-5',
        'ШК поставщика EAN13-6',
        'ШК поставщика EAN13-7',
    ]

    async transform(value: CreateProductDto[], metadata: ArgumentMetadata): Promise<any> {
        const dictObj = await this.bigbaseService.getDictObj();

        return value.map((product) => {
            let barcodes = String(product.barcode_supplier).split(', ').filter((f: string) => f.match(/^\d{13}$/) && f.slice(0, 1) != '0');
    
            if (barcodes.length) this.barcodesCols.forEach((barcodeName, index) => product[dictObj[barcodeName].name] = barcodes[index] || null);

            return product;
        })
    }
}