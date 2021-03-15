import amqp from "amqplib";

const hostname = process.env.AMQP_HOSTNAME || "localhost";
const port = process.env.AMQP_PORT || 5672;
const username = process.env.AMQP_USERNAME || "user";
const password = process.env.AMQP_PASSWORD || "bitnami";

async function connectToRabbitMQ() {
	try {
		return amqp.connect({ hostname, port, username, password });
	} catch (err) {
		console.error(
			`Failed to establish connection with RabbitMQ at ${hostname}:${port}. Reason: ${err}`
		);

		throw err;
	}
}

async function produceMessage(conn) {
	const channel = await conn.createChannel();

	const queue = "eliftech_queue";
	const msg = "Hello Eliftech!";

	await channel.assertQueue(queue);

	// specify empty exchange to send directly to the queue
	await channel.publish("", queue, Buffer.from(msg));

	await channel.close();
}

connectToRabbitMQ()
	.then(async conn => {
		await produceMessage(conn);
		return conn.close();
	})
	.catch(err => {
		console.error(`Messaging operation failed: ${err}`);
	});
