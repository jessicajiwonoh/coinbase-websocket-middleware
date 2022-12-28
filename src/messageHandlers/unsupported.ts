import {
  ChannelType,
  L2UpdateChanges,
  MatchUpdateType,
  MessageType,
  Product,
} from '../types/index';

export function unsupportedMessage(
  data: MatchUpdateType & {
    type: MessageType;
    channels: { name: ChannelType; product_ids: Product }[];
    product_id: Product;
    changes: L2UpdateChanges;
  },
) {
  console.log(`${data.type} type not supported`);
}
