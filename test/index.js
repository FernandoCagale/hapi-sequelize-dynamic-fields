'use strict';

// Load modules

const Lab = require('lab');
const Code = require('code');
const server = require('./fixtures');

// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;
const describe = lab.describe;
const before = lab.before;

describe('Dynamic fields', () => {
  describe('create tables', () => {
    before((done) => {
      server.database.User
      .sync()
      .then(() => {
        const user = {
          username: 'username',
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email@email.com',
          password: '123abc'
        };

        return server.database.User.create(user);
      })
      .then(() => {
        return server.database.Tasks.sync();
      })
      .then(() => {
        const tasks = {
          descriptions: 'descriptions',
          observation: 'observation',
          userId: 1
        };

        return server.database.Tasks.create(tasks);
      })
      .then(() => {
        done();
      });
    });

    it('fields user default', (done) => {
      const options = {
        method: 'GET',
        url: '/users'
      };

      server.inject(options, (response) => {
        expect(response.result).to.be.an.array();
        expect(response.result[0].id).to.exist();
        expect(response.result[0].username).to.exist();
        expect(response.result[0].firstName).to.exist();
        expect(response.result[0].lastName).to.exist();
        expect(response.result[0].email).to.exist();
        done();
      });
    });

    it('field id for user', (done) => {
      const options = {
        method: 'GET',
        url: '/users',
        headers: {
          'fields': 'id'
        }
      };

      server.inject(options, (response) => {
        expect(response.result).to.be.an.array();
        expect(response.result[0].id).to.exist();
        expect(response.result[0].username).to.not.exist();
        expect(response.result[0].firstName).to.not.exist();
        expect(response.result[0].lastName).to.not.exist();
        expect(response.result[0].email).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,username,firstName,lastName,email');

        done();
      });
    });

    it('field id and email for user', (done) => {
      const options = {
        method: 'GET',
        url: '/users',
        headers: {
          'fields': 'id, email'
        }
      };

      server.inject(options, (response) => {
        expect(response.result).to.be.an.array();
        expect(response.result[0].id).to.exist();
        expect(response.result[0].email).to.exist();
        expect(response.result[0].username).to.not.exist();
        expect(response.result[0].firstName).to.not.exist();
        expect(response.result[0].lastName).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,username,firstName,lastName,email');

        done();
      });
    });

    it('fields user default', (done) => {
      const options = {
        method: 'GET',
        url: `/user/${1}`
      };

      server.inject(options, (response) => {
        expect(response.result.id).to.exist();
        expect(response.result.username).to.exist();
        expect(response.result.firstName).to.exist();
        expect(response.result.lastName).to.exist();
        expect(response.result.email).to.exist();

        expect(response.headers['allowing-fields']).to.equal('id,username,firstName,lastName,email');

        done();
      });
    });

    it('field id user default', (done) => {
      const options = {
        method: 'GET',
        url: `/user/${1}`,
        headers: {
          'fields': 'id'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.id).to.exist();
        expect(response.result.username).to.not.exist();
        expect(response.result.firstName).to.not.exist();
        expect(response.result.lastName).to.not.exist();
        expect(response.result.email).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,username,firstName,lastName,email');

        done();
      });
    });

    it('field not found for tasks', (done) => {
      const options = {
        method: 'GET',
        url: '/tasks',
        headers: {
          'fields': 'id, notExist'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.statusCode).to.exist();
        expect(response.result.error).to.exist();
        expect(response.result.message).to.exist();
        done();
      });
    });

    it('field not found for user', (done) => {
      const options = {
        method: 'GET',
        url: '/tasks',
        headers: {
          'fields': 'id, User.notExist'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.statusCode).to.exist();
        expect(response.result.error).to.exist();
        expect(response.result.message).to.exist();

        done();
      });
    });

    it('field id tasks and username', (done) => {
      const options = {
        method: 'GET',
        url: '/tasks',
        headers: {
          'fields': 'id, User.username'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.id).to.exist();
        expect(response.result.descriptions).to.not.exist();
        expect(response.result.observation).to.not.exist();
        expect(response.result.User).to.object();
        expect(response.result.User.username).to.exist();
        expect(response.result.User.firstName).to.not.exist();
        expect(response.result.User.lastName).to.not.exist();
        expect(response.result.User.email).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,descriptions,observation,User.id,User.username,User.firstName,User.lastName,User.email');

        done();
      });
    });

    it('field id tasks and username for alias', (done) => {
      const options = {
        method: 'GET',
        url: '/tasks-alias',
        headers: {
          'fields': 'id, Alias.username'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.id).to.exist();
        expect(response.result.descriptions).to.not.exist();
        expect(response.result.observation).to.not.exist();
        expect(response.result.User).to.object();
        expect(response.result.User.username).to.exist();
        expect(response.result.User.firstName).to.not.exist();
        expect(response.result.User.lastName).to.not.exist();
        expect(response.result.User.email).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,descriptions,observation,Alias.id,Alias.username,Alias.firstName,Alias.lastName,Alias.email');

        done();
      });
    });

    it('field id tasks and username for alias array', (done) => {
      const options = {
        method: 'GET',
        url: '/tasks-array',
        headers: {
          'fields': 'id, User.username'
        }
      };

      server.inject(options, (response) => {
        expect(response.result.id).to.exist();
        expect(response.result.descriptions).to.not.exist();
        expect(response.result.observation).to.not.exist();
        expect(response.result.User).to.object();
        expect(response.result.User.username).to.exist();
        expect(response.result.User.firstName).to.not.exist();
        expect(response.result.User.lastName).to.not.exist();
        expect(response.result.User.email).to.not.exist();

        expect(response.headers['allowing-fields']).to.equal('id,descriptions,observation,User.id,User.username,User.firstName,User.lastName,User.email');

        done();
      });
    });
  });
});
