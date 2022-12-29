import { subscribers } from '../subscriptionData';

// The showSystem function sends a list of the subscribed products for a client, identified by their clientID, to the client.
export function showSystem(
  clientID: string,
  clientSendFunction: (rawObject: Object) => void,
) {
  const subscriber = subscribers.get(clientID);
  // Create an empty array to hold the subscribed products of the subscriber object.
  const systemProducts = [];

  if (subscriber == null) {
    console.log('There is no subscriber...');
    return;
  }

  for (let subscribedProduct of subscriber.subscribedProducts) {
    systemProducts.push(subscribedProduct);
  }
  clientSendFunction({ clientID, systemProducts });
}
