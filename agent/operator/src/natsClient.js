import { connect, JSONCodec } from 'nats';

let nc = null;
const jc = JSONCodec();

async function getNatsClient() {
  if (!nc) {
    nc = await connect({ servers: 'nats://nats:4222' });
    console.log('Connected to NATS');
  }
  return nc;
}

export async function subscribe(subject, handler, maxMessages = null, queue=null) {
  const nc = await getNatsClient();
  let count = 0;

  const sub = nc.subscribe(subject, {
    queue: queue,
    callback: (err, msg) => {
      if (err) {
        console.error(`NATS error on [${subject}]:`, err);
        return;
      }

      try {
        const data = jc.decode(msg.data);
        handler(data).catch(e => {
          console.error(`Error in handler for [${subject}]:`, e);
        });

        count++;
        if (maxMessages !== null && count >= maxMessages) {
          sub.unsubscribe();
          console.log(`Unsubscribed from [${subject}] after ${count} messages`);
        }
      } catch (e) {
        console.error(`Failed to decode message on [${subject}]:`, e);
      }
    },
  });

  console.log(`Subscribed to [${subject}]${maxMessages ? ` (max ${maxMessages} messages)` : ''}`);
  return sub;
}

export async function publish(subject, message) {
  const nc = await getNatsClient();
  nc.publish(subject, jc.encode(message));
}