"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET'
}

export async function generateEmailBody(
    product: EmailProductInfo,
    type: NotificationType,
) {
    const THRESHOLD_PERCENTAGE = 20;
    const shortenedTitle = product.title.length > 20 ?
    `${product.title.substring(0, 20)}...` :
    product.title

    let subject = '';
    let body = '';

    switch (type) {
        case Notification.WELCOME:
            subject = `Добро пожаловать в PriceWatcher, отслеживаем товар ${shortenedTitle}`
            body = `
                <div>
                    <h2>Добро пожаловать в PriceWatcher</h2>
                    <p>Отслеживаем товар ${product.title}</p>
                    <p>Посмотреть товар по ссылке: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                </div>
            `
            break;
        case Notification.CHANGE_OF_STOCK:
            subject = `${shortenedTitle} снова в наличии!`;
            body = `
                <div>
                    <h4>${product.title} снова в наличии!</h4>
                    <p>Посмотреть товар по ссылке: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                </div>
            `;
            break;
        case Notification.LOWEST_PRICE:
            subject = `На ${shortenedTitle} зафиксирована самая низкая цена`;
            body = `
                <div>
                    <h4>${product.title} продаётся по самой низкой зафиксированной цене!</h4>
                    <p>Посмотреть товар по ссылке: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                </div>
            `;
            break;
        case Notification.THRESHOLD_MET:
            subject = `Discount Alert for ${shortenedTitle}`;
            body = `
                <div>
                    <h4>${product.title} доступен по скидке более чем в ${THRESHOLD_PERCENTAGE}%!</h4>
                    <p>Посмотреть товар по ссылке: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                </div>
            `;
            break;
        default:
            throw new Error("Invalid notification type.");
    }

    return { subject, body };
}


const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
      user: 'kibardin_timofey@outlook.com',
      pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1
});

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
    const mailOptions = {
      from: 'kibardin_timofey@outlook.com',
      to: sendTo,
      html: emailContent.body,
      subject: emailContent.subject,
    }
  
    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if(error) return console.log(error);
      
      console.log('Email sent: ', info);
    })
  }