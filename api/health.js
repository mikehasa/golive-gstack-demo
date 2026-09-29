module.exports = (req, res) => {
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({ ok: true, ts: new Date().toISOString(), service: 'golive-gstack-demo' });
};
