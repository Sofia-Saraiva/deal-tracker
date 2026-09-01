const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function webScrapingAmazon() {
  const url = 'https://www.amazon.com.br/Bola-de-V%C3%B4lei-V200W-Mikasa/dp/B07NJ1FR4K/ref=pd_ci_mcx_mh_mcx_views_0_title?pd_rd_w=79XfA&content-id=amzn1.sym.87e935c8-d687-4dd4-9dbf-8b9bdbb5018e%3Aamzn1.symc.c3d5766d-b606-46b8-ab07-1d9d1da0638a&pf_rd_p=87e935c8-d687-4dd4-9dbf-8b9bdbb5018e&pf_rd_r=YK9S06S57FSYTNRWNQ9A&pd_rd_wg=3DIgW&pd_rd_r=411b3d57-8d0c-4283-bde0-872a2644f581&pd_rd_i=B07NJ1FR4K&th=1';
  //const url = 'https://www.amazon.com.br/vida-sem-amarras-significado-inspira%C3%A7%C3%A3o/dp/6555646780/?_encoding=UTF8&pd_rd_w=BVLLu&content-id=amzn1.sym.761077be-03f4-471e-82eb-e510d48b59aa&pf_rd_p=761077be-03f4-471e-82eb-e510d48b59aa&pf_rd_r=V6WFQREEKJNG6YF4B0W6&pd_rd_wg=nVkFo&pd_rd_r=0f2b7128-e578-464c-96b4-4278451c7402&ref_=pd_hp_d_r_atf_mtech-exp-p13ndeals';
  //const url = 'https://www.amazon.com.br/Caneta-Esferogr%C3%A1fica-CIS-Multicor-unidades/dp/B09S6WM1QK/?_encoding=UTF8&pd_rd_w=zgVGM&content-id=amzn1.sym.761077be-03f4-471e-82eb-e510d48b59aa&pf_rd_p=761077be-03f4-471e-82eb-e510d48b59aa&pf_rd_r=QY79JYJ3XNR1WV3KAMR5&pd_rd_wg=Gt8Qt&pd_rd_r=543fb880-bdb4-4de1-bd5f-085312f68525&ref_=pd_hp_d_r_atf_mtech-exp-p13ndeals'; 

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