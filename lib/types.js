'use strict';

var ou = require('./objectUtils');

var alternative = require('./alternative');

var normalize = require('./normalise');

var resolve = require('./resolve');

var types = {
  alternative: function(fields, props) {
    var s = alternative.schema(props.getValue(props.path), props.schema, props.context);

    return types.object(fields, ou.merge(props, { schema: s }));
  },
  array: function(fields, props) {
    var move = function(props, i, n) {
      return function(to) {
        if(!canMoveUp(i, n) && !canMoveDown(i, n)) return;
        var newList = props.getOutput(props.path);
        var value = newList.splice(to, 1);

        newList.splice(i, 0, value[0]);
        props.update(props.path, newList, newList);
      };
    };
    var canMoveUp = function(i, n) {
      return i > 0 && i < n;
    };
    var moveUp = function(props, i, n) {
      return function() {
        if(!canMoveUp(i, n)) return;
        var newList = props.getOutput(props.path);
        var value = newList.splice(i, 1);
        newList.splice(i - 1, 0, value[0]);
        props.update(props.path, newList, newList);
      };
    };

    var canMoveDown = function(i, n) {
      return n > 1 && i < n - 1;
    };
    var moveDown = function(props, i, n) {
      return function() {
        if(!canMoveDown(i, n)) return;
        var newList = props.getOutput(props.path);
        var value = newList.splice(i, 1);

        newList.splice(i + 1, 0, value[0]);
        props.update(props.path, newList, newList);
      };
    };

    var canRemoveItem = function(i, n) {
      return i < n;
    };

    var isLastItem = function(i, n) {
      return i === n - 1;
    };

    var removeItem = function(props, i, n) {
      return function() {
        if(!canRemoveItem(i, n)) return;

        var newList = props.getOutput(props.path) || [];
        newList.splice(i, 1);
        props.update(props.path, newList, newList);
      };
    };

    var n = (props.getValue(props.path) || []).length;
    if( n === 0 && props.schema.minItems && props.schema.minItems === 1){
        n++;
    }
    var list = [];
    for (var i = 0; i < n; ++i) {
      list.push(fields.make(fields, ou.merge(props, {
        schema       : props.schema.items,
        path         : props.path.concat(i),
        move         : move(props, i, n),
        moveUp       : moveUp(props, i, n),
        moveDown     : moveDown(props, i, n),
        canMoveUp    : canMoveUp(i, n),
        canMoveDown  : canMoveDown(i, n),
        removeItem   : removeItem(props, i, n),
        isLastItem   : isLastItem(i, n),
        canRemoveItem: canRemoveItem(i, n),
      })));
    }

    return list;
  },
  object: function(fields, props) {
    var keys = fullOrdering(props.schema['x-ordering'], props.schema.properties);
    var addItem = function(props, path){
        return function(){
            var newList;
            var itemSchema = resolve(props.schema.properties[path[path.length-1]], props.context).items;
            if(resolve(itemSchema, props.context).type === 'object'){
                newList = (props.getOutput(path)||[]).concat([{_____:  'x'}]);

            }
            else{
                newList = (props.getOutput(path)||[]).concat(['']);
            }

            props.update(path, newList, newList);
        };
    }
    return keys.map(function(key) {
      return fields.make(fields, ou.merge(props, {
        addItem: addItem(props, props.path.concat(key)),
        schema: props.schema.properties[key],
        path  : props.path.concat(key)
      }));
    });
  },
};

module.exports = types;

function fullOrdering(list, obj) {
  var keys = Object.keys(obj || {});
  var result = [];
  var i, k;

  for (i in list || []) {
    k = list[i];
    if (keys.indexOf(k) >= 0) {
      result.push(k);
    }
  }

  for (i in keys) {
    k = keys[i];
    if (result.indexOf(k) < 0) {
      result.push(k);
    }
  }

  return result;
}
