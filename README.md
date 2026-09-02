# Deal Tracker

Deal tracker for monitoring an Amazon product and sending an email alert when it goes on sale.

## Overview

This Node.js project:

- fetches an Amazon product page;
- extracts the original price, discount, and current price with `axios` and `cheerio`;
- sends an email through Gmail SMTP with `nodemailer` when a discount is found;
- runs automatically through GitHub Actions.

## Project structure

- `script.js`: scrapes the product page and sends the email alert;
- `.github/workflows/cron-job.yml`: GitHub Actions workflow for the automated check;
- `.env`: local environment variables. This file must not be committed.

## Workflow

1. The application reads `URL`, `SMTP_USER`, and `SMTP_PASS` from the environment.
2. `script.js` requests the configured Amazon product URL.
3. The response HTML is parsed to find the original price, discount, and current price.
4. If no discount is found, the process ends without sending an email.
5. If a discount is found, an email is sent to the configured SMTP user.

## Local setup

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
URL=https://www.amazon.com/product-url
```

For Gmail, use an app password instead of your regular account password.

### Run an immediate check

```bash
node script.js
```

## GitHub Actions workflow

The workflow is defined in `.github/workflows/cron-job.yml` and runs:

- automatically every day at `08:00 UTC`;
- manually from the GitHub Actions page through `workflow_dispatch`.

The workflow runs on `ubuntu-latest`, uses Node.js `24`, installs the dependencies, and executes:

```bash
npm install
node script.js
```

### Configure GitHub Secrets

The workflow does not use the local `.env` file. Add these repository secrets in **Settings > Secrets and variables > Actions**:

| Secret | Value |
| --- | --- |
| `SMTP_USER` | Gmail address used to send the alert |
| `SMTP_PASS` | Gmail app password |
| `URL` | Full Amazon product URL |

The workflow exposes them to Node.js as environment variables:

```yaml

  SMTP_USER: ${{ secrets.SMTP_USER }}
  SMTP_PASS: ${{ secrets.SMTP_PASS }}
  URL: ${{ secrets.URL }}
```

Do not add quotes or a trailing semicolon to the secret values. Never commit `.env` or credentials to the repository.

## Notes

- The Amazon page structure may change, which can break the CSS selectors used by the scraper.
- The GitHub Actions cron uses UTC.

## Main dependencies

- `axios`: HTTP requests
- `cheerio`: HTML parsing
- `dotenv`: local environment variable loading
- `nodemailer`: email sending
- `express`: local HTTP server
