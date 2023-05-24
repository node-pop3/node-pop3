import {readFileSync} from 'fs';
import {SMTPClient} from 'emailjs';
import Pop3Command from '../../src/Command.js';

const config = JSON.parse(
  // @ts-expect-error It's ok
  readFileSync(
    new URL('../../pop.config.json', import.meta.url)
  )
);

const smtpClient = new SMTPClient({
  host: config.host,
  user: config.user,
  password: config.password,
  timeout: config.timeout,
  // Todo: Make configurable
  ssl: true
});

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
  return smtpClient.sendAsync({
    from: config.user,
    to,
    subject,
    text: attachment[0].data,
    attachment
  });
}

/**
 * @returns {Promise<void>}
 */
async function deleteMessage () {
  const pop3Command = new Pop3Command(config);
  await pop3Command.connect();
  await pop3Command.command('USER', config.user);
  await pop3Command.command('PASS', config.password);
  await pop3Command.DELE(1);
  await pop3Command.QUIT();
}

export {seedMessage, deleteMessage};
