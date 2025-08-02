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

export async function subscribe(subject, handler, max = null) {
  const nc = await getNatsClient();
  let count = 0;

  nc.subscribe(subject, {
    max,
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
      } catch (e) {
        console.error(`Failed to decode message on [${subject}]:`, e);
      }

      count++;
      if (max !== null && count >= max) {
        //msg.subscription.unsubscribe();
      }
    },
  });
}