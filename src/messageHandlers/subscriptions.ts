import { ChannelType } from '../types/channelType';
import { Product } from '../types/product';

export function subscriptionsMessage(data: {
  channels: { name: ChannelType; product_ids: Product }[];
}) {
  for (const channel of data.channels) {
    console.log(
      `Product IDs subscribed to: ${channel.name} channel, ${channel.product_ids}`,
    );
  }
}
