"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
  WELCOME: 'WELCOME',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
  ) {
  const THRESHOLD_PERCENTAGE = 40;
  
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Теперь вы отслеживаете цены на ${shortenedTitle}`;
      body = `
        <div>
          <h2>Пользователь, Добро Пожаловать!</h2>
          <p>Название отслеживаемого товара ${product.title}</p>
          <p>Ссылка на отслеживаемый товар: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a></p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Оповещение о самой низкой зафиксированной цене на ${shortenedTitle}`;
      body = `
        <div>
          <p>Привет! На ${product.title} зафиксирована самая низкая цена</p>
          <p>Перейти к карточке товара: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a></p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `${shortenedTitle} продается по скидке`;
      body = `
        <div>
          <p>Привет! На ${product.title} зафиксирована скидка более ${THRESHOLD_PERCENTAGE}%</p>
          <p>Перейти к карточке товара: <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a></p>
        </div>
      `;
      break;

    default:
      throw new Error("Неизвестный тип почтового оповещения...");
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
    
    console.log('Письмо отправлено: ', info);
  })
}