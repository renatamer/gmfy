const users = [];

// Usuario se une a la partida
function userJoin(id, name, pin ) {
  const user = { id, name, pin };

  users.push(user);

  return user;
}

// Usuario deja la partida
function userLeave(id) {
  const index = users.findIndex(name => name.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Obtener usuarios de la partida
function getRoomUsers(pin) {
  return users.filter(name => name.pin === pin);
}

module.exports = {
  userJoin,
  userLeave,
  getRoomUsers
};