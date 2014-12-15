var app = angular.module('percents', []);

app.directive('preventLetters', function () {
  return function (scope, elem, attrs) {
    elem.on('keypress', function (event) {
      if ([0, 8, 44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57].indexOf(event.which) == -1) {
        event.preventDefault();
      }
    });
  };
});

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

