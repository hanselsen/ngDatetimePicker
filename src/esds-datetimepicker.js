var scripts = document.getElementsByTagName("script")
var currentScriptPath = scripts[scripts.length-1].src;
(function (app) {
	app.directive('esdsDatepicker',
		['$rootScope', '$http', '$compile', '$filter', '$timeout',
			function ($rootScope, $http, $compile, $filter, $timeout) {

				var wrapperLoaded = false;

				return {
					link: function(scope, elem, attr) {
						elem = angular.element(elem);

						$rootScope.esds = {};

						var group = angular.element('<div class="form-group esds-datepicker-input-group" />');
						elem.wrap(group);
						var deleteBtn = angular.element('<div class="esds-delete-button glyphicon glyphicon-remove-sign" />');
						deleteBtn.insertAfter(elem);
						deleteBtn.unbind('click').bind('click', function () {
							delete $rootScope.esds.dateModel;
							delete $rootScope.esds.timeModel;
							var active = angular.element(this).parent().find('input');
							updateVal(active);
							$timeout(function () {
								eval('delete scope.' + active.attr('esds-model'));
							}, 0);
						});

						elem.unbind('keydown').bind('keydown', function (e) {
							e.preventDefault();
							e.stopPropagation();
						});

						eval('var date = elem.scope().' + elem.attr('esds-model'));
						if(date != undefined && !isNaN(date.getTime())) {
							$rootScope.esds['dateModel'] = date;
							$rootScope.esds['timeModel'] = date;
						}
						$rootScope.esds['showDate'] = elem.attr('esds-date') !== 'false';
						$rootScope.esds['showTime'] = elem.attr('esds-time') !== 'false';

						var updateVal = function (elem) {
							var vals = [];
							if($rootScope.esds.showDate) vals.push($filter('date')($rootScope.esds.dateModel, 'dd-MM-yyyy'));
							if($rootScope.esds.showTime) vals.push($filter('date')($rootScope.esds.timeModel, 'HH:mm'));
							elem.val(vals.join(' ').trim());
							elem.parent().find('.esds-delete-button').toggleClass('hidden', elem.val() == '');
						};
						updateVal(elem);

						$rootScope.showEsdsDatepicker = false;
						scope.cancel = function () {
							$rootScope.showEsdsDatepicker=false;
						};
						scope.save = function () {
							var newDatetime = combineDateAndTime($rootScope.esds.dateModel, $rootScope.esds.timeModel);
							var active = angular.element('.esds-active').removeClass('esds-active');
							eval('active.scope().' + active.attr('esds-model') + ' = newDatetime');
							updateVal(active);
							$rootScope.showEsdsDatepicker=false;
						};

						var done = function () {
							elem.unbind('mousedown').bind('mousedown', function () {
								var active = angular.element(this);
								active.addClass('esds-active').blur();
								eval('var date = scope.' + active.attr('esds-model'));

								$rootScope.esds['dateModel'] = new Date();
								$rootScope.esds['timeModel'] = new Date();
								if(date != undefined && !isNaN(date.getTime())) {
									$rootScope.esds['dateModel'] = date;
									$rootScope.esds['timeModel'] = date;
								} else {}
								$rootScope.esds['showDate'] = active.attr('esds-date') !== 'false';
								$rootScope.esds['showTime'] = active.attr('esds-time') !== 'false';

								var val = active.val().split(' ');
								if(val[0] != '') {
									if (val.length == 2) {
										$rootScope.esds.dateModel = strToDate(val[0]);
										$rootScope.esds.timeModel = strToTime(val[1]);
									} else if (scope.esds.showDate) {
										$rootScope.esds.dateModel = strToDate(val[0]);
									} else if (scope.esds.showTime) {
										$rootScope.esds.timeModel = strToTime(val[0]);
									}
								}
								$timeout(function () {
									$rootScope.showEsdsDatepicker = true;
								}, 0);
							});
						};

						if(!wrapperLoaded) {
                            wrapperLoaded = true;
							$http({
								method: 'get',
								url: currentScriptPath.replace('esds-datetimepicker.js', 'wrapper.html')
							}).then(function (res) {
								var el = angular.element(res.data);
								angular.element('body').prepend(el);
								$compile(el.parent().contents())(scope);
								el.removeClass('hidden');
								done();
							})
						} else {
							done();
						}
					}
				};
			}
		]
	);

	function combineDateAndTime(date, time) {
		if(time !== undefined) {
			date.setHours(time.getHours());
			date.setMinutes(time.getMinutes());
		}
		return new Date(date.getTime());
	}
	function strToDate(str) {
		var vals = str.split('-');
		return new Date(parseInt(vals[2]), parseInt(vals[1])-1, parseInt(vals[0]));
	}
	function strToTime(str) {
		var vals = str.split(':');
		return new Date(0, 0, 0, parseInt(vals[0]), parseInt(vals[1]));
	}

})(angular.module('esds-datepicker', ['ui.bootstrap']));