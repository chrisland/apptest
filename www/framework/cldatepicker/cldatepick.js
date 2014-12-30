
(function( $ ) {
	$.fn.cldatepick = function(options) {
		
		var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';
		
		var _root = this;
		var _settings = $.extend({
				// These are the defaults.
				day: 0,
				month: 0,
				year: 0,
				type:'date',
				format_seperator: '.',
				format_output: 'dd.mm.yyyy',
				month_list: [ "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
"Juli", "August", "September", "Oktober", "November", "Dezember" ]
			}, options );
		
		
		_root.attr('readonly', true);
		var _wrap = $('<div>',{'class':'cldatepick_wrap'});
		
		var getNow = function () {
		
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1;//January is 0!`
			
			var yyyy = today.getFullYear();
			if(dd<10){dd='0'+dd}
			if(mm<10){mm='0'+mm}
			var today = dd+_settings.format_seperator+mm+_settings.format_seperator+yyyy;
			return today;
		};
		
		
		

		var val = _root.val();
		if (!val) {
			val = '00.00.0000';
			val = getNow();
		}

		var init = val.split(_settings.format_seperator);
			_settings.day = parseInt(init[0]);
			_settings.month = parseInt(init[1]) -1;
			_settings.year = parseInt(init[2]);
		

		
		_root.off(clickOrTouch).on(clickOrTouch, function (e) {
			//_root.blur();
			render();
			return false;
		});


		
		var submit = function () {
			var day = _settings.day;
			if(day<10){day='0'+day}
			var month = _settings.month+1;
			if(month<10){month='0'+month}
			var val = _settings.format_output.replace('dd',day)
				.replace('mm',month)
				.replace('yyyy',_settings.year);
			if (val) {
				_root.val(val).trigger('change');
				
				_wrap.remove().html('');
			}
			
		};
		var render = function () {
		
			
			var box = $('<div>',{'class':'cldatepick_box', 'id':'cldatepick_box'});
			

			var box_picker = $('<div>',{'class':'cldatepick_box_picker'});
			var box_tools = $('<div>',{'class':'cldatepick_box_tools'});
			
			var box_tools_submit = $('<div>',{'class':'cldatepick_box_tools_submit','text':'OK'})
				.on(clickOrTouch, function () {
					
					submit();
					return false;
				});
			
			var box_tools_kill = $('<div>',{'class':'cldatepick_box_tools_kill','text':'Close'})
				.on(clickOrTouch, function () {
					_wrap.remove().html('');
					return false;
				});
				
			
			if (_settings.type == 'datetime') {
				
			} else {
				var day = render_item(3, 'day');
				var month = render_item(3, 'month');
				var year = render_item(3, 'year');
				
				
				box_picker.append(day)
					.append(month)
					.append(year);
			}
			
			box_tools.append(box_tools_kill).append(box_tools_submit);
			box.append(box_picker).append(box_tools);
			_wrap.append(box);
			
			$('body').append(_wrap);
			
			return true;
		};
		
		var render_item = function (anz, type) {
			
			var longpress = false;
			
			var width = 100 / anz;
			var item = $('<div>',{'class':'cldatepick_item','style':'width:'+width+'%'});
			
			var item_main = $('<div>',{'class':'cldatepick_item_main cldatepick_item_type_'+type});
			item_main.on(clickOrTouch, function () {
				
				if (type == 'month') {
					return false;
				}
				var input = $('<input>',{'type':'tel','class':'cldatepick_item_main_input', 'value':_settings[type], 'maxlength':4});
				input.on('change', function () {
					_settings[type] = parseInt(input.val());
					input.remove();
					item_main.text(_settings[type]);
				});
				item_main.html(input);
				
			});
			var item_up = $('<div>',{'class':'cldatepick_item_up'})
				.on(clickOrTouch,function() {
					var neu = _up(type);
					//console.log(neu);
					item_main.text(neu);
					return false;
				});
				
				

			var item_down = $('<div>',{'class':'cldatepick_item_down'})
				.on(clickOrTouch,function() {
					var neu = _down(type);
					//console.log(neu);
					item_main.text(neu);
					return false;
				});
			
			
			
			if (type == 'day') {
				if ( parseInt(_settings.month) > 0) {
					item_main.text(_settings.day);
				} else {
					_settings.day = 1;
					item_main.text(_settings.day);
				}
			} else if (type == 'month') {
			
				
				if (!isNaN(_settings.month) && parseInt(_settings.month) > 0) {
					item_main.text(_settings.month_list[_settings.month]);
				} else {
					_settings.month = 0;
					item_main.text(_settings.month_list[_settings.month]);
				} 
			} else if (type == 'year') {
				
				if ( parseInt(_settings.month) > 0) {
					item_main.text(_settings.year);
				} else {
					var today = new Date();
					_settings.year = today.getFullYear();
			
					item_main.text(_settings.year);
				}
			}

			item.append(item_up).append(item_main).append(item_down);
			return item;
		};
		
		
		var daysInMonth = function (month,year) {
		    return new Date(year, month, 0).getDate();
		};
		
		
		var _up = function (type) {
			if (type == 'day') {
				var maxDays = daysInMonth(_settings.month, _settings.year);
				if (_settings.day +1 <= maxDays) {
					_settings.day = _settings.day +1;
				} else {
					_settings.day = 1;
				}
				return _settings.day;
			} else if (type == 'month') {
				if (_settings.month_list[_settings.month+1]) {
					_settings.month = _settings.month +1;
					var maxDays = daysInMonth(_settings.month, _settings.year);
					if (_settings.day > maxDays ) {
						_settings.day = maxDays;
						$('#cldatepick_box .cldatepick_item_type_day').text(_settings.day);
					}
				}
				return _settings.month_list[_settings.month];
			} else if (type == 'year') {
				_settings.year = _settings.year +1;
				return _settings.year;
			}
			
		};
		var _down = function (type) {

			if (type == 'day') {
				if (_settings.day -1 > 0) {
					_settings.day = _settings.day -1;
				} else {
					var maxDays = daysInMonth(_settings.month, _settings.year);
					_settings.day = maxDays
				}
				return _settings.day;
			} else if (type == 'month') {

				
				if (_settings.month_list[_settings.month-1]) {
					_settings.month = _settings.month -1;
					var maxDays = daysInMonth(_settings.month, _settings.year);
					if (_settings.day > maxDays ) {
						_settings.day = maxDays;
						$('#cldatepick_box .cldatepick_item_type_day').text(_settings.day);
					}
				}
				return _settings.month_list[_settings.month];
				
				
			} else if (type == 'year') {
				if (_settings.year -1 > 1900) {
					_settings.year = _settings.year -1;
				}
				return _settings.year;
			}
			
			
		};
		
	};
	
	
	
}( jQuery ));


