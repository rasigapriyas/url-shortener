const ok = (data, status = 200) => ({
  ok: true,
  status,
  ...data,
});

const fail = (message, status = 400, details = undefined) => ({
  ok: false,
  status,
  message,
  details,
});

const send = (res, result) => {
  const status = result.status || (result.ok === false ? 400 : 200);
  const body = { ...result };
  delete body.status;
  delete body.ok;
  return res.status(status).json(body);
};

module.exports = {
  ok,
  fail,
  send,
};
