import { WebSocketServer } from "ws";
import jest from 'jest-mock';

describe("WebSocker server", () => {
  let wss;

  beforeEach(() => {
    // Create a new WebSocket server before each test
    wss = new WebSocketServer({ port: 8080 });
  })

  afterEach(() => {
    // Close the WebSocket server after each test
    wss.close();
  });

  it("should handle a connection event", () => {
    // Set up a mock function to capture the callback passed to the "connection" event
    const connectionCallback = jest.fn();
    wss.on("connection", connectionCallback);

    // Emit a "connection" event
    wss.emit("connection");

    // Verify that the callback was called
    expect(connectionCallback).toHaveBeenCalled();
  });

  it("should handle a message event", () => {
    // Set up a mock function to capture the callback passed to the "message" event
    const messageCallback = jest.fn();

    // Emit a "connection" event
    wss.emit("connection", {
      on: (event, callback) => {
        if (event === "message") {
          messageCallback = callback;
        }
      },
    });

    // Emit a "message" event
    messageCallback("test message");

    // Verify that the callback was called
    expect(messageCallback).toHaveBeenCalledWith("test message");
  });
});
