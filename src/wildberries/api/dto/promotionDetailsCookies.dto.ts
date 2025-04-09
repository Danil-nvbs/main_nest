import { ApiProperty } from '@nestjs/swagger';

class RangingLevel {
    @ApiProperty({ description: "Количество номенклатур", example: 9553 })
    nomenclatures: number;

    @ApiProperty({ description: "Коэффициент", example: 20 })
    coefficient: number;
}

class Ranging {
    @ApiProperty({ description: "Уровни рейтинга", type: [RangingLevel] })
    levels: RangingLevel[];

    @ApiProperty({ description: "Текущий коэффициент", example: 20 })
    currentCoefficient: number;

    @ApiProperty({ description: "Максимальный уровень достигнут", example: false })
    isMaxLevel: boolean;

    @ApiProperty({ description: "Количество номенклатур до следующего уровня", example: 75979 })
    nmToNextLevel: number;

    @ApiProperty({ description: "Количество номенклатур до максимального уровня", example: 114188 })
    nmToMaxLevel: number;

    @ApiProperty({ description: "Увеличение", example: "1.1" })
    boost: string;
}

class RangingV2Level {
    @ApiProperty({ description: "Условие для рейтинга", example: "productsInPromotion" })
    condition: string;

    @ApiProperty({ description: "Порог участия", example: 9553 })
    participationThreshold: number;

    @ApiProperty({ description: "Увеличение", example: 20 })
    boost: number;
}

class RangingV2 {
    @ApiProperty({ description: "Текущее количество номенклатур в акции", example: 19542 })
    currentParticipationNm: number;

    @ApiProperty({ description: "Уровни рейтинга", type: [RangingV2Level] })
    levels: RangingV2Level[];
}

export class PromotionsDetailsCookiesDto {
    @ApiProperty({ description: "Идентификатор акции", example: 912 })
    actionID: number;

    @ApiProperty({ description: "Идентификатор группы", example: 827 })
    groupID: number;

    @ApiProperty({ description: "Идентификатор периода", example: 1004 })
    periodID: number;

    @ApiProperty({ description: "Название акции", example: "Облако подарков: автоакция" })
    name: string;

    @ApiProperty({ description: "Статус акции", example: 1 })
    status: number;

    @ApiProperty({ description: "Дата и время начала акции в формате ISO 8601", example: "2025-02-18T01:00:00+03:00" })
    startDt: string;

    @ApiProperty({ description: "Дата и время окончания акции в формате ISO 8601", example: "2025-03-11T23:59:59+03:00" })
    endDt: string;

    @ApiProperty({ description: "Важная акция", example: true })
    isImportant: boolean;

    @ApiProperty({ description: "Анонс акции", example: false })
    isAnnouncement: boolean;

    @ApiProperty({ description: "Описание акции", example: "Новая праздничная акция пройдет с 18 февраля по 11 марта..." })
    description: string;

    @ApiProperty({ description: "Форматированное описание акции", example: "" })
    formattedDescription: string;

    @ApiProperty({ description: "Преимущества акции", example: ["Поднятие в поиске до 30%", "Плашка на карточке товара", "Баннер на сайте", "Красная цена", "Градусник"] })
    advantages: string[];

    @ApiProperty({ description: "Процент участия для SPP", example: null })
    participationPercentageForSpp: number | null;

    @ApiProperty({ description: "Процент участия", example: 10 })
    participationPercentage: number;

    @ApiProperty({ description: "Остатки номенклатур для SPP", example: 0 })
    leftoverNomenclaturesForSpp: number;

    @ApiProperty({ description: "SPP включено", example: false })
    sppEnabled: boolean;

    @ApiProperty({ description: "Общее количество в акции", example: 21433 })
    inPromoActionTotal: number;

    @ApiProperty({ description: "Остатки в акции", example: 19542 })
    inPromoActionLeftovers: number;

    @ApiProperty({ description: "Общее количество не в акции", example: 191830 })
    notInPromoActionTotal: number;

    @ApiProperty({ description: "Остатки не в акции", example: 171500 })
    notInPromoActionLeftovers: number;

    @ApiProperty({ description: "Акция на складе", example: 191042 })
    actionInStock: number;

    @ApiProperty({ description: "Автоматическая акция", example: true })
    isAutoAction: boolean;

    @ApiProperty({ description: "Возможность восстановления", example: true })
    isHasRecovery: boolean;

    @ApiProperty({ description: "Есть товары, не участвующие в акции", example: true })
    isHasNotParticipationNm: boolean;

    @ApiProperty({ description: "Есть аналитические расчеты", example: true })
    IsHasAnalyticalCalculations: boolean;

    @ApiProperty({ description: "Количество рассчитанных товаров", example: 213263 })
    calculateProductsCount: number;

    @ApiProperty({ description: "Участие в автоматической промоакции", example: true })
    isParticipateInAutoPromo: boolean;

    @ApiProperty({ description: "Автоматическая промоакция", example: null })
    autoPromo: any;

    @ApiProperty({ description: "Рейтинг", type: Ranging })
    ranging: Ranging;

    @ApiProperty({ description: "Свойства SPP", example: null })
    sppProperties: any;

    @ApiProperty({ description: "Рейтинг V2", type: RangingV2 })
    rangingV2: RangingV2;
}
