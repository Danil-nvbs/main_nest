import { Injectable } from '@nestjs/common';
import * as TelegramApi from 'node-telegram-bot-api';

@Injectable()
export class TelegramBotService {
    constructor() {}

    async sendMessage({ message = '', chatId = process.env.SCRIPT_NOTIFICATIONS_TELEGRAM_ID }) {
        const bot = new TelegramApi(process.env.TELEGRAM_BOT_TOKEN);
    
        const now = new Date();
        const dateTime = `${now.toLocaleDateString('ru-RU')}  ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (${now.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase()})`;
        const fullMessage = `${dateTime} ${message}`;
    
        return await bot.sendMessage(chatId, fullMessage);
    }
}
