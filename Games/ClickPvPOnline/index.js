const express = require('express');
const path = require('path');
const fs = require('fs');

// Archivo JSON que almacena las salas
const roomsFile = path.join(__dirname, 'rooms.json');

// --- Funciones básicas ---
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error("Error leyendo " + filePath, err);
    return {};
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error escribiendo " + filePath, err);
  }
}

// --- Eliminar todas las salas al reiniciar ---
function clearAllRooms() {
  writeJSON(roomsFile, {});
  console.log('Todas las salas eliminadas en el servidor al reiniciar.');
}
clearAllRooms();

// --- Verificar y eliminar salas expiradas ---
// Se considerarán expiradas:
// - "playing": 60 seg desde startTime.
// - "waiting": 180 seg desde createdAt.
// - "finished": 60 seg desde finishedAt (por si algún jugador no confirma).
function checkAndDeleteExpiredRoom(rooms, roomCode) {
  const room = rooms[roomCode];
  if (!room) return false;
  const now = Date.now();
  let expired = false;
  if (room.status === "playing" && room.startTime && (now - room.startTime > 60000)) {
    expired = true;
  }
  if (room.status === "waiting" && room.createdAt && (now - room.createdAt > 180000)) {
    expired = true;
  }
  if (room.status === "finished" && room.finishedAt && (now - room.finishedAt > 60000)) {
    expired = true;
  }
  if (expired) {
    console.log(`Sala eliminada por expiración: ${roomCode}`);
    delete rooms[roomCode];
    writeJSON(roomsFile, rooms);
    return true;
  }
  return false;
}

// Limpieza periódica cada 60 segundos
function cleanupExpiredRooms() {
  let rooms = readJSON(roomsFile);
  let changed = false;
  const now = Date.now();
  for (let roomCode in rooms) {
    const room = rooms[roomCode];
    // Borramos salas en estado waiting o finished que excedan su tiempo de vida
    if (
      (room.status === "waiting" && room.createdAt && (now - room.createdAt > 180000)) ||
      (room.status === "finished" && room.finishedAt && (now - room.finishedAt > 60000))
    ) {
      console.log(`Sala eliminada en limpieza: ${roomCode}`);
      delete rooms[roomCode];
      changed = true;
    }
  }
  if (changed) writeJSON(roomsFile, rooms);
}
setInterval(cleanupExpiredRooms, 60000);

