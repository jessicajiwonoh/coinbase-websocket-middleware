import { WebSocket } from 'ws';
import { l2updateMessage } from './l2';
import { matchUpdateMessage } from './match';
import { subscriptionsMessage } from './subscriptions';
import { unsupportedMessage } from './unsupported';
import {
  L2UpdateChanges,
  Product,
  MessageType,
  ChannelType,
  MatchUpdateType,
} from '../types/index';

export function processMessage(
  ws: WebSocket,
  data: MatchUpdateType & {
    type: MessageType;
    channels: ChannelType;
    product_id: Product;
    changes: L2UpdateChanges;
  },
) {
  if (!Object.values(MessageType).includes(data.type)) {
    unsupportedMessage(ws, data);
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
