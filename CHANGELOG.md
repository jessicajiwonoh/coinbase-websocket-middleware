# Changelog

All notable changes from v0 to v1 are documented in this file.

## Enhancements

* Migrate from JavaScript to TypeScript.
* Add type aliases and enums (set of named constants; e.g. View).
* Add `throwExpression` in commons.
* Check the first token of the message from the client in `supportedProducts` array (v0) to `Product` enum (v1).
* Fix the initialization of the `productData`.
* The `subscribe` function throws an error when the `clientID` is `null` (v1 addition).
* The `changeRefreshInterval` throws an error when the `clientID` is `null`. Pass only `refreshInterval` to `clientSendFunction` (v1 addition).
* Add `prettier` (v1 addition).

## Bug Fixes

* Change `refreshInterval` in client to integer from string.
