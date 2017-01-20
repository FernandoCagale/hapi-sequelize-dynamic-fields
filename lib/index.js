'use strict';

const _ = require('lodash');

exports.register = (server, options, next) => {
  function getFields () {
    return this.headers.fields ? this.headers.fields.split(',').map((value) => value.trim()) : [];
  }

  function attributesInvalidError () {
    const _error = new Error('AttributesInvalidError');
    _error.name = 'AttributesInvalidError';
    throw _error;
  }

  function fieldsRelational (_relational, _fieldsDefault) {
    if (!this.headers.fields) return _fieldsDefault;

    const _fields = getFields.bind(this)().filter((x) => x.includes(_relational)).map(x => x.replace(`${_relational}.`, ''));

    const _difference = _.difference(_fields, _fieldsDefault);

    if (_difference.length > 0) {
      attributesInvalidError();
    }
    return _fields;
  }

  function fields (_fieldsDefault) {
    if (!this.headers.fields) return _fieldsDefault;

    const _fields = getFields.bind(this)().filter((x) => !x.includes('.'));

    const _difference = _.difference(_fields, _fieldsDefault);

    if (_difference.length > 0) {
      attributesInvalidError();
    }
    return _fields;
  }

  function getAlias (_options) {
    return _options.hasOwnProperty('alias') ? _options.alias : _options.model.name;
  }

  function getAttributesCustom (_options) {
    const alias = getAlias(_options);
    return fieldsRelational.apply(this, [alias, _options.attributes]);
  }

  function getAttributes (_object) {
    if (_object.hasOwnProperty('attributes')) {
      if (_object.hasOwnProperty('alias')) {
        return _object.attributes.map(x => _object.alias + '.' + x).join();
      } else if (_object.hasOwnProperty('model')) {
        return _object.attributes.map(x => _object.model.name + '.' + x).join();
      }
      return _object.attributes;
    }
  }

  function formatField (_fields, _newField) {
    if (_newField) {
      return _fields ? ',' + _newField : _newField;
    }
    return '';
  }

  const fieldsAll = function (_options) {
    const options = _.cloneDeep(_options);

    if (options.hasOwnProperty('attributes')) {
      options.attributes = fields.apply(this, [options.attributes]);
    }

    if (options.hasOwnProperty('include')) {
      if (Array.isArray(options.include)) {
        const _this = this;
        options.include.map(function (opt, i) {
          if (opt.hasOwnProperty('attributes')) {
            options.include[i].attributes = getAttributesCustom.apply(_this, [opt]);
          }
        });
      } else {
        if (options.include.hasOwnProperty('attributes')) {
          options.include.attributes = getAttributesCustom.apply(this, [options.include]);
        }
      }
    }
    return options;
  };

  const fieldsHeaders = function (_options) {
    let fields = '';

    fields += getAttributes(_options);

    if (_options.hasOwnProperty('include')) {
      if (Array.isArray(_options.include)) {
        const _fields = _options.include.map(x => getAttributes(x)).join();
        fields += formatField(fields, _fields);
      } else {
        if (_options.include.hasOwnProperty('attributes')) {
          const _fields = getAttributes(_options.include);
          fields += formatField(fields, _fields);
        }
      }
    }

    return fields;
  };

  server.decorate('request', 'fieldsAll', fieldsAll);
  server.decorate('request', 'fieldsHeaders', fieldsHeaders);

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
