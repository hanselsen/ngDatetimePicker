(function (app) {
	var scripts = document.getElementsByTagName("script");
	var currentScriptPath = scripts[scripts.length-1].src;

	app.directive('esdsDatepicker',
		['$rootScope', '$http', '$compile', '$filter', '$timeout',
			function ($rootScope, $http, $compile, $filter, $timeout) {

				var wrapperContent = '';

				return {
					restrict: 'A',
					require: '?ngModel',
					link: function(scope, elem, attr, ngModel) {
						elem = angular.element(elem);
						if(ngModel) elem.data('ngModel', ngModel);

						if(elem.hasClass('esds-datepicker-input-group')) return;
						if(elem.hasClass('esds-init')) return;
						elem.toggleClass('esds-init', true);

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
								eval('delete active.scope().' + active.attr('esds-model'));
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
							var _updateVal = function (elem) {
								var vals = [];
								if(elem.attr('esds-date') !== 'false') vals.push($filter('date')($rootScope.esds.dateModel, 'dd-MM-yyyy'));
								if(elem.attr('esds-time') !== 'false') vals.push($filter('date')($rootScope.esds.timeModel, 'HH:mm'));
								elem.val(vals.join(' ').trim());
								elem.parent().find('.esds-delete-button').toggleClass('hidden', elem.val() == '');
								if(elem.data('ngModel')) {
									eval('elem.scope().' + elem.attr('ng-model') + '="' + elem.val() + '"');
									elem.data('ngModel').$setValidity('required', elem.val() != '');
								}
								if(elem.attr('esds-change')) {
									eval('elem.scope().' + elem.attr('esds-change'));
								}
							};
							if($('[esds-model="'+elem.attr('esds-model')+'"]').length == 0) {
								_updateVal($(elem));
							} else {
								$('[esds-model="'+elem.attr('esds-model')+'"]').each(function () {
									_updateVal($(this));
								});
							}
						};
						updateVal(elem);

						$('.esds-datepicker-object').toggleClass('hidden', true);
						$rootScope.esds.cancel = function () {
							$('.esds-datepicker-object').toggleClass('hidden', true);
						};
						$rootScope.esds.save = function () {
							var newDatetime = combineDateAndTime($rootScope.esds.dateModel, $rootScope.esds.timeModel);
							var active = angular.element('.esds-active').removeClass('esds-active');
							if(active.length == 1) {
								eval('active.scope().' + active.attr('esds-model') + ' = newDatetime');
								updateVal(active);
								$('[esds-mindate="'+active.attr('esds-model')+'"]').each(function () {
									eval('var date = angular.element(this).scope().' + $(this).attr('esds-model'));
									if(date < newDatetime) {
										eval('angular.element(this).scope().' + $(this).attr('esds-model') + " = newDatetime");
										updateVal(angular.element(this));
									}
								});

								$('.esds-datepicker-object').toggleClass('hidden', true);
							}
						};

						var done = function () {
							elem.unbind('mousedown').bind('mousedown', function () {

								$('.esds-datepicker-object').toggleClass('hidden', false);

								var active = angular.element(this);
								active.toggleClass('esds-active', true).blur();

								$rootScope.esds['dateModel'] = new Date();
								$rootScope.esds['timeModel'] = new Date();

								$rootScope.esds.minDate = null;
								if(active.attr('esds-mindate') != undefined) {
									eval('var minDate = active.scope().' + active.attr('esds-mindate'));
									$rootScope.esds.minDate = minDate;
									$rootScope.esds['dateModel'] = minDate;
									$rootScope.esds['timeModel'] = minDate;
								}

								eval('var date = active.scope().' + active.attr('esds-model'));

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
									} else if (active.scope().esds.showDate) {
										$rootScope.esds.dateModel = strToDate(val[0]);
									} else if (active.scope().esds.showTime) {
										$rootScope.esds.timeModel = strToTime(val[0]);
									}
								}
								$timeout(function () {
									$('.esds-datepicker-object').toggleClass('hidden', false);
								}, 0);
							});
						};

						var wrapper = $('.esds-datepicker-object');
						if(wrapper.length == 1)
							wrapper.remove();

						var wrapperDone = function () {
							var wrapper = angular.element(wrapperContent);
							$('body').append(wrapper);
							$compile(wrapper.contents())($rootScope);
							$timeout(function () {
								$('.esds-datepicker-object .pull-left, .esds-datepicker-object .pull-right').on('click', function () {
									$('.esds-datepicker-object .text-muted').parent().hide();
									$('.esds-datepicker-object .active').removeClass('active');
								});
								$('.esds-datepicker-object .text-muted').parent().hide();
							}, 0);

							done();
						};
						if(wrapperContent == '') {
							$http({
								method: 'get',
								url: currentScriptPath.replace('esds-datetimepicker.js', 'wrapper.html')
							}).then(function (res) {
								wrapperContent = res.data;
								wrapperDone();
							});
						} else {
							wrapperDone();
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