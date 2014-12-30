

(function($){
	
		
	/*
	*	Buttonset 
	*/

	$.fn.h6buttonset = function(options){
		
		var start = 0,
			root = $(this),
			init = function () {
				
				if (options && options.kill) {
					//alert('kill');
					root.find('.active').removeClass('active');
					root.data('val',0);
					
					if ( options.change) {
						options.change(val);
					}
					return true;
				}
				
				if (options && options.start) {
					start = options.start;
				}
				
				setVal(start);
			},	
			changeVal = function () {
				
				var val = $(this).data('content');
				setVal(val);
			},
			setVal = function (val) {
				
				//alert(val);
				
				root.find('.active').removeClass('active');
				root.find('.button[data-content="'+val+'"]').addClass('active');
				
				root.data('val',val);	
				
				if (options && options.change) {
					//alert('changed '+ val);
					options.change(val);
				} 
			};
		
		root.find('.button').off('click').on('click',changeVal);

		init();
	}
	
	/*
	*	Checkbox 
	*/
	$.fn.h6checkbox = function(options){
		
		var start = 0,
			first = 0,
			root = $(this),
			init = function () {
			
				if (options && options.kill) {
					//alert('kill');
					if (root.hasClass('active')) {
						root.removeClass('active');
					}
					root.data('val',0);
					
					if ( options.change ) {
						options.change(val);
					}
					return true;
				}
				
				
				if (options && options.start) {
					start = options.start;
					
				}
				setVal(start);
			},	
			changeVal = function (e) {
				
				var val = root.data('val');
				if (val == 0) {
					val = 1;
					
				}  else if (val == 1) {
					val = 0;
				}
				setVal(val);
			},
			setVal = function (val) {
				
				//alert(val);
				if (val == 0) {
					//val = 0;
					if (root.hasClass('active')) {
						root.removeClass('active');
					}
				}  else if (val == 1) {
					//val = 1;
					root.addClass('active');
				}
				
				root.data('val',val);	

				if (options && options.change && first == 1) {
					options.change(val);
					
				} 
				first = 1;
			};
		
		root.off('click').on('click',changeVal);

		init();
	}

	
})(jQuery);