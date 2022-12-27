export const supportedProducts: string[] = ['BTC-USD', 'ETH-USD', /*'XRP-USD', */'LTC-USD'];

export function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}