/**
 * Consistent success envelope for every endpoint:
 *   { success: true, message, data, meta? }
 */
class ApiResponse {
  constructor(res, statusCode = 200) {
    this.res = res;
    this.statusCode = statusCode;
  }

  static send(res, { statusCode = 200, message = 'OK', data = null, meta = null } = {}) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static ok(res, data, message = 'OK', meta) {
    return ApiResponse.send(res, { statusCode: 200, message, data, meta });
  }

  static created(res, data, message = 'Created') {
    return ApiResponse.send(res, { statusCode: 201, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
