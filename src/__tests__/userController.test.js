const request = require('supertest');
const app = require('../app');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');

const mockToken = jwt.sign(
  { id: '12345', email: 'test@example.com' }, // Mock user payload
  process.env.JWT_SECRET || 'testsecret',    // Use your JWT secret
  { expiresIn: '1h' }                        // Token expiration
);
jest.mock('../models/Course');

describe('User Controller - getEnrolledCourses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enrolled courses for a valid user', async () => {
    const mockCourses = [
      { id: '1', name: 'Course 1', students: ['12345'] },
      { id: '2', name: 'Course 2', students: ['12345'] },
    ];
    Course.find.mockResolvedValue(mockCourses);

    const response = await request(app)
      .get('/api/lms/user/enrolled-courses')
      .set('Authorization', `Bearer ${mockToken}`) // Simulate authentication
      .expect(200);

    expect(response.body.courses).toEqual(mockCourses);
  });

  it('should return 404 if no courses are found', async () => {
    Course.find.mockResolvedValue([]);

    const response = await request(app)
      .get('/api/lms/user/enrolled-courses')
      .set('Authorization', 'Bearer mockToken')
      .expect(404);

    expect(response.body.message).toBe('No enrolled courses found');
  });

  it('should return 500 for server error', async () => {
    Course.find.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/lms/user/enrolled-courses')
      .set('Authorization', 'Bearer mockToken')
      .expect(500);

    expect(response.body.message).toBe('Server error');
  });
});