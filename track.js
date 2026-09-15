const { neon } = require('@neondatabase/serverless');

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}
function clean(v, max=200) { return String(v ?? '').trim().slice(0, max); }
function normalizePhone(v) { return clean(v, 50).replace(/[^\d+]/g, ''); }
function label(status) {
  const map = { pending: 'قيد المراجعة', under_review: 'قيد التدقيق', approved: 'تمت الموافقة', rejected: 'غير مستوفٍ للشروط', completed: 'مكتمل' };
  return map[status] || status || 'غير محدد';
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok:false, error:'Method not allowed' });
  if (!process.env.DATABASE_URL) return json(res, 503, { ok:false, error:'DATABASE_URL is not configured' });
  const body = req.body || {};
  const transactionNumber = clean(body.transactionNumber, 80);
  const phone = normalizePhone(body.phone);
  if (transactionNumber.length < 5 || !phone) return json(res, 400, {ok:false,error:'بيانات التتبع غير مكتملة'});
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT transaction_number, status, created_at, updated_at, grant_type
      FROM public.applications
      WHERE transaction_number = ${transactionNumber}
        AND regexp_replace(phone, '[^0-9+]', '', 'g') = ${phone}
      LIMIT 1
    `;
    if (!rows.length) return json(res, 404, {ok:false,error:'لم يتم العثور على طلب مطابق'});
    const a = rows[0];
    return json(res, 200, {ok:true, application:{
      transactionNumber:a.transaction_number, status:a.status, statusLabel:label(a.status),
      createdAt:a.created_at, updatedAt:a.updated_at, grantType:a.grant_type
    }});
  } catch (error) {
    console.error('Track lookup failed:', error?.message);
    return json(res, 500, {ok:false,error:'تعذر تنفيذ التتبع'});
  }
};