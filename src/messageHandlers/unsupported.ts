export function unsupportedMessage(ws: { close: () => void }, data: any) {
  console.log(`${data.type} type not supported`);
}
