const prometheus = require('prom-client');
const responseTime = require('response-time');

// মেট্রিক্স রেজিস্ট্রি
const register = new prometheus.Registry();
register.setDefaultLabels({ app: 'marnsteak-api' });

prometheus.collectDefaultMetrics({ register });

// কাস্টম মেট্রিক্স
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

register.registerMetric(httpRequestDurationMicroseconds);

// মিডলওয়্যার সেটআপ
const setupMonitoring = (app) => {
  app.use(responseTime((req, res, time) => {
    httpRequestDurationMicroseconds
      .labels(req.method, req.route.path, res.statusCode)
      .observe(time);
  }));

  // মেট্রিক্স এন্ডপয়েন্ট
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
};

module.exports = { setupMonitoring };