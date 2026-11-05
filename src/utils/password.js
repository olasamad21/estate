// Prototype only. A real backend handles passwords and email.

export const DEMO_PASSWORD = 'Welcome123';

/**
 * Computes a SHA-256 hash of staffId:password using the browser SubtleCrypto API.
 * Returns a hex string, or null if crypto.subtle is unavailable.
 */
export async function hashPassword(staffId, password) {
  if (!staffId || !password) return null;
  if (
    typeof crypto === 'undefined' ||
    !crypto.subtle ||
    typeof crypto.subtle.digest !== 'function'
  ) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${staffId}:${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

/**
 * Returns an array of { id, label, ok } for password validation rules.
 * Phone number comparison compares digits only.
 */
export function passwordRules(password = '', phone = '') {
  const pwd = typeof password === 'string' ? password : '';
  const ph = typeof phone === 'string' ? phone : '';
  const phoneDigits = ph.replace(/\D/g, '');
  const pwdDigits = pwd.replace(/\D/g, '');

  let containsPhone = false;
  if (phoneDigits.length >= 7) {
    if (pwd.includes(phoneDigits) || pwdDigits.includes(phoneDigits)) {
      containsPhone = true;
    } else {
      // Also compare 7-10 digit local phone without Nigerian country code (234)
      const localPhone = phoneDigits.startsWith('234') ? phoneDigits.slice(3) : phoneDigits;
      if (localPhone.length >= 7 && (pwd.includes(localPhone) || pwdDigits.includes(localPhone))) {
        containsPhone = true;
      }
    }
  }

  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      ok: pwd.length >= 8,
    },
    {
      id: 'letter',
      label: 'Contains a letter',
      ok: /[A-Za-z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'Contains a number',
      ok: /[0-9]/.test(pwd),
    },
    {
      id: 'phone',
      label: 'Does not contain your phone number',
      ok: !containsPhone,
    },
  ];
}

/**
 * Returns true if all password rules pass.
 */
export function isPasswordValid(rules) {
  if (!Array.isArray(rules) || rules.length === 0) return false;
  return rules.every((r) => Boolean(r.ok));
}

/**
 * Verifies a password against a person's record.
 * Only active persons can match.
 * If passwordHash exists, compares with hashPassword.
 * Otherwise, matches DEMO_PASSWORD only if person has status 'active' and passwordHash null.
 */
export async function checkPassword(person, password) {
  if (!person || person.status !== 'active' || typeof password !== 'string') {
    return false;
  }

  if (person.passwordHash) {
    const computedHash = await hashPassword(person.id, password);
    return Boolean(computedHash && computedHash === person.passwordHash);
  }

  // Seeded active person with null passwordHash accepts only DEMO_PASSWORD
  return password === DEMO_PASSWORD;
}
