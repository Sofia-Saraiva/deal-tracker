const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function webScrapingAmazon() {
  const url = process.env.URL;
  
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const originalPrice = $('span.a-offscreen').text().trim();
    const originalPriceTrim = (originalPrice.match(/R\$\s?\d{1,3}(?:[.\s]\d{3})*,\d{2}/g) || [])[0] || 'Não encontrado';

    const discountSelector = 'span.a-size-large.a-color-price.savingPriceOverride.aok-align-center.reinventPriceSavingsPercentageMargin.savingsPercentage.apex-savings-percentage';
    const discountNode = $(discountSelector).first();
    const discount = discountNode.length ? discountNode.text().trim() : null;

    const price = $('span.a-price-whole').first().text().trim();
    const cents = $('span.a-price-fraction').first().text().trim();
    const priceNow = price ? `${price}${cents}` : 'Não encontrado';

    if (!discount) {
      return false;
    }

    return {
      originalPrice: originalPriceTrim,
      discount,
      priceNow,
    };

  } catch (erro) {
    console.error('Error scraping:', erro.message);
    return false;
  }
}

async function sendEmail() {
  const result = await webScrapingAmazon();
  if (!result) {
    console.log('No discount. Email not sent.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
  });

  const textoEmail = `
    Original price: ${result.originalPrice}
    Discount: ${result.discount}
    Current price: ${result.priceNow}
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: '[DISCOUNT]: Mikasa Bola de Vôlei de Quadra Oficial!!',
    text: textoEmail,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
}

sendEmail();