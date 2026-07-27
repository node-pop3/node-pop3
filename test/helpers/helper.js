import {readFileSync} from 'fs';
import {setTimeout as delayPromise} from 'node:timers/promises';
import {SMTPClient} from 'emailjs';
import Pop3Command from '../../src/Command.js';

const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 3;

const config = JSON.parse(
  // @ts-expect-error It's ok
  // eslint-disable-next-line n/no-sync -- Testing
  readFileSync(
    new URL('../../pop.config.json', import.meta.url)
  )
);

/**
 * @returns {SMTPClient}
 */
function createSmtpClient () {
  return new SMTPClient({
    host: config.host,
    user: config.user,
    password: config.password,
    timeout: config.timeout,
    // Todo: Make configurable
    ssl: true
  });
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function delay (ms) {
  await delayPromise(ms);
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
function isIgnorableDeleteError (err) {
  return Boolean(
    err &&
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    (/(?:there(?:'s| is)? no message 1|message 1)/vi).test(err.message)
  );
}

/**
 * @param {{
 *   subject: string,
 *   html: string,
 *   to?: string
 * }} cfg
 * @returns {Promise<import('emailjs').Message>}
 */
function seedMessage ({subject, html, to = config.user}) {
  const attachment = [{data: html, alternative: true}];

  const sendWithRetries = async (attempt = MAX_RETRIES) => {
    try {
      const smtpClient = createSmtpClient();
      return await smtpClient.sendAsync({
        from: config.user,
        to,
        subject,
        text: attachment[0].data,
        attachment
      });
    } catch (err) {
      if (attempt <= 1) {
        throw err;
      }
      await delay(RETRY_DELAY_MS * (MAX_RETRIES - attempt + 1));
      return sendWithRetries(attempt - 1);
    }
  };

  return sendWithRetries();
}

/**
 * @returns {Promise<void>}
 */
function deleteMessage () {
  const deleteWithRetries = async (attempt = MAX_RETRIES) => {
    const pop3Command = new Pop3Command(config);
    try {
      await pop3Command.connect();
      await pop3Command.command('USER', config.user);
      await pop3Command.command('PASS', config.password);
      await pop3Command.DELE(1);
      await pop3Command.QUIT();
      return undefined;
    } catch (err) {
      try {
        await pop3Command.QUIT();
      } catch {
        // Ignore cleanup errors
      }
      if (attempt > 1 && !isIgnorableDeleteError(err)) {
        await delay(RETRY_DELAY_MS * (MAX_RETRIES - attempt + 1));
        return deleteWithRetries(attempt - 1);
      }
      return undefined;
    }
  };

  return deleteWithRetries();
}

export {seedMessage, deleteMessage};
