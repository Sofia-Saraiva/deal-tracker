# Deal Tracker

Deal tracker for monitoring an Amazon product and sending an email alert when it goes on sale.

## Overview

This project uses Node.js to:

- access a specific Amazon product URL;
- extract the original price, discount, and current price using `axios` + `cheerio`;
- check whether a relevant promotion is available;
- send an email via SMTP using `nodemailer`;
- run the check on a daily cron schedule.

The current project structure is:

- `script.js`: main scraping and email-sending logic;
- `index.js`: starts the scheduling with `node-cron` and keeps an Express server running (used only to run the code locally);
- `.env`: environment variables for email authentication.

## Current workflow

1. The project loads the variables from the `.env` file.
2. `script.js` accesses the Amazon product page.
3. The HTML is parsed to find:
   - original price;
   - discount percentage;
   - current price.
4. If a discount is found, the system builds a message and sends an email to the configured address.
5. `index.js` schedules this check to run automatically at the defined time.

## Installation

```bash
npm install
```

## Environment setup

Create a `.env` file in the project root with the following variables:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

> If you are using Gmail, you usually need to generate an app password.

## Running the project

### Immediate check

```bash
node script.js
```

This command runs the check immediately and tries to send an email if a discount is found.

### Scheduled execution

```bash
node index.js
```

This command starts the cron job and also runs the Express server on port `1313`.

## Notes about the workflow

- The cron configured in `index.js` is set to run every day at 08:00:

```js
cron.schedule("0 8 * * *", () => {
  sendEmail();
});
```

- The scraping depends on the current HTML structure of the site, and e-commerce pages can change frequently.
- To avoid authentication issues, keep SMTP credentials in `.env` and never commit them to Git.

## Main dependencies

- `axios` — HTTP requests
- `cheerio` — HTML parsing
- `nodemailer` — email sending
- `dotenv` — environment variable loading
- `node-cron` — task scheduling
- `express` — HTTP server

## Suggested next steps

- allow multiple products to be tracked;
- save price history to a file or database;
- send alerts via WhatsApp or Telegram;
- make the product URL configurable through an environment variable;
- add better logs and more robust error handling.
