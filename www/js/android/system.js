
// ANDROID

var DEVICEOS = DEVICEOS || {};

DEVICEOS.namespace = function (ns_string) {
	var parts = ns_string.split('.'),
		parent = DEVICEOS,
		i;
	
	// führenden, redundaten globalen Bezeichner entfernen
	if (parts[0] === 'DEVICEOS') {
		parts = parts.slice(1);
	}
	
	for(i = 0; i < parts.length; i += 1) {
		// Eigenschaften erstellen, wenn sie nicht schon vorhanden ist
		if (typeof parent[parts[i]] === 'undefined') {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	return parent;
};



DEVICEOS.namespace('DEVICEOS.map');

DEVICEOS.map = (function () {

	var setLink = function (e,k) {
	
		//geo:0,0?q=my+street+address
		e.attr('href','geo:0,0?q='+k.plz+' '+k.ort+' '+k.strasse+' '+k.hn);
	};

	return {
		setLink: setLink
	}
}());


DEVICEOS.namespace('DEVICEOS.calendar');

DEVICEOS.calendar = (function () {
	var currentField;
	var setInputEvents = function (domObj, callback) {
		
		
		var _open = false;
		jQuery(domObj).off('click').on('click',function(event) {
			 
			if (_open == true) {
				return false;
			}
			_open = true;
			
			
	        currentField = jQuery(domObj);
	       
	        var myNewDate = new Date();
	        
	        
	        
	        if (currentField.val()) {
	        	
	        	//alert( currentField.val() );
	        	var val = currentField.val();
	        	var formatedDate = moment( val ).format();
	        	
	        	//alert('setInputEvents 1: '+formatedDate+' # '+val);
	        	
	        	if (formatedDate == 'Invalid date') {
	        		//alert('hier! '+val);
		        	var tempDate = val.split('.');
		        	formatedDate = moment( tempDate[1]+'/'+tempDate[0]+'/'+tempDate[2] ).format();
		        	
		        	//alert('1: '+formatedDate);
		        	
		        	if (formatedDate == 'Invalid date') {
			        	formatedDate = moment().format();
		        	}
	        	}
	        	
	        	//alert('2: '+formatedDate);
	        	 
		        myNewDate = new Date( formatedDate );
		        
		      //  alert(myNewDate);
	        }
	         //var myNewDate = new Date();
	         //myNewDate = myNewDate.parse(currentField.val());
			 //alert(currentField.val());         
			 //alert(myNewDate);
	        // Same handling for iPhone and Android
	        //alert('click time'+myNewDate);
	        
	        plugins.datePicker.show({
	            date : myNewDate,
	            mode : 'date', // date or time or blank for both
	            allowOldDates : true
	        }, function(returnDate) {
	            var newDate = new Date(returnDate);
	            currentField.val(newDate.toString("dd/MMM/yyyy"));
	/*

	currentField.val('11111');
	currentField.value = '2222';
	jQuery(domObj).val('333');
	
				alert('OK!!!  '+newDate.toString("dd/MMM/yyyy"));
*/
	            // This fixes the problem you mention at the bottom of this script with it not working a second/third time around, because it is in focus.
	            
	            
	            
	           
	            currentField.blur();
	            callback(domObj);
	             
	            _open = false;
	            
	            e.preventDefault();
	            
	        }, function () {
		        alert('nö');
	        });
	       
	        return false;
	    });
		return false;					    
	},
	insertEvent = function (domObj, options, success, error, callbackLog) {
		
		var val = jQuery(domObj).val();
		
		//var formatedDate = val;
		
		//alert(val);

		//var val = currentField.val();
    	var formatedDate = moment( val ).format();
    	
    	//alert('setInputEvents 1: '+formatedDate);
    	
    	if (formatedDate == 'Invalid date') {
        	var tempDate = val.split('.');
        	formatedDate = moment( tempDate[1]+'/'+tempDate[0]+'/'+tempDate[2] ).format();
    	}
    	

    	//alert(formatedDate);
    	
    	
		var inputDateStart = new Date ( formatedDate );
		
		//alert('inputDateStart '+inputDateStart);
	        	
		var inputDateEnd = new Date ( inputDateStart.getTime() + 30*60000 ),
			inputDateStartMonth = inputDateStart.getMonth() +1
		
		var logDate = inputDateStart.getDate()+'.'+inputDateStartMonth+'.'+inputDateStart.getFullYear();
		
		//alert( options.title );
		//alert( inputDateStart );
		//alert( inputDateEnd );
			
		
		//var inputDateStart = new Date("August 20, 2013 10:00:00");
		//var inputDateEnd = new Date("August 20, 2013 11:00:00");
		//var title = "Hack on Phonegap";
		//var location = "The Basement";
		//var notes = "Hacking on open source projects late at night is the best!";
		//var success = function() { alert("woo hoo!"); };
		//var error = function(message) { alert("Doh! # "+message); };
		
		//alert(inputDateStart+' ### '+inputDateEnd);
		
		
		window.plugins.calendar.createEvent(options.title,options.location,options.notes,inputDateStart,inputDateEnd,success, error);
		
		/*

		console.log(inputDateStart);
		console.log(inputDateEnd);
		console.log(options);
		
*/
		
		//var calOptions = window.plugins.calendar.getCalendarOptions();
		
		//###window.plugins.calendar.createEvent(options.title,options.location,options.notes,inputDateStart,inputDateEnd,success, error);
		
		callbackLog(logDate);
		
	},
	getDateObj = function (time) {
	
		//ios : 
		//var timeArr = userData.age.split('-');
		//return new Date(timeArr[0],timeArr[1]-1,timeArr[2]) / 1000;
		//android:
		return new Date(time) / 1000;
	};

	return {
		setInputEvents: setInputEvents,
		insertEvent: insertEvent,
		getDateObj: getDateObj
	}
}());





