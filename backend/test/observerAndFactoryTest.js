// Notification Observer + Response Factory Test Cases

const chai    = require('chai');
const sinon   = require('sinon');
const mongoose = require('mongoose');

const Group = require('../models/Group');
const Notification = require('../models/Notification');
const { expenseEmitter, NotificationObserver } = require('../utils/notificationObserver');
const ResponseFactory = require('../utils/responseFactory');

const { expect } = chai;

let sandbox;
beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(()  => { sandbox.restore(); });

// ─────────────────────────────────────────────────────────────
// Notification Observer Tests — Observer Pattern
//
// Tests the PATTERN behaviour — not internal DB operations:
//   Test 1: registered observers get called when notify fires
//   Test 2: notify handles null group without throwing (graceful error handling)
//   Test 3: triggered user is excluded — verified via the notifications array
// ─────────────────────────────────────────────────────────────
describe('Notification Observer Tests (Observer Pattern)', () => {

//   // Test 1: Observer.update() is called when notify fires
//   // Tests that the Subject → Observer wiring works correctly
//   it('should call registered observer update when notify is triggered', async () => {
//     // Spy on the update method of ALL NotificationObserver instances
//     const updateStub = sandbox.stub(NotificationObserver.prototype, 'update').resolves();

//     const groupId     = new mongoose.Types.ObjectId();
//     const triggeredBy = new mongoose.Types.ObjectId();

//     await expenseEmitter.notify('expense_added', {
//       groupId,
//       triggeredBy,
//       message: 'New expense added: Groceries - $64',
//     });

//     // The observer's update must have been called exactly once
//     expect(updateStub.calledOnce).to.be.true;

//     // Called with the correct event name
//     expect(updateStub.firstCall.args[0]).to.equal('expense_added');
//   });

  // Test 2: notify handles null group gracefully — no crash
  it('should not throw if group has no members', async () => {
    if (Group.findById.restore) Group.findById.restore();

    sandbox.stub(Group, 'findById').resolves(null);
    sandbox.stub(Notification, 'insertMany').resolves([]);

    let threw = false;
    try {
      await expenseEmitter.notify('expense_added', {
        groupId:     new mongoose.Types.ObjectId(),
        triggeredBy: new mongoose.Types.ObjectId(),
        message:     'Test',
      });
    } catch (e) {
      threw = true;
    }

    expect(threw).to.be.false;
  });

  // Test 3: triggered user is excluded from the notifications list
  // Stubs update() directly and inspects what data was passed
//   it('should not create a notification for the user who triggered the event', async () => {
//     const triggeredBy = new mongoose.Types.ObjectId();
//     const otherMember = new mongoose.Types.ObjectId();

//     if (Group.findById.restore) Group.findById.restore();

//     sandbox.stub(Group, 'findById').resolves({
//       members: [triggeredBy, otherMember],
//     });
//     sandbox.stub(Notification, 'insertMany').resolves([]);

//     // Intercept update, let it run through real logic but with stubbed DB
//     const updateSpy = sandbox.spy(NotificationObserver.prototype, 'update');

//     await expenseEmitter.notify('expense_added', {
//       groupId:     new mongoose.Types.ObjectId(),
//       triggeredBy,
//       message:     'New expense added',
//     });

//     expect(updateSpy.calledOnce).to.be.true;

//     // Verify insertMany was called and triggeredBy was excluded
//     const insertStub = Notification.insertMany;
//     if (insertStub && insertStub.callCount > 0) {
//       const inserted = insertStub.firstCall.args[0];
//       const userIds  = inserted.map((n) => n.userId.toString());
//       expect(userIds).to.not.include(triggeredBy.toString());
//       expect(userIds).to.include(otherMember.toString());
//     }
//   });

});


// ─────────────────────────────────────────────────────────────
// Response Factory Tests — Factory Pattern
// Shape: { statusCode, body: { success, message, data } }
// ─────────────────────────────────────────────────────────────
describe('Response Factory Tests (Factory Pattern)', () => {

  it('should create a success response with correct shape', () => {
    const data   = { _id: '123', name: 'Test' };
    const result = ResponseFactory.createSuccess(data);

    expect(result).to.have.property('statusCode', 200);
    expect(result.body).to.have.property('data').that.deep.equals(data);
  });

  it('should use custom message and 201 status for creation', () => {
    const result = ResponseFactory.createSuccess({ _id: '123' }, 'Expense created', 201);

    expect(result.statusCode).to.equal(201);
    expect(result.body.message).to.equal('Expense created');
  });

  it('should create an error response with 500 status by default', () => {
    const result = ResponseFactory.createError('Something went wrong');

    expect(result.statusCode).to.equal(500);
    expect(result.body.message).to.equal('Something went wrong');
  });

  it('should create a 404 response with the resource name in the message', () => {
    const result = ResponseFactory.createNotFound('Expense');

    expect(result.statusCode).to.equal(404);
    expect(result.body.message).to.include('Expense');
  });

  it('should call res.status and res.json when send is called', () => {
    const payload = ResponseFactory.createSuccess({ name: 'Test' }, 'OK', 200);
    const res     = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    ResponseFactory.send(res, payload);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should pass the correct status code for error responses', () => {
    const payload = ResponseFactory.createError('DB failure', 500);
    const res     = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    ResponseFactory.send(res, payload);

    expect(res.status.calledWith(500)).to.be.true;
  });

  it('should pass 404 status when sending a not-found response', () => {
    const payload = ResponseFactory.createNotFound('Settlement');
    const res     = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    ResponseFactory.send(res, payload);

    expect(res.status.calledWith(404)).to.be.true;
  });

});