import type { ActionArgs } from "@remix-run/node";
import { db, sendNotifications } from "~/utils/packages.server";

type DBTypes = {
  subscriptions: any[];
};

export const action = async ({ request }: ActionArgs) => {
  const body = await request.json();
  await db.read();
  const { subscriptions } = db.data as DBTypes;

  const type = body.type as string;

  if (
    typeof type !== "string" ||
    !["subscribe", "unsubscribe", "notify-me", "notify-all"].includes(type)
  ) {
    return new Response("Invalid type.", { status: 400 });
  }

  const subscription = body.subscription as any;
  const endpoint = body.endpoint as string;

  switch (type) {
    case "subscribe":
      subscriptions.push(subscription);
      await db.write();
      console.log("Subscribed")
      break;
    case "unsubscribe":
      const index = subscriptions.findIndex((s) => s.endpoint === endpoint);

      console.log(endpoint)

      if (index !== -1) {
        subscriptions.splice(index, 1);
        await db.write();
      }

      break;
    case "notify-me":
      console.log(`Notifying ${endpoint}`);
      const wantedSubscription = subscriptions.find(
        (s) => s.endpoint === endpoint
      );
      sendNotifications([wantedSubscription]);
      break;
    case "notify-all":
      break;
  }

  return null;
};
