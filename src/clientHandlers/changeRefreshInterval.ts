import { throwExpression } from '../common';
import { subscribers } from './index';

export function changeRefreshInterval(
  clientID: string,
  refreshInterval: number,
  clientSendFunction: (rawObject: Object) => void,
): void {
  const subscriber =
    subscribers.get(clientID) ??
    throwExpression(`Unexpected null clientID ${clientID}`);

  // Update the refreshInterval property of the subscriber object with the given refresh interval.
  subscriber.refreshInterval = refreshInterval;

  clientSendFunction({ refreshInterval: subscriber.refreshInterval });
}
