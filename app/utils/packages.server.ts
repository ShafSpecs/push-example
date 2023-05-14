import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { resolve } from "path";

const webpush = require("web-push");

const dbPath = resolve(__dirname, "../", `db.json`);

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT,
};

const adapter = new JSONFile(dbPath);
const defaultData = { subscriptions: [] };
const db = new Low(adapter, defaultData);

const sendNotifications = (subscriptions: any[]) => {
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
    },
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails,
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach((subscription) => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result: { statusCode: any }) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error: any) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
};

export { db, vapidDetails, resolve, sendNotifications };
