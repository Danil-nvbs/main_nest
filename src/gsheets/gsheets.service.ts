import { google } from 'googleapis';
import { Injectable, Logger } from '@nestjs/common';
import * as retry from 'async-retry';
import { GdriveService } from 'src/gdrive/gdrive.service';


type TRangeAndSsID = {
    range: string,
    spreadsheetId: string
};

@Injectable()
export class GsheetsService {
    constructor(
        private readonly GdriveService: GdriveService
    ) { }
    private readonly authParams = {
        keyFile: 'keys.json', //the key file
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    };
    private readonly authClient = new google.auth.GoogleAuth(this.authParams);
    private readonly logger = new Logger(GsheetsService.name)

    async createInstance() {
        return google.sheets({ version: 'v4', auth: this.authClient });
    }

    async getValues({ range, spreadsheetId }: TRangeAndSsID) {
        let googleSheetsInstance = await this.createInstance();
        let readData = await googleSheetsInstance.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return readData.data.values;
    }

    async getValue({ range, spreadsheetId }: TRangeAndSsID) {
        let googleSheetsInstance = await this.createInstance();
        let readData = await googleSheetsInstance.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        return readData.data.values[0][0];
    }

    async setValues({ range, values, spreadsheetId }: TRangeAndSsID & { values: string[][] }) {
        try {
            let googleSheetsInstance = await this.createInstance();
            let totalRows = values.length;

            let totalColumns = Math.max(...Array.from(new Set(values.map(m => m.length))));
            for (let row of values) row.length = totalColumns;

            let [fullRange, sheetName, startRangeColumn, startRangeRow = 1, endRangeColumn, endRangeRow] =
                range.match(/^'([^']+)'!([A-Z]+)(\d*):([A-Z]+)(\d*)$/) || range.match(/^'([^']+)'!([A-Z]+):([A-Z]+)$/);
            endRangeRow = String(+endRangeRow || +startRangeRow + +totalRows - 1);

            let getColumnLetter = (columnNumber: number) => {
                let letter = '';
                while (columnNumber >= 0) {
                    letter = String.fromCharCode((columnNumber % 26) + 65) + letter;
                    columnNumber = Math.floor(columnNumber / 26) - 1;
                }
                return letter;
            };

            let totalCells = totalRows * totalColumns;
            this.logger.log(`Всего ячеек: ${totalCells}`);
            let columnsPerPage = Math.ceil(totalColumns / (totalCells / 250000));
            this.logger.log(`Столбцов на листе: ${columnsPerPage}`);

            let columnPages = [];
            for (let i = 0; i < totalColumns; i += columnsPerPage) {
                let page = [];
                for (let j = 0; j < totalRows; j++) {
                    page.push(values[j].slice(i, i + columnsPerPage));
                }
                columnPages.push(page);
            }

            this.logger.log(`Количество частей: ${columnPages.length}`);
            for (let i = 0; i < columnPages.length; i++) {
                let page = columnPages[i];
                let startColumn = getColumnLetter(startRangeColumn.charCodeAt(0) - 65 + i * columnsPerPage);
                let endColumn = getColumnLetter(
                    startRangeColumn.charCodeAt(0) - 65 + i * columnsPerPage + page[0].length - 1,
                );
                let currentRange = `${sheetName}!${startColumn}${startRangeRow}:${endColumn}${endRangeRow}`;
                this.logger.log('ready to write page ' + (i + 1));

                await retry(
                    async () => {
                        await googleSheetsInstance.spreadsheets.values.update({
                            spreadsheetId,
                            range: currentRange,
                            valueInputOption: 'USER_ENTERED',
                            requestBody: {
                                values: page
                            }
                        });
                    },
                    {
                        retries: 10, // Количество попыток повторения
                        factor: 2, // Множитель для экспоненциального увеличения времени ожидания между попытками
                        minTimeout: 1000, // Минимальное время ожидания между попытками
                        maxTimeout: 5000, // Максимальное время ожидания между попытками
                        randomize: true, // Добавляет случайное время ожидания для предотвращения синхронных повторных попыток
                        onRetry: (error: Error, attempt: number) => {
                            this.logger.log(
                                `Попытка ${attempt}: Ошибка при записи в диапазон ${currentRange}: ${error.message}`,
                            );
                        }, // Функция, вызываемая перед каждой повторной попыткой
                    },
                );

                this.logger.log('wroten');
            }
        } catch (err) {
            this.logger.log(`Ошибка записи в диапазон ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`);
            throw new Error(
                `Ошибка записи в диапазон ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`,
            );
        }
    }

