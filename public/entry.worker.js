// app/entry.worker.ts
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
});
var LoggingPlugin = class {
  async pushReceived({ event, state }) {
    console.log("Push received:", event);
  }
  async pushClicked({ event, state }) {
    console.log("Push clicked:", event);
  }
  async pushDismissed({ event, state }) {
    console.log("Push dismissed:", event);
  }
  async error({ event, state }) {
    console.log("Push error:", event);
  }
};
var AnalyticsPlugin = class {
  constructor(options = {}) {
    this.options = {
      trackPushReceived: true,
      trackPushClicked: true,
      trackPushDismissed: true,
      trackPushError: true,
      ...options
    };
  }
  async pushReceived({ event, state }) {
    if (this.options.trackPushReceived) {
      console.log("Push received:", event.data.text());
    }
  }
  async pushClicked({ event, state }) {
    if (this.options.trackPushClicked) {
      console.log("Push clicked:", event.notification.data.url);
    }
  }
  async pushDismissed({ event, state }) {
    if (this.options.trackPushDismissed) {
      console.log("Push dismissed:", event.notification.data.id);
    }
  }
  async error({ event, state }) {
    if (this.options.trackPushError) {
      console.log("Push error:", error);
    }
  }
};
var PushStrategy = class {
  constructor(plugins = []) {
    this.plugins = plugins;
  }
  async applyPlugins(pluginMethod, args) {
    const promises = this.plugins.map(async (plugin) => {
      if (plugin[pluginMethod]) {
        await plugin[pluginMethod](args);
      }
    });
    await Promise.all(promises);
  }
};
var CustomPushStrategy = class extends PushStrategy {
  constructor({ plugins } = {}) {
    super();
    this.plugins = plugins || [];
  }
  async handlePush(event) {
    const env = {
      event,
      state: {}
    };
    for (const plugin of this.plugins) {
      if (plugin.pushReceived) {
        await plugin.pushReceived(env);
      }
    }
    const options = {
      body: "This is a push notification!",
      icon: "path/to/icon.png",
      data: {
        url: "https://example.com"
      }
    };
    await self.registration.showNotification("Push Notification", options);
  }
  async handleNotificationClick(event) {
    const env = {
      event,
      state: {}
    };
    for (const plugin of this.plugins) {
      if (plugin.pushClicked) {
        await plugin.pushClicked(env);
      }
    }
    if (event.notification.data && event.notification.data.url) {
      await self.clients.openWindow(event.notification.data.url);
    }
    event.notification.close();
  }
  async handleNotificationClose(event) {
    const env = {
      event,
      state: {}
    };
    for (const plugin of this.plugins) {
      if (plugin.pushDismissed) {
        await plugin.pushDismissed(env);
      }
    }
  }
  async handleError(error2) {
    for (const plugin of this.plugins) {
      if (plugin.error) {
        await plugin.error({ event: error2 });
      }
    }
  }
};
var pushStrategy = new CustomPushStrategy({
  plugins: [new LoggingPlugin(), new AnalyticsPlugin()]
});
self.addEventListener("push", (event) => {
  pushStrategy.handlePush(event);
});
self.addEventListener("notificationclick", (event) => {
  pushStrategy.handleNotificationClick(event);
});
self.addEventListener("notificationclose", (event) => {
  pushStrategy.handleNotificationClose(event);
});
self.addEventListener("error", (error2) => {
  pushStrategy.handleError(error2);
});
