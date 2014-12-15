var app = angular.module('percents', ['ngResource']);

app.directive('numberModel', ['$timeout', function ($timeout) {

  function isAllowedKey (keycode) {
    return [0, 8, 44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57].indexOf(keycode) > -1;
  }

  function isSeparatorKey (keycode) {
    return [44, 46].indexOf(keycode) > -1;
  }

  return {

    scope: {
      numberModel: '=numberModel'
    },

    link: function (scope, elem, attrs) {
      var stored;

      function update () {
        $timeout(function () {
            scope.numberModel = parseFloat(elem.val());
            scope.$apply();
        });
      }
      
      scope.$watch('numberModel', function (value) {
        elem.val(value);
      });

      elem.on('keypress', function (event) {

        if (!isAllowedKey(event.which)) {
          event.preventDefault();
        } else if (!isSeparatorKey(event.which)) {

          /* Make decimal */
          if (stored) {
            elem.val(stored + String.fromCharCode(event.which) / 10);
            stored = null;
            event.preventDefault();
          }

          update();
          
        } else {

          /* Store valid value if separator pressed, prevent clearing */
          if (!stored && elem.val() % 1 === 0) {
            stored = + elem.val();
          } else {
            event.preventDefault();
          }

        }
      });

      elem.on('change', update);
    }

  };
}]);

app.factory('Item', function () {

  function Item (item, list, index) {
    var Percent = item.Percent || 0;
    
    this.Name = item.Name || '';

    this.__defineGetter__('Percent', function () {
      return Percent;
    });

    this.__defineSetter__('Percent', function (value) {
      if (value < 0) value = 0;
      if (value > 100) value = 100;
      Percent = parseFloat(value);
      list.balance([index]);
    });

    /* Method for correcting total percentage */
    this.correct = function (sum, except) {
      Percent = parseFloat((Percent - (sum - 100)).toFixed(2));

      if (Percent < 0) {
        Percent = 0;
        except.push(index);
        list.balance(except);
      }
    };
  }

  return Item;

});

app.factory('List', ['Item', function (Item) {

  function List (list) {
    var that = this;

    this.balance = function (except) {

      if (that.Items.length < 2 || that.Items.length < except.length) return;

      /* Calculating sum of percents */
      var sum = this.Items.reduce(function (sum, item) {
        return sum + item.Percent;
      }, 0);

      /* Searching for item which should compensate disbalance */
      var victim = this.Items.reduce(function (victim, item, index) {
        if (except.indexOf(index) > -1) return victim;
        if (!victim) return item;
        if (sum > 100 && item.Percent > victim.Percent) return item;
        if (sum < 100 && item.Percent < victim.Percent) return item;
        return victim;
      }, null);

      victim.correct(sum, except);
    };

    this.Items = list.map(function (item, index) {
      return new Item(item, that, index);
    });

    that.balance([]);
  }

  return List;

}]);

app.factory('ItemSource', ['$resource', function ($resource) {
  return $resource('/items/:count.json');
}]);

app.controller('SlidersController', ['$scope', 'ItemSource', 'List', function ($scope, ItemSource, List) {

  $scope.buttons = ['Один элемент', 'Два элемента', 'Три элемента', 'Четыре элемента', 'Пять элементов'];

  $scope.get = function (count) {
    $scope.sliders = null;
    ItemSource.get({
      count: count
    }, function (request) {
      $scope.sliders = new List(request.Items);
    });
  };

  $scope.get(3);

}]);

