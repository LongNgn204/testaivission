import { apiClient } from '../apiClient';

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('GET Requests', () => {
    it('should make successful GET request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
      });

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ data: 'test' });
      expect(response.status).toBe(200);
    });

    it('should handle GET request errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('POST Requests', () => {
    it('should make successful POST request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, name: 'test' }),
      });

      const response = await apiClient.post('/api/test', { name: 'test' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1, name: 'test' });
      expect(response.status).toBe(201);
    });

    it('should send request body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.post('/api/test', { key: 'value' });

      const call = (global.fetch as jest.Mock).mock.calls[0];
      expect(call[1].body).toContain('key');
      expect(call[1].body).toContain('value');
    });
  });

  describe('PUT Requests', () => {
    it('should make successful PUT request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true }),
      });

      const response = await apiClient.put('/api/test/1', { name: 'updated' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ updated: true });
    });
  });

  describe('DELETE Requests', () => {
    it('should make successful DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      const response = await apiClient.delete('/api/test/1');

      expect(response.success).toBe(true);
      expect(response.status).toBe(204);
    });
  });

  describe('PATCH Requests', () => {
    it('should make successful PATCH request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ patched: true }),
      });

      const response = await apiClient.patch('/api/test/1', { status: 'active' });

      expect(response.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should handle 400 validation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid input' }),
      });

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle 401 auth errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const response = await apiClient.get('/api/test');

      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ message: 'Server error' }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        };
      });

      const response = await apiClient.get('/api/test', { retry: 3, retryDelay: 10 });

      expect(response.success).toBe(true);
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(1);
    });

    it('should give up after max retries', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const response = await apiClient.get('/api/test', { retry: 2, retryDelay: 10 });

      expect(response.success).toBe(false);
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
    });
  });

  describe('Request Options', () => {
    it('should set custom headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/api/test', {
        headers: { 'X-Custom': 'value' },
      });

      const call = (global.fetch as jest.Mock).mock.calls[0];
      expect(call[1].headers['X-Custom']).toBe('value');
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const response = await apiClient.get('/api/test', { timeout: 100 });

      expect(response.success).toBe(false);
    });
  });
});

