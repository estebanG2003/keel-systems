import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contact } from '../config.js';

test('whatsapp number is filled in and digits only', () => {
  assert.notEqual(contact.whatsapp, 'REPLACE_WITH_REAL_NUMBER',
    'Fill contact.whatsapp in config.js with the real number before deploying');
  assert.match(contact.whatsapp, /^\d{10,15}$/,
    'whatsapp must be digits only, international format, no + or spaces');
});

test('email is filled in and looks like an address', () => {
  assert.match(contact.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
});
