
// IOS

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
		e.attr('href','maps:q='+k.plz+' '+k.ort+' '+k.strasse+' '+k.hn);
	};

	return {
		setLink: setLink
	}
}());





DEVICEOS.namespace('DEVICEOS.calendar');

DEVICEOS.calendar = (function () {

	var iosFoucs = 0,
	setInputEvents = function (domObj, content, lang, callback) {
		
		jQuery(domObj).off('focus');
		
		if (iosFoucs == 0) {	
			jQuery(domObj).on('focus',function(e) {
		        //alert('focus');
		        iosFoucs = 1;
		        jQuery(domObj).off('focus');
				makeMyCalEvent(e,content,lang);
				
		    });
	    }
	    
		jQuery(domObj).off('blur').on('blur',function(e) {
	        
	        //alert('blur');
			makeMyCalEvent(e,content,lang);
	    });
							    
	},
	insertEvent = function (domObj, options, success, error, callbackLog) {
		
			callbackLog();
	},
	getDateObj = function (time) {
	
		//alert(time);
		//ios : 
		var timeArr = time.split('-'),
			timeObj = new Date(timeArr[0],timeArr[1]-1,timeArr[2]) / 1000;
			
		//alert(timeObj);	
			
		return timeObj;
		//android:
		//return new Date(time) / 1000;
	};

	return {
		setInputEvents: setInputEvents,
		insertEvent: insertEvent,
		getDateObj: getDateObj
	}
}());











/*


function calendarPlugin()
{
}

calendarPlugin.prototype.createEvent = function(dateData, successCallback, errorCallback) {
    if (typeof errorCallback != "function")  {
        console.log("calendarPlugin.createEvent failure: errorCallback parameter must be a function");
        return
    }
    
    if (typeof successCallback != "function") {
        console.log("calendarPlugin.createEvent failure: successCallback parameter must be a function");
        return
    }
    
    //alert('jo');
	console.log(dateData);
    
    //alert(startDate+' # '+endDate);
    cordova.exec(successCallback,errorCallback,"calendarPlugin","createEvent", dateData);
};

*/

/*

calendarPlugin.install = function() {

    if(!window.plugins) {
        window.plugins = {};
    }
    
    window.plugins.calendarPlugin = new calendarPlugin();
    
    //cordova.exec(function () {},function () {},"calendarPlugin","createEvent", []);
    
    return window.plugins.calendarPlugin;
};

cordova.addConstructor(calendarPlugin.install);

*/

//var firstCal = 0;

function makeMyCalEvent (e,content,lang) {
							
	//alert('makeMyCalEvent');
									
	var form_date = jQuery(e.currentTarget)
		form_date_val = form_date.val();
	/*

	if (!form_date_val) {
		alert(form_date_val);
		return false;
	}
*/
	
	var inputDate = new Date ( form_date_val ),
		inputDateEndDate = new Date ( form_date_val ),
		inputDateMonth = inputDate.getMonth() +1;
	
	inputDateStart = inputDate.getFullYear() + "-" + inputDateMonth + "-" + inputDate.getDate() + " " +  inputDate.getHours() + ":" + inputDate.getMinutes() + ":" + inputDate.getSeconds();
	//inputDateEndMin = inputDate.getMinutes() + 30,
	
	var logDate = inputDate.getDate()+'.'+inputDateMonth+'.'+inputDate.getFullYear();
	
	inputDateEndDate.setMinutes ( inputDate.getMinutes() + 30 );
	
	
	var inputDateEndMonth = inputDateEndDate.getMonth() +1,
	inputDateEnd = inputDateEndDate.getFullYear() + "-" + inputDateEndMonth + "-" + inputDateEndDate.getDate() + " " +  inputDateEndDate.getHours() + ":" + inputDateEndDate.getMinutes() + ":" + inputDateEndDate.getSeconds();
	
	// console.log("creating event");
	// var title= "Eventtitel "+content,
	// location = "",
	// notes = "test 3",
	// startDate = "2013-12-20 09:30:00",
	// endDate = "2013-12-20 09:30:00",
	var	errCall = function(theerror) {
			console.log("Error occurred - " + theerror);
		},
		succCall = function(themessage) {
			console.log("Success - " + themessage);
			var userData = MYAPP.db.getUserByActive();
				
			//console.log(userData);
			
			userData.vscallist[content] = {'startdate':logDate};
			//console.log(userData.vscallist);
			
			SYS.db.insertUser(userData, function () {});
			
			//firstCal = 1;
	};

	var find = "<br>",
		regex = new RegExp(find, "g"),
		result = lang.replace(regex, " ");
	
	//alert(result);

	var dateData = ['Vorsorgeuntersuchung '+result, '', '',inputDateStart,inputDateEnd];
	window.plugins.calendar.createEvent(dateData, succCall, errCall);
	
	
/*

	var back = jQuery.get(
		'com_checkup/'+lang+'/checkupitem/head/'+content+'.tpl',
		function(data) {

			var find = "<br>",
				regex = new RegExp(find, "g"),
				result = data.replace(regex, " ");
			
			//alert(result);

			var dateData = ['Vorsorgeuntersuchung '+result, '', '',inputDateStart,inputDateEnd];
			window.plugins.calendar.createEvent(dateData, succCall, errCall);
	});
*/
}





