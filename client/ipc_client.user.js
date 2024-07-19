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
  if (sessionStorage.getItem("client::id") === null) {
    const client_id = self.crypto.randomUUID()
    sessionStorage.setItem("client::id", client_id)
  }

  const client_id = sessionStorage.getItem("client::id")
  const url = new URL('ws://127.0.0.1/')
  const ws = new WebSocket(url) // #1 TODO: refactor into class

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        "state": "connected",
        "client_id": client_id,
      })
    )
  }

  ws.onclose = () => {
    ws.send(
      JSON.stringify({
        "state": "disconnected",
        "client_id": client_id,
      })
    )
  }

  ws.onmessage = ({ data }) => {
    const { state, from_client_id, message_id, commands } = JSON.parse(data)


    ws.send(
      JSON.stringify({
        "state": "ACK",
        "result": bool,
        "message_id": message_id,
        "client_id": client_id,
      })
    )
  }

  ws.onerror = (error) => {
    ws.send(
      JSON.stringify({
        "state": "error",
        "error": error,
      })
    )
  }

})()
