/// <reference lib="WebWorker" />

// Service Workers are quite broken in ts, this is a workaround
export type {};
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
});

interface PushHandlerEnv {
  event: PushEvent | NotificationEvent | ErrorEvent;
  state?: Record<string, any>;
}

interface PushHandlerPlugin {
  pushReceived?(event: PushHandlerEnv): Promise<void>;
  pushClicked?(event: PushHandlerEnv): Promise<void>;
  pushDismissed?(event: PushHandlerEnv): Promise<void>;
  error?(error: PushHandlerEnv): Promise<void>;
}

class LoggingPlugin implements PushHandlerPlugin {
  async pushReceived({ event, state }: PushHandlerEnv) {
    console.log("Push received:", event);
  }

  async pushClicked({ event, state }: PushHandlerEnv) {
    console.log("Push clicked:", event);
  }

  async pushDismissed({ event, state }: PushHandlerEnv) {
    console.log("Push dismissed:", event);
  }

  async error({ event, state }: PushHandlerEnv) {
    console.log("Push error:", event);
  }
}

interface AnalyticsPluginOptions {
  trackPushReceived?: boolean;
  trackPushClicked?: boolean;
  trackPushDismissed?: boolean;
  trackPushError?: boolean;
}

class AnalyticsPlugin implements PushHandlerPlugin {
  private options: AnalyticsPluginOptions;

  constructor(options: AnalyticsPluginOptions = {}) {
    this.options = {
      trackPushReceived: true,
      trackPushClicked: true,
      trackPushDismissed: true,
      trackPushError: true,
      ...options,
    };
  }

  async pushReceived({ event, state }: PushHandlerEnv): Promise<void> {
    if (this.options.trackPushReceived) {
      // Send push received event to analytics service
      console.log("Push received:", event.data.text());
    }
  }

  async pushClicked({ event, state }: PushHandlerEnv): Promise<void> {
    if (this.options.trackPushClicked) {
      // Send push clicked event to analytics service
      console.log("Push clicked:", event.notification.data.url);
    }
  }

  async pushDismissed({ event, state }: PushHandlerEnv): Promise<void> {
    if (this.options.trackPushDismissed) {
      // Send push dismissed event to analytics service
      console.log("Push dismissed:", event.notification.data.id);
    }
  }

  async error({ event, state }: PushHandlerEnv): Promise<void> {
    if (this.options.trackPushError) {
      // Send push error event to analytics service
      console.log("Push error:", error);
    }
  }
}

abstract class Push {
  protected plugins: PushHandlerPlugin[];

  constructor(plugins: PushHandlerPlugin[] = []) {
    this.plugins = plugins;
  }

  protected async applyPlugins(
    pluginMethod: keyof PushHandlerPlugin,
    args: PushHandlerEnv
  ) {
    const promises = this.plugins.map(async (plugin) => {
      if (plugin[pluginMethod]) {
        await plugin[pluginMethod]!(args);
      }
    });
    await Promise.all(promises);
  }

  abstract handlePush(event: PushEvent): Promise<void>;
}

class CustomPush extends Push {
  private options;

  constructor({
    plugins,
    options,
  }: { plugins?: PushHandlerPlugin[]; options?: NotificationOptions } = {}) {
    super();
    this.options = options || {
      body: "This is a push notification!",
      icon: "path/to/icon.png",
      data: {
        url: "https://example.com",
      },
    };
    this.plugins = plugins || [];
  }

  async handlePush(event: PushEvent): Promise<void> {
    const env: PushHandlerEnv = {
      event,
      state: {},
    };

    this.applyPlugins("pushReceived", env)

    await self.registration.showNotification("Push Notification", this.options);
  }

  async handleNotificationClick(event: NotificationEvent): Promise<void> {
    const env: PushHandlerEnv = {
      event,
      state: {},
    };

    this.applyPlugins("pushClicked", env);

    if (event.notification.data && event.notification.data.url) {
      await self.clients.openWindow(event.notification.data.url);
    }

    event.notification.close();
  }

  async handleNotificationClose(event: NotificationEvent): Promise<void> {
    const env: PushHandlerEnv = {
      event,
      state: {},
    };

    this.applyPlugins("pushDismissed", env);
  }

  async handleError(error: ErrorEvent): Promise<void> {
    this.applyPlugins("error", { event: error });
  }
}

const pushStrategy = new CustomPush({
  plugins: [new LoggingPlugin(), new AnalyticsPlugin()],
});

self.addEventListener("push", (event) => {
  // Pass the push event to the pushReceived method of the PushStrategy
  pushStrategy.handlePush(event);
});

self.addEventListener("notificationclick", (event) => {
  // Pass the notification event to the pushClicked method of the PushStrategy
  pushStrategy.handleNotificationClick(event);
});

self.addEventListener("notificationclose", (event) => {
  // Pass the notification event to the pushDismissed method of the PushStrategy
  pushStrategy.handleNotificationClose(event);
});

self.addEventListener("error", (error) => {
  // Pass the error to the error method of the PushStrategy
  pushStrategy.handleError(error);
});
