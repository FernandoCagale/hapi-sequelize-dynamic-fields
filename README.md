Hapi-sequelize-dynamic-fields(BETA)
===

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

## Usage
####Configuration Hapijs and K7 
===

```javascript
const Hapi = require('hapi');
const path = require('path');

let server = new Hapi.Server();

const dir = path.join(__dirname, '/models/**.js');

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
  register: require('hapi-sequelize-dynamic-fields')
}];

server.register(register, (err) => {
  if (err) throw err;
});

server.connection();
```

####Create route
===

```javascript
  const User = sequelize.define('User', {
    username: {
      type: DataType.STRING(40),
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataType.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataType.STRING(50),
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataType.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataType.STRING(200),
      allowNull: false
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'users'
  });

  const Tasks = sequelize.define('Tasks', {
    descriptions: {
      type: DataType.STRING(200),
      allowNull: false,
      unique: true
    },
    observation: {
      type: DataType.STRING(100),
      allowNull: false
    },
    userId: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'tasks',

    classMethods: {
      associate: (models) => {
        Tasks.belongsTo(models.User, {
          foreignKey: 'userId'
        });
      }
    }
  });
```

####Create route
===

```javascript
...
 server.route([
    {
      method: 'GET',
      path: '/user',
      config: {
        handler: Controller.list
      }
    },
    {
      method: 'GET',
      path: '/tasks',
      config: {
        handler: Controller.listTasks
      }
    }
  ]);
...    
```
####Create controller
===
```javascript
export const list = async (request, reply) => {
  try {
    const model = request.database.User;

    const options = {
      attributes: ['id', 'username', 'lastname', 'email'],
    };

    const values = await model.findAndCountAll(request.fieldsAll(options));

    return reply(values).header('allowing-fields', request.fieldsHeaders(options));
  } catch (err) {
    return reply.badImplementation(err);
  }
};

export const listTasks = async (request, reply) => {
  try {
    const model = request.database.Tasks;

    const options = {
      attributes: ['id', 'descriptions', 'observation'],
      include: [{
        model: request.database.User,
        attributes: ['id', 'username', 'lastname', 'email']
      }]
    };

    const values = await model.findAndCountAll(request.fieldsAll(options));

    return reply(values).header('allowing-fields', request.fieldsHeaders(options));
  } catch (err) {
    return reply.badImplementation(err);
  }
};

```
###Example Users
===
####request

```javascript
curl -X GET --header 'Accept: application/json' --header 'fields: id' 'http://localhost:3000/user'
```

####SQL
```javascript
SELECT 'id' FROM 'users' AS 'User';
```

####request
===
```javascript
curl -X GET --header 'Accept: application/json' --header 'fields: id, email' 'http://localhost:3000/user'
```

####SQL
```javascript
SELECT 'id', 'email' FROM 'users' AS 'User';
```

####Response Headers
{
  "allowing-fields": "username,firstName,lastName,email",
  ...
}

###Example Tasks
===
```javascript
curl -X GET --header 'Accept: application/json' 'http://localhost:3000/tasks'
```

####SQL
```javascript
SELECT 
	'Tasks'.'id', 
	'Tasks'.'descriptions', 
	'Tasks'.'observation', 
	'User'.'id' AS 'User.id', 
	'User'.'username' AS 'User.username', 
	'User'.'first_name' AS 'User.firstName', 
	'User'.'last_name' AS 'User.lastName', 
	'User'.'email' AS 'User.email' 
FROM 'tasks' AS 'Tasks' 
LEFT OUTER JOIN 'users' AS 'User' ON 'Tasks'.'user_id' = 'User'.'id';
```

===
```javascript
curl -X GET --header 'Accept: application/json' --header 'fields: id, User.id, User.username' 'http://localhost:3000/tasks'
```

####SQL
```javascript
SELECT 
	'Tasks'.'id', 
	'User'.'id' AS 'User.id', 
	'User'.'username' AS 'User.username' 
FROM 'tasks' AS 'Tasks' 
LEFT OUTER JOIN 'users' AS 'User' ON 'Tasks'.'user_id' = 'User'.'id';
```

####Response Headers
{
  "allowing-fields": "id,descriptions,observation,User.id,User.username,User.firstName,User.lastName,User.email",
  ...
}
