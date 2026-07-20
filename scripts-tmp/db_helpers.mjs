import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

export async function getConn() {
  return mysql.createConnection('mysql://root:root@localhost:3306/chindela');
}

export function genRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function insertVerificationToken(conn, userId, purpose) {
  const token = genRawToken();
  const tokenHash = hashToken(token);
  await conn.execute(
    `INSERT INTO verification_tokens (user_id, purpose, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
    [userId, purpose, tokenHash]
  );
  return token;
}

export async function getUserByEmail(conn, email) {
  const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

export async function insertActiveSubscription(conn, { parentId, childId, ageGroupId }) {
  await conn.execute(
    `INSERT INTO subscriptions (parent_id, child_id, age_group_id, duration, price_per_month, total_price, currency, status, start_date, end_date, is_auto_renew)
     VALUES (?, ?, ?, 1, 9.99, 9.99, 'GBP', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 0)`,
    [parentId, childId, ageGroupId]
  );
}
