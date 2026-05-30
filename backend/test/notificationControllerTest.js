// Notification Controller Test Cases
// Covers: getNotifications, getUnreadCount, markAllAsRead, markAsRead

const chai         = require('chai');
const sinon        = require('sinon');
const mongoose     = require('mongoose');
const Notification = require('../models/Notification');
const {
  getNotifications,
  getUnreadCount,
  markAllAsRead,   // was markAllRead — correct export name
  markAsRead,      // was markOneRead — correct export name
} = require('../controllers/notificationController');

const { expect } = chai;

let sandbox;
beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(()  => { sandbox.restore(); });

describe('Notification Controller Tests', () => {

  //  Test 1: GET ALL — Success 
  describe('getNotifications', () => {
    it('should return all notifications for the logged-in user', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      const mockNotifications = [
        { _id: new mongoose.Types.ObjectId(), message: 'New expense added', isRead: false },
        { _id: new mongoose.Types.ObjectId(), message: 'Expense updated',   isRead: true  },
      ];

      // Controller chains .sort().limit()
      sandbox.stub(Notification, 'find').returns({
        sort:  sinon.stub().returns({
          limit: sinon.stub().resolves(mockNotifications),
        }),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getNotifications(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 2: GET ALL — DB Error 
    it('should return 500 if fetch fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'find').returns({
        sort: sinon.stub().returns({
          limit: sinon.stub().throws(new Error('DB Error')),
        }),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getNotifications(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  //  Test 3: GET UNREAD COUNT — Success 
  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'countDocuments').resolves(3);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getUnreadCount(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 4: GET UNREAD COUNT — Zero unread 
    it('should return 0 when all notifications are read', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'countDocuments').resolves(0);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getUnreadCount(req, res);

      expect(res.json.calledOnce).to.be.true;
    });
  });

  //  Test 5: MARK ALL READ — Success 
  describe('markAllAsRead', () => {
    it('should mark all notifications as read for the user', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'updateMany').resolves({ modifiedCount: 3 });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await markAllAsRead(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 6: MARK ALL READ — DB Error 
    it('should return 500 if updateMany fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'updateMany').throws(new Error('DB Error'));

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await markAllAsRead(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  //  Test 7: MARK ONE READ — Success 
  // Controller uses findByIdAndUpdate (not findById + save)
  describe('markAsRead', () => {
    it('should mark a single notification as read', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const req    = { params: { id: mockId }, user: { id: new mongoose.Types.ObjectId() } };

      const mockNotification = { _id: mockId, isRead: true };

      sandbox.stub(Notification, 'findByIdAndUpdate').resolves(mockNotification);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await markAsRead(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 8: MARK ONE READ — Not Found 
    it('should return 404 if notification not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Notification, 'findByIdAndUpdate').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await markAsRead(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

});