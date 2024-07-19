export default function handler(request) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response(`Not supported: ${request}`);
  }

  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
    console.log("Connected new client");
  };

  socket.onmessage = ({ data }) => {
    const { 
      state,
      client_id,
      associated_data,
    } = JSON.parse(data);

    switch (state) {
      case "connected":
        console.log(`Connected client ${client_id}`);
        break;

      case "disconnected":
        console.log(`Connected client ${client_id}`);
        break;

      case "ACK":
        console.log(
          `Client ${client_id}:
          executed message ${associated_data["message_id"]}
          with status ${associated_data["result"]}`,
        );
        break;

      case "error":
        console.log(`Client ${client_id} ran into ${associated_data["error"]}`);

      default:
        console.log(`Recieved unknown state ${state}`);
        break;
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
  };

  return response;
}
