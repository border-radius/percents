var app = angular.module('percents', []);

app.directive('numberModel', ['$timeout', function ($timeout) {
  return {
    scope: {
      numberModel: '=numberModel'
    },
    link: function (scope, elem, attrs) {
      var stored;
      
      scope.$watch('numberModel', function (value) {
        elem.val(value);
      });

      elem.on('keypress', function (event) {
        if ([0, 8, 44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57].indexOf(event.which) === -1) {
          event.preventDefault();
        } else if ([44, 46].indexOf(event.which) === -1) {
          if (stored) {
            elem.val(+stored + String.fromCharCode(event.which)/10);
            stored = null;
            event.preventDefault();
          }

          $timeout(function () {
            scope.numberModel = parseFloat(elem.val());
            scope.$apply();
          });
        } else {
          if (!stored && elem.val() % 1 === 0) {
            stored = elem.val();
          } else {
            event.preventDefault();
          }
        }
      });
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
      Percent = parseFloat(value);
    });
  }

  return Item;

});

app.factory('List', ['Item', function (Item) {

  function List (list) {
    this.Items = [];

    var that = this;

    list.forEach(function (item, index) {
      that.Items.push(new Item(item, that, index));
    });
  }

  return List;

}]);

app.controller('SlidersController', ['$scope', 'List', function ($scope, List) {

  $scope.sliders = new List([{
    Name: 'Item 1',
    Percent: 100
  }]);

}]);

