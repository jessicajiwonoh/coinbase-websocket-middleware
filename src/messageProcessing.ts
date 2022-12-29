import {
  l2updateMessage,
  matchUpdateMessage,
  subscriptionsMessage,
  unsupportedMessage,
} from './messageHandlers/index';
import {
  L2UpdateChanges,
  Product,
  MessageType,
  ChannelType,
  MatchUpdateType,
} from './types/index';

export function processMessage(
  data: MatchUpdateType & {
    type: MessageType;
    channels: { name: ChannelType; product_ids: Product }[];
    product_id: Product;
    changes: L2UpdateChanges;
  },
) {
  if (!Object.values(MessageType).includes(data.type)) {
    unsupportedMessage(data);
  } else if (data.type === MessageType.Subscriptions) {
    subscriptionsMessage(data);
  } else if (data.type === MessageType.L2update) {
    l2updateMessage(data);
  } else if (
    data.type === MessageType.Match ||
    data.type === MessageType.LastMatch
  ) {
    matchUpdateMessage(data);
  }
}
