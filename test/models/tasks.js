'use strict';

module.exports = (sequelize, DataType) => {
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

  return Tasks;
};