module.exports = function(app) {
  // --- Endpoints de ClickPvPOnline ---

  // Crear sala
  app.post('/ClickPvPOnline/createRoom', (req, res) => {
    const { username } = req.body;
    if (!username) {
      console.error("Error: No se recibió el nombre de usuario.");
      return res.json({ success: false, message: "Missing username." });
    }
    let rooms = readJSON(roomsFile);
    let roomCode;
    let intentos = 0;
    do {
      roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      intentos++;
      if (intentos > 1000) {
        console.error("Error: No se pudo generar un código único.");
        return res.json({ success: false, message: "Error generating room code." });
      }
    } while (rooms[roomCode]);
    
    rooms[roomCode] = {
      creator: username,
      players: [username],
      status: "waiting",
      scores: {},
      winner: null,
      // Aquí se inicializa un arreglo para confirmar que los jugadores han visto los resultados
      resultsViewed: [],
      lastHeartbeat: Date.now(),
      createdAt: Date.now()
    };
    writeJSON(roomsFile, rooms);
    console.log(`Sala creada: ${roomCode} para ${username}`);
    res.json({ success: true, roomCode, message: "Room created. Waiting for players." });
  });

  // Unirse a una sala
  app.post('/ClickPvPOnline/joinRoom', (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) {
      console.error("Error: Falta el nombre de usuario o el código de sala.");
      return res.json({ success: false, message: "Missing username or room code." });
    }
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) {
      console.error(`Error: La sala ${roomCode} no existe.`);
      return res.json({ success: false, message: "The room does not exist." });
    }
    const room = rooms[roomCode];
    if (room.status !== "waiting" || room.players.includes(username)) {
      return res.json({ success: false, message: "Room unavailable or already joined." });
    }
    room.players.push(username);
    writeJSON(roomsFile, rooms);
    res.json({ success: true, roomCode, message: "You successfully joined the room." });
  });

  // Unirse a una sala aleatoria
  app.post('/ClickPvPOnline/joinRandomRoom', (req, res) => {
    const { username } = req.body;
    if (!username) return res.json({ success: false, message: "Missing username." });
    let rooms = readJSON(roomsFile);
    let targetRoomCode = null;
    for (let code in rooms) {
      const room = rooms[code];
      if (room.auto && room.status === "waiting" && room.players.length < 4) {
        targetRoomCode = code;
        break;
      }
    }
    if (targetRoomCode) {
      const room = rooms[targetRoomCode];
      if (room.players.includes(username)) return res.json({ success: false, message: "You are already in the room." });
      room.players.push(username);
      writeJSON(roomsFile, rooms);
      console.log(`Sala creada: ${targetRoomCode} (random) para ${username}`);
      res.json({ success: true, roomCode: targetRoomCode, message: "Joined random room." });
    } else {
      let roomCode;
      let intentos = 0;
      do {
        roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        intentos++;
        if (intentos > 1000) {
          console.error("Error: No se pudo generar un código único.");
          return res.json({ success: false, message: "Error generating room code." });
        }
      } while (rooms[roomCode]);
      rooms[roomCode] = {
        creator: username,
        players: [username],
        status: "waiting",
        scores: {},
        winner: null,
        resultsViewed: [],
        lastHeartbeat: Date.now(),
        createdAt: Date.now(),
        auto: true
      };
      writeJSON(roomsFile, rooms);
      console.log(`Sala creada: ${roomCode} (random) para ${username}`);
      res.json({ success: true, roomCode, message: "Random room created and joined." });
    }
  });

  // Consultar estado de la sala
  app.get('/ClickPvPOnline/roomStatus', (req, res) => {
    const roomCode = req.query.roomCode;
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) return res.json({ success: false, message: "The room does not exist." });
    if (checkAndDeleteExpiredRoom(rooms, roomCode)) {
      return res.json({ success: false, message: "The room has been closed due to expiration." });
    }
    res.json({ success: true, room: rooms[roomCode] });
  });

  // Enviar puntaje y determinar ganador (la sala se marcará "finished" y se espera confirmación)
  app.post('/ClickPvPOnline/submitScore', (req, res) => {
    const { username, roomCode, score } = req.body;
    if (!username || !roomCode || score === undefined) {
      return res.json({ success: false, message: "Incomplete data." });
    }
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) return res.json({ success: false, message: "The room does not exist." });
    const room = rooms[roomCode];
    room.scores[username] = score;
    // Cuando se han recibido los puntajes de todos los jugadores y aún no se ha determinado un ganador:
    if (Object.keys(room.scores).length === room.players.length && room.winner === null) {
      const scoresArray = Object.values(room.scores);
      const maxScore = Math.max(...scoresArray);
      const winners = Object.keys(room.scores).filter(u => room.scores[u] === maxScore);
      room.winner = winners.length === 1 ? winners[0] : "Tie";
      // Se cambia el estado a "finished" y se registra el instante de finalización
      room.status = "finished";
      room.finishedAt = Date.now();
      // Reiniciamos el arreglo de confirmaciones
      room.resultsViewed = [];
      console.log(`Sala finalizada: ${roomCode} (partida terminada)`);
      writeJSON(roomsFile, rooms);
      return res.json({ success: true, message: "Score updated. Game finished.", winner: room.winner, room });
    }
    writeJSON(roomsFile, rooms);
    res.json({ success: true, message: "Score updated." });
  });

  // Endpoint para que cada jugador confirme que vio los resultados
  app.post('/ClickPvPOnline/confirmResults', (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) {
      return res.json({ success: false, message: "Incomplete data." });
    }
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) {
      return res.json({ success: false, message: "The room does not exist or has been deleted." });
    }
    const room = rooms[roomCode];
    if (room.status !== "finished") {
      return res.json({ success: false, message: "Game is not finished yet." });
    }
    // Agregamos al usuario si no lo ha confirmado ya
    if (!room.resultsViewed.includes(username)) {
      room.resultsViewed.push(username);
      writeJSON(roomsFile, rooms);
    }
    // Si todos los jugadores han confirmado, eliminamos la sala
    if (room.resultsViewed.length === room.players.length) {
      console.log(`Todos los jugadores han confirmado en la sala: ${roomCode}. Eliminando sala.`);
      delete rooms[roomCode];
      writeJSON(roomsFile, rooms);
      return res.json({ success: true, message: "Results confirmed. Room deleted." });
    }
    res.json({ success: true, message: "Results confirmed. Waiting for other players." });
  });

  // Eliminar sala (cierre manual)
  app.post('/ClickPvPOnline/deleteRoom', (req, res) => {
    const { roomCode } = req.body;
    if (!roomCode) return res.json({ success: false, message: "Missing room code." });
    let rooms = readJSON(roomsFile);
    if (rooms[roomCode]) {
      delete rooms[roomCode];
      writeJSON(roomsFile, rooms);
      console.log(`Sala eliminada manualmente: ${roomCode}`);
      res.json({ success: true, message: "Room deleted." });
    } else {
      res.json({ success: false, message: "The room does not exist." });
    }
  });

  // Iniciar partida (solo el creador)
  app.post('/ClickPvPOnline/startGame', (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) return res.json({ success: false, message: "Incomplete data." });
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) return res.json({ success: false, message: "The room does not exist." });
    const room = rooms[roomCode];
    if (room.creator !== username) return res.json({ success: false, message: "Only the creator can start the game." });
    if (room.players.length < 2) return res.json({ success: false, message: "At least 2 players are required to start the game." });
    room.status = "playing";
    room.startTime = Date.now();
    writeJSON(roomsFile, rooms);
    res.json({ success: true, message: "The game has started." });
  });

  // Salir de la sala
  app.post('/ClickPvPOnline/leaveRoom', (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) return res.json({ success: false, message: "Incomplete data." });
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) return res.json({ success: false, message: "The room does not exist." });
    const room = rooms[roomCode];
    room.players = room.players.filter(u => u !== username);
    if (room.scores && room.scores[username] !== undefined) delete room.scores[username];
    if (room.creator === username) {
      delete rooms[roomCode];
      writeJSON(roomsFile, rooms);
      res.json({ success: true, message: "The creator left the room. Room closed." });
      return;
    }
    writeJSON(roomsFile, rooms);
    res.json({ success: true, message: "You have left the room." });
  });

  // Heartbeat (keep alive) – se omite log para evitar spam
  app.post('/ClickPvPOnline/heartbeat', (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) return res.json({ success: false, message: "Incomplete data." });
    let rooms = readJSON(roomsFile);
    if (!rooms[roomCode]) return res.json({ success: false, message: "The room does not exist." });
    const room = rooms[roomCode];
    if (room.creator === username) {
      room.lastHeartbeat = Date.now();
      writeJSON(roomsFile, rooms);
      res.json({ success: true, message: "Heartbeat updated." });
    } else {
      res.json({ success: false, message: "Not authorized." });
    }
  });
};