    async setValues2({ range, values, spreadsheetId }: TRangeAndSsID & { values: string[][] }) {
        try {
            let googleSheetsInstance = await this.createInstance();
            let totalRows = values.length;

            let totalColumns = Math.max(...Array.from(new Set(values.map(m => m.length))));
            for (let row of values) row.length = totalColumns;

            let [fullRange, sheetName, startRangeColumn, startRangeRow = 1, endRangeColumn, endRangeRow] =
                range.match(/^'([^']+)'!([A-Z]+)(\d*):([A-Z]+)(\d*)$/) || range.match(/^'([^']+)'!([A-Z]+):([A-Z]+)$/);
            endRangeRow = String(+endRangeRow || +startRangeRow + +totalRows - 1);

            let getColumnLetter = (columnNumber: number) => {
                let letter = '';
                while (columnNumber >= 0) {
                    letter = String.fromCharCode((columnNumber % 26) + 65) + letter;
                    columnNumber = Math.floor(columnNumber / 26) - 1;
                }
                return letter;
            };



            let initialColumnArr = values.map(m => [null]);
            initialColumnArr[initialColumnArr.length - 1] = ['']
            let currentRange = `${sheetName}!${startRangeColumn}${startRangeRow}:${startRangeColumn}`;
            this.logger.log(`Start writing initial array`)
            await retry(
                async () => {
                    await googleSheetsInstance.spreadsheets.values.update({
                        spreadsheetId,
                        range: currentRange,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: {
                            values: initialColumnArr,
                        }
                    });
                },
                {
                    retries: 10, // Количество попыток повторения
                    factor: 2, // Множитель для экспоненциального увеличения времени ожидания между попытками
                    minTimeout: 1000, // Минимальное время ожидания между попытками
                    maxTimeout: 5000, // Максимальное время ожидания между попытками
                    randomize: true, // Добавляет случайное время ожидания для предотвращения синхронных повторных попыток
                    onRetry: (error: Error, attempt: number) => {
                        this.logger.log(
                            `Попытка ${attempt}: Ошибка при записи инициируещего массива в диапазон ${currentRange}: ${error.message}`,
                        );
                    }, // Функция, вызываемая перед каждой повторной попыткой
                },
            );
            this.logger.log(`Initial array wroten`)

            let chunkSymbolsCount = 0
            let symbolsLimit = 15 * 1000 * 1000
            let curStartRow = +startRangeRow

            let chunkStartIndex = 0
            let promises = []
            for (let i = 0; i < values.length; i++) {
                let curChunkStartIndex = chunkStartIndex
                let chunkEndIndex = i
                let row = values[i]
                chunkSymbolsCount += row.join('').length
                if (chunkSymbolsCount >= symbolsLimit || i == values.length - 1) {
                    let chunk = values.slice(curChunkStartIndex, chunkEndIndex + 1)
                    this.logger.log(`current chunk symbols count = ${chunkSymbolsCount}, rows = ${chunk.length}`)
                    let currentRange = `${sheetName}!${startRangeColumn}${curStartRow}:${endRangeColumn}`;
                    promises.push(new Promise(async (resolve, reject) => {
                        retry(
                            async () => {
                                await googleSheetsInstance.spreadsheets.values.update({
                                    spreadsheetId,
                                    range: currentRange,
                                    valueInputOption: 'USER_ENTERED',
                                    requestBody: {
                                        values: chunk
                                    }
                                });
                            },
                            {
                                retries: 10, // Количество попыток повторения
                                factor: 2, // Множитель для экспоненциального увеличения времени ожидания между попытками
                                minTimeout: 1000, // Минимальное время ожидания между попытками
                                maxTimeout: 5000, // Максимальное время ожидания между попытками
                                randomize: true, // Добавляет случайное время ожидания для предотвращения синхронных повторных попыток
                                onRetry: (error: Error, attempt: number) => {
                                    this.logger.log(
                                        `Попытка ${attempt}: Ошибка при записи в диапазон ${currentRange}: ${error.message}`,
                                    );
                                }, // Функция, вызываемая перед каждой повторной попыткой
                            }).then(() => resolve(this.logger.log(`wrotten on ${sheetName}: rows ${curChunkStartIndex}-${chunkEndIndex}`))).catch(err => reject(err))
                    }))

                    curStartRow += chunk.length
                    chunkSymbolsCount = 0
                    chunkStartIndex = i + 1
                }

            }

            let result = await Promise.all(promises).catch(err => { throw err })

        } catch (err) {
            this.logger.log(`Ошибка записи в диапазон ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`);
            throw new Error(
                `Ошибка записи в диапазон ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`,
            );
        }
    }

