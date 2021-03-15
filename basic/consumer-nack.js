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

async function consumeMessages(conn, onMessage) {
	const channel = await conn.createChannel();

	const queue = "eliftech_queue";

	await channel.assertQueue(queue);

	channel.consume(
		queue,
		msg => {
			onMessage(msg.content.toString());
		},
		{ noAck: true }
	);
}

connectToRabbitMQ()
	.then(conn => {
		return consumeMessages(conn, msg =>
			console.log(`Received message from ${hostname}:${port} - ${msg}.`)
		);
	})
	.catch(err => {
		console.error(`Messaging operation failed: ${err}`);
	});
