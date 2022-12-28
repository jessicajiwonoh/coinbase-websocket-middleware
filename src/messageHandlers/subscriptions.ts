export function subscriptionsMessage(data: { channels: any }) {
  for (let channel of data.channels) {
    console.log(
      `Product IDs subscribed to: ${channel.name} channel, ${channel.product_ids}`,
    );
  }
}
