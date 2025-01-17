// ==UserScript==
// @name         Intertab IPC Client
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Control multiple tabs from one host
// @author       RUUKU
// @license      GPL3
// @match        https://*
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
(() => {
  const WEBSOCKET_URL = "ws://127.0.0.1/";

  class Wrapper {
    constructor(url) {
      this.ws = new WebSocket(url);
      this.client_id = (() => {
        // #3 TODO: fail safe method if `sessionStorage` does not exist
        // in client context.
        const client_id = sessionStorage.getItem("client::id");
        if (client_id === null) {
          const new_client_id = self.crypto.randomUUID();
          sessionStorage.setItem("client::id", new_client_id);
          return new_client_id;
        }
        return client_id;
      })();
    }

    send(obj) {
      const message = JSON.stringify({
        "client_id": this.client_id,
        ...obj,
      });

      this.ws.send(message);
    }
  }

  // #2 TODO: Fix naming of `associated_data`

  const url = new URL(WEBSOCKET_URL);
  const wrapper = new Wrapper(url);

  wrapper.ws.onopen = () => {
    wrapper.send({
      "state": "connected",
    });
  };

  wrapper.ws.onclose = () => {
    wrapper.send({
      "state": "disconnected",
    });
  };

  wrapper.ws.onmessage = ({ data }) => {
    const {
      state,
      message_id,
      // from_client_id,
      commands,
    } = JSON.parse(data);

    switch (state) {
      case "command":
        let error = null;

        try {
          exec(commands);
        } catch (err) {
          error = err;
        }

        if (error) {
          wrapper.send({
            "state": "ACK Error",
            "associated_data": {
              "error": error,
              "message_id": message_id,
            },
          });
        } else {
          wrapper.send({
            "state": "ACK Success",
            "associated_data": {
              "message_id": message_id,
            },
          });
        }
        break;

      default:
        break;
    }
  };

  wrapper.ws.onerror = (error) => {
    wrapper.send({
      "state": "error",
      "associated_data": {
        "error": error,
      },
    });
  };
})();
