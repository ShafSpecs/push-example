import type { V2_MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { unregisterServiceWorker, subscribeToPush, unsubscribeFromPush, notifyMe, notifyAll } from "~/push.client";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Unable to get permission to notify.');
      }
    }
    );
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      <hr />
      <>
        <h2>Service worker</h2>
        <textarea
          id="registration-status-message"
          defaultValue={"This browser doesn't support service workers."}
        />
        <button id="unregister" onClick={async () => await unregisterServiceWorker()}>
          Unregister service worker
        </button>
        <h2>Subscripton</h2>
        <textarea
          id="subscription-status-message"
          defaultValue={"No push subscription is active."}
        />
        <button id="subscribe" onClick={async () => await subscribeToPush()}>
          Subscribe to push
        </button>
        <button id="unsubscribe" onClick={async () => await unsubscribeFromPush()}>
          Unsubscribe from push
        </button>
        <h2>Notifications</h2>
        <textarea
          id="notification-status-message"
          defaultValue={"No notifications sent yet."}
        />
        <button id="notify-me" onClick={async () => await notifyMe()}>
          Notify me
        </button>
        <button id="notify-all" onClick={async () => await notifyAll()}>
          Notify all
        </button>
      </>

    </div>
  );
}
