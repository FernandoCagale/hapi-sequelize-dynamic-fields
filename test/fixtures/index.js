'use strict';

// Load modules

const Hapi = require('hapi');
const path = require('path');

let server = new Hapi.Server();

const dir = path.join(__dirname, '/../models/**.js');

const register = [{
  register: require('k7'),
  options: {
    models: dir,
    adapter: require('k7-sequelize'),
    connectionOptions: {
      options: {
        dialect: 'sqlite'
      }
    }
  }
}, {
  register: require('../../lib')
}];

server.register(register, (err) => {
  if (err) throw err;
});

server.connection();

server.route({
  method: 'GET',
  path: '/users',
  handler: (request, reply) => {
    const options = {
      attributes: ['id', 'username', 'firstName', 'lastName', 'email']
    };

    server.database.User.findAll(request.fieldsAll(options))
    .then((values) => reply(values).header('allowing-fields', request.fieldsHeaders(options)))
    .catch((err) => reply(err));
  }
});

server.route({
  method: 'GET',
  path: '/user/{id}',
  handler: (request, reply) => {
    const options = {
      attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
      where: {
        id: request.params.id
      }
    };

    server.database.User.findOne(request.fieldsAll(options))
    .then((values) => reply(values).header('allowing-fields', request.fieldsHeaders(options)))
    .catch((err) => reply(err));
  }
});

server.route({
  method: 'GET',
  path: '/tasks',
  handler: (request, reply) => {
    const options = {
      attributes: ['id', 'descriptions', 'observation'],
      include: {
        model: server.database.User,
        attributes: ['id', 'username', 'firstName', 'lastName', 'email']
      }
    };

    server.database.Tasks.findOne(request.fieldsAll(options))
    .then((values) => reply(values).header('allowing-fields', request.fieldsHeaders(options)))
    .catch((err) => reply(err));
  }
});

server.route({
  method: 'GET',
  path: '/tasks-array',
  handler: (request, reply) => {
    const options = {
      attributes: ['id', 'descriptions', 'observation'],
      include: [{
        model: server.database.User,
        attributes: ['id', 'username', 'firstName', 'lastName', 'email']
      }]
    };

    server.database.Tasks.findOne(request.fieldsAll(options))
    .then((values) => reply(values).header('allowing-fields', request.fieldsHeaders(options)))
    .catch((err) => reply(err));
  }
});

server.route({
  method: 'GET',
  path: '/tasks-alias',
  handler: (request, reply) => {
    const options = {
      attributes: ['id', 'descriptions', 'observation'],
      include: {
        model: server.database.User,
        alias: 'Alias',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email']
      }
    };

    server.database.Tasks.findOne(request.fieldsAll(options))
    .then((values) => reply(values).header('allowing-fields', request.fieldsHeaders(options)))
    .catch((err) => reply(err));
  }
});

module.exports = server;
