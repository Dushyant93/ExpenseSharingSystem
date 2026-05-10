// Observer Pattern - Notification System
//
// PATTERN: Observer (also called Publish-Subscribe)
// WHAT IT DOES: When an expense is added/updated/deleted, all group members
// automatically get a notification WITHOUT the expense controller knowing about it.
//
// WHY WE USE IT: Without Observer, the expense controller would need to know about
// notifications and manually create them. This creates tight coupling. With Observer,
// the expense controller just fires an event and the notification system handles the rest.
// We can add new observers (e.g. email alerts) without changing any existing code.
//
// OOP PRINCIPLE: Separation of Concerns - expense logic and notification logic
// are completely separate. One does not depend on the other.

const Notification = require('../models/Notification');
const Group = require('../models/Group');

//  Observer Interface (Abstraction) 
// OOP Principle: Abstraction - defines what an observer must implement
class Observer {
  async update(event, data) {
    throw new Error('update() must be implemented by subclass');
  }
}

//  Concrete Observer: Notification Observer 
// Creates a notification in the database for each group member
class NotificationObserver extends Observer {
  async update(event, data) {
    try {
      const { groupId, triggeredBy, message } = data;

      // Find all members in this group
      const group = await Group.findById(groupId);
      if (!group) return;

      // Create a notification for every member except the one who triggered the event
      const notifications = group.members
        .filter((memberId) => memberId.toString() !== triggeredBy.toString())
        .map((memberId) => ({
          userId: memberId,
          message,
          type: event,
        }));

      // Save all notifications at once
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      // Don't crash the app if notifications fail
      console.error('Notification observer error:', error.message);
    }
  }
}

// Subject (Event Emitter) 
// The subject keeps a list of observers and notifies them all when an event fires
class ExpenseEventEmitter {
  constructor() {
    // List of registered observers
    this.observers = [];
  }

  // Add an observer to the list
  subscribe(observer) {
    this.observers.push(observer);
  }

  // Remove an observer from the list
  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  // Notify all observers about an event
  async notify(event, data) {
    for (const observer of this.observers) {
      await observer.update(event, data);
    }
  }
}

// Create a single instance of the emitter (used across controllers)
// This also demonstrates Singleton - one event emitter for the whole app
const expenseEmitter = new ExpenseEventEmitter();

// Register the notification observer once
expenseEmitter.subscribe(new NotificationObserver());

module.exports = { expenseEmitter, ExpenseEventEmitter, NotificationObserver };
