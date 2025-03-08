const request = require('supertest');
const app = require('../backend/server');

// test GET /api/notifications/:userID
describe('Notification API', () => {
  it('should fetch notifications for a user', async () => {
    const res = await request(app).get('/api/notifications/1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // test POST /api/notifications
  it('should create a new notification', async () => {
    const newNotification = {
      userID: 1,
      message: 'Test notification',
      type: 'info',
    };
    const res = await request(app)
      .post('/api/notifications')
      .send(newNotification);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toEqual('Test notification');
  });

  // test DELETE /api/notifications/:id
  it('should delete a notification', async () => {
    // First, create a notification to delete
    const newNotification = {
      userID: 1,
      message: 'Test notification to delete',
      type: 'info',
    };
    const createRes = await request(app)
      .post('/api/notifications')
      .send(newNotification);
    const notificationId = createRes.body.id;

    // delete the notification
    const deleteRes = await request(app).delete(`/api/notifications/${notificationId}`);
    expect(deleteRes.statusCode).toEqual(204);

    // verify if notification is deleted
    const fetchRes = await request(app).get('/api/notifications/1');
    const deletedNotification = fetchRes.body.find((notif) => notif.id === notificationId);
    expect(deletedNotification).toBeUndefined();
  });

  // test validation for POST /api/notifications
  it('should return 400 if required fields are missing', async () => {
    const invalidNotification = {
      userID: 1,
      // missing message and type
    };
    const res = await request(app)
      .post('/api/notifications')
      .send(invalidNotification);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Missing required fields: userID, message, type');
  });
});