// npm i ws

const WebSocket = require("ws");

const webSocketServer = new WebSocket.Server(
    {
        port : 950,
    }
);

const broadcastMessage = (message) =>
{
    webSocketServer.clients.forEach((client) =>
    {
        client.send(message);
    });
}

const playerList = [];

webSocketServer.on("connection", webSocket =>
{
    console.log("New client connected !");

    playerList.forEach((player) =>
    {
        broadcastMessage(JSON.stringify(
            {
                type : "loadMap",
                value : 
                {
                    playerID : player.playerID,
                    playerFace : player.playerFace,
                    playerNickname : player.playerNickname,
                    x : player.x,
                    y : player.y
                }
            }
        ));
    });

    webSocket.on("message", (clientMessage) =>
    {
        const message = `${clientMessage}`;
        const jsonObject = JSON.parse(message);

        if(jsonObject.type == "newPlayerRegister")
        {
            const newPlayerID = playerList.length == 0 ? 1 : playerList[playerList.length - 1].playerID + 1;
            webSocket.send(JSON.stringify(
                {
                    type : "newPlayerRegisterInformation",
                    value : 
                    {
                        playerID : newPlayerID,
                        playerFace : "left",
                        playerNickname : jsonObject.value.playerNickname,
                        x : 32,
                        y : 32
                    }
                }
            ));

            playerList.push(
                {
                    playerID : newPlayerID,
                    playerFace : "left",
                    playerNickname : jsonObject.value.playerNickname,
                    x : 32,
                    y : 32
                }
            );
        }
        else if(jsonObject.type == "newPlayer")
        {
            const player = playerList[playerList.findIndex(player => player.playerID == jsonObject.value.playerID)];

            broadcastMessage(JSON.stringify(
                {
                    type : "newPlayer",
                    value : 
                    {
                        playerID : player.playerID,
                        playerFace : player.playerFace,
                        playerNickname : player.playerNickname,
                        x : player.x,
                        y : player.y
                    }
                }
            ));
        }
        else if(jsonObject.type == "playerPosition")
        {
            const player = playerList[playerList.findIndex(player => player.playerID == jsonObject.value.playerID)];
            player.x = jsonObject.value.x;
            player.y = jsonObject.value.y;
            player.playerFace = jsonObject.value.playerFace;

            broadcastMessage(message);
        }
        else if(jsonObject.type == "playerChat")
        {
            broadcastMessage(message);
        }
        else if(jsonObject.type == "playerRemoved")
        {
            const playerIndex = playerList.findIndex(player => player.playerID == jsonObject.value.playerID);
            playerList.splice(playerIndex, 1);

            broadcastMessage(JSON.stringify(
                {
                    type : "clearMap"
                }
            ));
            
            playerList.forEach((player) =>
            {
                broadcastMessage(JSON.stringify(
                    {
                        type : "mapUpdates",
                        value : 
                        {
                            playerID : player.playerID,
                            playerFace : player.playerFace,
                            playerNickname : player.playerNickname,
                            x : player.x,
                            y : player.y
                        }
                    }
                ));
            });
        }
    });

    webSocket.on("close", () =>
    {
        // broadcastMessage(JSON.stringify(
        //     {
        //         type : "playerPosition",
        //         value : 
        //         {
        //             playerID : player.playerID,
        //             x : player.x,
        //             y : player.y
        //         }
        //     }
        // ));

        console.log("Client has disconnected !");
    });
});