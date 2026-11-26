const validator = require('validator');

/**
 * نفس طريقة توحيد البريد المستخدمة في التسجيل والدخول (express-validator normalizeEmail).
 * ملاحظة: في Gmail تُحذف النقاط، فـ Eng.Khaled@gmail.com و engkhaled@gmail.com نفس الحساب.
 */
exports.normalizeEmail = (email) => validator.normalizeEmail(String(email || '').trim()) || '';