    async setValue({ range, spreadsheetId, value }: TRangeAndSsID & { value: string }) {
        let googleSheetsInstance = await this.createInstance();
        return await googleSheetsInstance.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]]
            }
        });
    }

    async clearValues({ range, spreadsheetId }: TRangeAndSsID) {
        try {
            let googleSheetsInstance = await this.createInstance();

            return await googleSheetsInstance.spreadsheets.values.clear({
                spreadsheetId, //spreadsheet id
                range, //sheet name and range of cells
            });
        } catch (err) {
            this.logger.log(`Ошибка очистки диапазона ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`);
            throw new Error(
                `Ошибка очистки диапазона ${range} таблицы с ID ${spreadsheetId}: Описание ошибки: ${err}`,
            );
        }
    }

    async appendValues({ range, values, spreadsheetId }: TRangeAndSsID & { values: string[][] }) {
        let googleSheetsInstance = await this.createInstance()

        return await googleSheetsInstance.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED', // Указывает, что значения будут добавлены как есть
            insertDataOption: 'INSERT_ROWS', // Указывает, что данные будут вставлены в новые строки
            requestBody: {
                values,
            },
        })
    }

    async addEmptyRows({ sheetName, spreadsheetId, numberOfRows }: { sheetName: string, spreadsheetId: string, numberOfRows: number }) {
        let googleSheetsInstance = await this.createInstance();

        const sheetMetadata = await googleSheetsInstance.spreadsheets.get({
            spreadsheetId,
            ranges: [sheetName],
        });

        const sheetId = sheetMetadata.data.sheets[0].properties.sheetId;
        const currentRowCount = sheetMetadata.data.sheets[0].properties.gridProperties.rowCount;

        const requests = [
            {
                insertDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: currentRowCount, // Начинаем с текущего количества строк
                        endIndex: currentRowCount + numberOfRows, // Конечный индекс строки
                    },
                    inheritFromBefore: true, // Наследовать форматирование из предыдущей строки
                },
            },
        ];

        return await googleSheetsInstance.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests,
            },
        });
    }


    async deleteRowsByIndices({ sheetName, rowIndices, spreadsheetId }: { sheetName: string, rowIndices: number[], spreadsheetId: string }) {
        try {
            let googleSheetsInstance = await this.createInstance();
            const sheetMetadata = await googleSheetsInstance.spreadsheets.get({
                spreadsheetId,
                ranges: [sheetName],
                fields: 'sheets(properties(sheetId))',
            });
            const sheetId = sheetMetadata.data.sheets[0].properties.sheetId;
            rowIndices.sort((a, b) => b - a);

            let requests = [];
            let request = [rowIndices[0], rowIndices[0]];
            for (let i = 0; i < rowIndices.length; i++) {
                if (rowIndices[i + 1] !== undefined) {
                    if (rowIndices[i] - rowIndices[i + 1] !== 1) {
                        requests.push(request);
                        request = [rowIndices[i + 1], rowIndices[i + 1]];
                    } else {
                        request[0] = rowIndices[i + 1];
                    }
                } else {
                    requests.push(request);
                }
            }

            const chunkSize = 100;
            const chunkedRequests = [];
            for (let i = 0; i < requests.length; i += chunkSize) {
                chunkedRequests.push(requests.slice(i, i + chunkSize));
            }

            for (const chunk of chunkedRequests) {
                const batchRequests = chunk.map(request => ({
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: request[0],
                            endIndex: request[1] + 1,
                        },
                    },
                }));

                await googleSheetsInstance.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        requests: batchRequests,
                    },
                });
            }

            this.logger.log(`Строки ${rowIndices.join(', ')} успешно удалены из листа ${sheetName} таблицы ${spreadsheetId}.`);
        } catch (err) {
            throw `Ошибка при удалении строк из листа ${sheetName} таблицы ${spreadsheetId}: ${err}`;
        }
    }

    async createSpreadsheet({ fileName }: { fileName: string }) {
        const auth = this.authClient;
        google.options({ auth });
        const sheets = google.sheets({ version: 'v4' });
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: fileName,
                },
            },
            fields: 'spreadsheetId',
        });
        this.logger.log(`Created spreadsheet ${fileName} with ID: ${spreadsheet.data.spreadsheetId}`);
        return spreadsheet
    }

    async addSheet({ spreadsheetId, sheetName }: { spreadsheetId: string, sheetName: string }) {
        const sheets = google.sheets({ version: 'v4' });
        const addSheetResponse = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetName,
                            },
                        },
                    },
                ],
            },
        })
        this.logger.log(`Add sheet ${sheetName}`);

        return addSheetResponse
    }

    async deleteSheet({ spreadsheetId, sheetName }: { spreadsheetId: string, sheetName: string }) {
        const sheets = google.sheets({ version: 'v4' });
        const response = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheet = response.data.sheets?.find(sheet => sheet.properties?.title === sheetName);

        if (!sheet) {
            throw new Error(`Sheet with name ${sheetName} not found`);
        }

        const sheetId = sheet.properties?.sheetId;
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteSheet: {
                            sheetId: sheetId,
                        },
                    },
                ],
            },
        });

        this.logger.log(`Deleted sheet ${sheetName} from spreadsheet ${spreadsheetId}`);
    }

    async createSpreadsheetWithData({ data, folderId, fileName }: { data: { values: any[][], sheetName?: string }[], folderId: string, fileName: string }) {
        let spreadsheetId = (await this.createSpreadsheet({ fileName })).data.spreadsheetId
        for (const { values, sheetName } of data) {
            await this.addSheet({ spreadsheetId, sheetName })
            await this.deleteSheet({ spreadsheetId, sheetName: 'Sheet1' })
            await this.setValues2({ values, spreadsheetId, range: `'${sheetName}'!A1:ZZZ` })
        }
        await this.GdriveService.moveFileToFolder({ fileId: spreadsheetId, folderId })
    }

}
