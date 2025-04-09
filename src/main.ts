import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { Logger } from "@nestjs/common"
import * as bodyParser from 'body-parser'
import { ValidationPipe } from "./pipes/validation.pipe"

async function start() {
    const PORT = process.env.PORT || 5000
    const app = await NestFactory.create(AppModule)

    // app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
                    .setTitle('API Nest DContract')
                    .setDescription('Документация REST API')
                    .setVersion('1.0.0')
                    .addApiKey(
                      {
                        type: 'apiKey',
                        description: 'Токен доступа к API (gs-token)',
                      },
                      'x_gs_token',
                    )
                    .addApiKey(
                      {
                        type: 'apiKey',
                        description: 'Токен доступа к API со стороны Nest микросервисов (microservice-token)',
                      },
                      'x_microservice_token',
                    )
                    .build()

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/docs', app, document)

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    await app.listen(PORT, () => new Logger('MainTS').log(`Server started on port = ${PORT}`))

} 

start()