var app = angular.module('thomasWebsite', ['ui.router']);

app.config([
  '$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve : {
        postPromise : ['taken', function(taken){
          return taken.getAll();
        }]
      }
    })
    .state('taken', {
      url : '/taken/{id}',
      templateUrl : '/taken.html',
      controller : 'TakenCtrl'
    })
    .state('login', {
      url : '/login',
      templateUrl : '/login.html',
      controller : 'AuthCtrl',
      onEnter : ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    }).state('register', {
		url : '/register',
		templateUrl : '/register.html',
		controller : 'AuthCtrl',
		onEnter : ['$state', 'auth',
		function($state, auth) {
			if (auth.isLoggedIn()) {
				$state.go('home');
			}
		}]

	});
  $urlRouterProvider.otherwise('home');
  }
]);


app.factory('taken', ['$http', 'auth',
function($http, auth){
  var o = {
    taken : []
  };

  o.getAll = function(){
    return $http.get('/taken').success(function(data){
      angular.copy(data, o.taken);
    });
  };

  o.create = function(taak) {
    return $http.post('/taken', taak, {
      headers : {Authorization : 'Bearer ' + auth.getToken()}
    }).success(function(data){
      o.taken.push(data);
    });
  };
  return o;
}]);

app.factory('auth', ['$http', '$window',
function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['flapper-news-token'];
	}

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user) {
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function() {
		$window.localStorage.removeItem('flapper-news-token');
	};

	return auth;
}]);

app.controller('MainCtrl', [
'$scope',
'taken',
'auth',
function($scope, taken, auth){
  $scope.taken = taken.taken;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.title = '';
  $scope.addTaak = function() {
    if(!$scope.title || $scope.title==''){return;}
    taken.create({
      title : $scope.title,
      link : $scope.link,
      description : $scope.description,
    });
    $scope.title = '';
    $scope.link = '';
    $scope.description = '';
  };
}]);


app.controller('TakenCtrl', [
'$scope',
'taken',
'taak',
'auth',
function($scope, taken, taak,  auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.taak = taak;
}]);

app.controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};

	$scope.register = function() {
		auth.register($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};

	$scope.logIn = function() {
		auth.logIn($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};
}]);


app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
  }
]);
