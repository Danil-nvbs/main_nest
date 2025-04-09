import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

class Photo {
    @ApiProperty({ description: "Ссылка на изображение.", example: "https://cdn1.ozone.ru/s3/rp-photo-5/777183cc-9bcc-40e5-acea-4351717c9065.jpeg" })
    url: string;

    @ApiProperty({ description: "Ширина изображения.", example: 900 })
    width: number;

    @ApiProperty({ description: "Высота изображения.", example: 1200 })
    height: number;
}

class Video {
    @ApiProperty({ description: "Ссылка на превью видео.", example: "https://example.com/preview.mp4" })
    preview_url: string;

    @ApiProperty({ description: "Ссылка на короткое видео.", example: "https://example.com/short_video.mp4" })
    short_video_preview_url: string;

    @ApiProperty({ description: "Ссылка на видео.", example: "https://example.com/video.mp4" })
    url: string;

    @ApiProperty({ description: "Ширина видео.", example: 1280 })
    width: number;

    @ApiProperty({ description: "Высота видео.", example: 720 })
    height: number;
}

export class FeedbackDetailsApiDto {
    @ApiProperty({ description: "Количество комментариев к отзыву.", example: 1 })
    comments_amount: number;

    @ApiProperty({ description: "Количество дизлайков на отзыве.", example: 0 })
    dislikes_amount: number;

    @ApiProperty({ description: "Идентификатор отзыва.", example: "018d555c-fc25-7bd6-61b1-4ca34a8e729e" })
    id: string;

    @ApiProperty({ description: "true, если отзыв участвует в подсчёте рейтинга.", example: true })
    is_rating_participant: boolean;

    @ApiProperty({ description: "Количество лайков на отзыве.", example: 0 })
    likes_amount: number;

    @ApiProperty({ description: "Статус заказа, на который покупатель оставил отзыв: DELIVERED — доставлен, CANCELLED — отменён.", example: "DELIVERED" })
    order_status: string;

    @ApiProperty({ description: "Информация об изображениях.", type: [Photo] })
    @IsArray()
    photos: Photo[];

    @ApiProperty({ description: "Количество изображений у отзыва.", example: 2 })
    photos_amount: number;

    @ApiProperty({ description: "Дата публикации отзыва.", example: "2025-01-25T16:16:35.737076Z" })
    published_at: string;

    @ApiProperty({ description: "Оценка отзыва.", example: 5 })
    rating: number;

    @ApiProperty({ description: "Идентификатор товара в системе Ozon — SKU.", example: 975930201 })
    sku: number;

    @ApiProperty({ description: "Статус отзыва: UNPROCESSED — не обработан, PROCESSED — обработан.", example: "PROCESSED" })
    status: string;

    @ApiProperty({ description: "Текст отзыва.", example: "На длительность зарядки не проверяла, надеюсь будет долго работать..." })
    text: string;

    @ApiProperty({ description: "Информация о видео.", type: [Video] })
    @IsArray()
    videos: Video[];

    @ApiProperty({ description: "Количество видео у отзыва.", example: 0 })
    videos_amount: number;
}
