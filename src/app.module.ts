import { Logger, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { Product } from "./bigbase/models/product.model";
import { BigbaseModule } from './bigbase/bigbase.module';
import { GsheetsModule } from './gsheets/gsheets.module';
import { GsUserToken } from "./users/model/gs-users-tokens.model";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { WarehouseModule } from "./warehouse/warehouse.module";
import { WbModule } from "./wildberries/wildberries.module";
import { OzonModule } from "./ozon/ozon.module";
import { MarginModule } from './margin/margin.module';
import { YandexModule } from './yandex/yandex.module';
import { KomusModule } from "./komus/komus.module";
import { RelefModule } from "./relef/relef.module";
import { PrintLabelsModule } from './print-labels/print-labels.module';
import { DischargeModule } from './discharge/discharge.module';
import { HttpModule } from './common/http.module';
import { MagnitModule } from "./magnit/magnit.module";
import { MagnitDischargeModule } from "./magnit/discharge/discharge.module";

@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.PG_HOST,
            port: Number(process.env.PG_PORT),
            username: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: 'dc_db',
            models: [Product, GsUserToken],
            autoLoadModels: true,
            logging: process.env.SEQUILIZE_LOGGER == '1' ? Logger.log : false,
        }),
        AuthModule,
        BigbaseModule,
        GsheetsModule,
        UsersModule,
        WarehouseModule,
        WbModule,
        OzonModule,
        MarginModule,
        YandexModule,
        KomusModule,
        RelefModule,
        PrintLabelsModule,
        DischargeModule,
        HttpModule,
        MagnitModule,
        MagnitDischargeModule
    ]
})
export class AppModule { }