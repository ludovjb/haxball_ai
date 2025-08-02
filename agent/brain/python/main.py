import asyncio
from nats.aio.client import Client as NATS

async def main():
    nc = NATS()
    await nc.connect("nats://nats:4222")
    print("nats connected!!")
    async def message_handler(msg):
        print(f"Received signal: {msg.data.decode()}")
        print("Starting frontend app...")
        await nc.close()

    await nc.subscribe("backend.ready", cb=message_handler)

    print("Frontend waiting for backend...")
    while nc.is_connected:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
