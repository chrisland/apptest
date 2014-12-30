

/*

	DEBUG
*/

var bug = false;

var debug = function (name, obj) {
	if (!name) { return false; }
	var str = '';
	if (typeof obj == 'object') {
		str = JSON.stringify(obj);
	} else {
		str = obj;
	}
	if (str == undefined) {
		str = '';
	}
	jQuery('#debug').show().append('<div>'+name+' # '+str+'</div>');
}


/*

	APP START
*/




var clickOrTouch = 'click';
//var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';

window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);



var SYS = SYS || {};
SYS.namespace = function (ns_string) {
	var parts = ns_string.split('.'),
		parent = SYS,
		i;
	
	// führenden, redundaten globalen Bezeichner entfernen
	if (parts[0] === 'SYS') {
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

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}



SYS.namespace('SYS.init');



/*
*	Modul init 
*/

SYS.init = (function () {
	
	var initialize = function () {
		//console.log('initialize!');
		if (bug) { debug('SYS.init initialize' ); }
		bindEvents();
	},
	bindEvents = function () {
	
		if (bug) { debug('SYS.init bindEvents'); }
		
		document.addEventListener('deviceready', onDeviceReady, false);
		
		//document.addEventListener("pause", function () {
			//console.log('$ os pause');
		//}, false);
		
		document.addEventListener("resume", function () {
			//console.log('$ os resume');
			var networkState = navigator.connection.type;
			if (networkState == 'none') {
				onDeviceOffline();
			} else {
				onDeviceOnline();
			}
		}, false);
	},
	onDeviceOffline = function () {
	
		if (bug) { debug('onDeviceOffline'); }
		
		jQuery('#page_1  .pageBtn[data-page="7"], #page_1  .pageBtn[data-page="2"]')
			.off(clickOrTouch)
			.addClass('pageBtnOffline')
			.find('.menu-subline')
			.each(function () {
				jQuery(this).data('text', jQuery(this).text());
			})
			.text('Dieser Dienst ist nur online verfügbar');
	},
	onDeviceOnline = function () {
	
		if (bug) { debug('SYS.init onDeviceOnline'); }
	
		jQuery('#page_1 .pageBtn[data-page="7"], #page_1 .pageBtn[data-page="2"]')
			.on(clickOrTouch,SYS.page.changePage)
			.removeClass('pageBtnOffline')
			.find('.menu-subline')
			.each(function () {
				jQuery(this).text( jQuery(this).data('text') );
			});
		
		initialize();
	},
	onDeviceReady = function () {

		if (bug) { debug('SYS.init onDeviceReady', device.platform); }
		
		//console.log('$ os deviceready');

		//alert('jo3');
		//alert(device.platform);
		
		if (device.platform == 'Android') {
			//console.log('------------ bindEvents onBackButton');
			//onBackButtonListener();
			
			$.getScript( "js/android/system.js", function () {
				doReady();
				//alert('device '+device.platform);
			});
			
			
			document.removeEventListener('backbutton', onBackButton);
			document.addEventListener('backbutton', onBackButton);
	
		} else if(device.platform == 'iOS') {
			
			$.getScript( "js/ios/system.js", function () {
				doReady();
				//alert('device '+device.platform);
			});
		} else {
			doReady();
		}
		
	



	},
	doReady = function () {
	
	
		var networkState = navigator.connection.type;
		
		
		if (bug) { debug('SYS.init doReady', networkState); }
		
		if (networkState == 'none') {
			onDeviceOffline();
		}
		
		
		
		SYS.page.construct();
		
		
		SYS.db.construct();
		
		return false;
		
		
		
	},
	onBackButton = function () {

		if (bug) { debug('SYS.init onBackButton'); }
		
		//console.log('------------ onBackButton');
		//console.log( SYS.page.getPageHistory() );
		var history = SYS.page.getPageHistory(),
			last = history[history.length -2];
		if ( typeof last === 'object') {
			//console.log('history laenge '+history.length)
			//console.log( last.pageId );
			SYS.page.kickLastPageHistory(2);
			SYS.page.changePageById(last.pageId, last.pageId, last.pageId);
		} else {
			navigator.app.exitApp();
		}
 	},
 	setActiveUserBtn = function () {
 		if (bug) { debug('SYS.init setActiveUserBtn'); }
 		
 		
		var userData = SYS.db.getUserByActive()
			userBtns = jQuery('.btn_userName');
		if (userData.name != 'Nutzername') {
			userBtns.html(userData.name);
		}
	};
	
	return {
		initialize: initialize
		,setActiveUserBtn: setActiveUserBtn
	}
}());






SYS.namespace('SYS.db');


/*
*	Modul Database 
*/

SYS.db = (function(){
	

	var getLocalDb = function(dbName) {
		return window.localStorage.getItem(dbName) || '{}';
	},
	getLocalDbObject = function(dbName) {
		var localDb = window.localStorage.getItem(dbName) || '{}';
		var obj = JSON.parse(localDb);
		if (typeof obj === 'object') {
			return obj;
		}
		return false;
	},
	setLoaclDb = function (dbName,obj,callback) {
		if ( dbName && typeof dbName === 'string' && typeof obj === 'object') {
			var str = JSON.stringify(obj);
			window.localStorage.setItem(dbName,str);
			if (callback) { callback(); }
		}
		return false;
	},
	getUserByActive = function () {
		var returnObj = {},
			userBase = getLocalDbObject('userBase');
		jQuery.each(userBase.user,function (k,i) {
			if (i['active'] == "1") {
				returnObj = i;
				return returnObj;
			}
		});
		return returnObj;
	},
	getUserById = function (id) {
		var returnObj = {};
		var userBase = getLocalDbObject('userBase');
		jQuery.each(userBase.user,function (k,i) {
			if (i['id'] == id) {
				returnObj = i;
				return returnObj;
			}
		});
		return returnObj;
	},
	setUserToActive = function (id,callback) {
		
		var userBase = getLocalDbObject('userBase');
		jQuery.each(userBase.user,function (k,i) {
			if (i.active == "1") {
				userBase.user[k].active = "0";
			}
			if (i.id == id) {
				userBase.user[k].active = "1";
			}
		});
		setLoaclDb('userBase',userBase,function (){
			callback();
		});
	},
	delUserById = function (id,callback) {
		var userBase = getLocalDbObject('userBase');
		var del_id = null;
		jQuery.each(userBase.user,function (k,i) {
			if (i.id == id) {
				del_id = k;
			}
		});
		if (userBase.user.length > 1) {
			userBase.user.splice(del_id, 1);
		}
		setLoaclDb('userBase',userBase,function (){
			callback();
		});
	},
	insertUser = function (obj,callback) {
		var userBase = getLocalDbObject('userBase');
		
		// MALE / FEMALE usw...
			
			// female = 2
			// male = 1
			// both = 0
			
		var newUser = {
			name : "Nutzername",
			active : 0,
			age : "00.00.0000",
			age_range : 0,
			lang: 'de',
			gender : 0,
			pregnancy : 0,
			vsblacklist: [],
			vscallist: {}
		};
		jQuery.each(newUser,function (k,i) {
			if (obj[k]) {
				newUser[k] = obj[k];
			}
		});
		if (!userBase.user) {
			userBase.user = [];
		}
		
		newUser.id = obj.id;
		if (!newUser.id) {
			if ( userBase.user[userBase.user.length-1] ) {
				newUser.id = parseInt(userBase.user[userBase.user.length-1].id) +1;
			} else {
				newUser.id = 1;
			}
			userBase.user.push(newUser);
		} else {
			jQuery.each(userBase.user,function (k,i) {
				if (i.id == newUser.id) {
					userBase.user[k] = newUser;
				}
			});
		}
		setLoaclDb('userBase',userBase,function (){
			if (callback) { callback(); }
		});
	},
	setupIgelApi = function () {
		
		//setLoaclDb('igelVersion',{});
		//setLoaclDb('igel',{});
		
		var networkState = navigator.connection.type;
		if (networkState == 'none') {
			return false;
		}
		
		
		if (bug) { debug('SYS.db setupIgelApi'); }
		
		
		var igelVersion = getLocalDb('igelVersion');
		var url = 'http://www.h-sechs.de/aok_igel/v1/api/version/';
		jQuery.ajax({
		   type: 'GET',
		    url: url,
		    contentType: "application/json",
		    dataType: 'jsonp',
		    jsonpCallback: 'success'
		    
		}).done(function(data) {
			//console.log(data);
			if (bug) { debug('SYS.db setupIgel Version done',{'version':data}); }
			//if (bug) { debug('SYS.db setupIgelApi igelBase',igelBase); }
			
			
			if (igelVersion == '{}' || parseInt(igelVersion.version) < parseInt(data) ) {
				
				var insertVersion = {"version":data};
				
				setLoaclDb('igelVersion',insertVersion, function () {
					if (bug) { debug('SYS.db setupIgel Version Fill DONE',insertVersion); }
					return false;
				});

				var url = 'http://www.h-sechs.de/aok_igel/v1/api/full/';
				jQuery.ajax({
				   type: 'GET',
				    url: url,
				    contentType: "application/json",
				    dataType: 'jsonp',
				    jsonpCallback: 'success'
				    
				}).done(function(igeldata) {
					//console.log(data);
					if (bug) { debug('SYS.db setupIgelApi done'); }
					
					setLoaclDb('igel',igeldata, function () {
						if (bug) { debug('SYS.db setupIgelApi Fill DONE'); }
						SYS.page.changePageById(9,'loadIgelKoerper');
						return false;
					});	
				})
				.fail(function(e) {
				  //console.log('error',e);
				  if (bug) { debug('SYS.db setupIgelApi fail', e); }
				})
				.always(function(e, igeldata) {});
				
				
				
			} else {
				SYS.page.changePageById(9,'loadIgelKoerper');
			}
					
					
		})
		.fail(function(e) {
		  //console.log('error',e);
		  if (bug) { debug('SYS.db setupIgel Version fail', e); }
		})
		.always(function(e, data) {});

		return false;
	},
	setupCheckup = function () {
		
		//setLoaclDb('checkup',{});
		
		if (bug) { debug('SYS.db setupCheckup'); }
		var checkupBase = getLocalDb('checkup');
		var checkupBaseObj = getLocalDbObject('checkup');
		
			
			jQuery.getJSON("com_checkup/db.json", function(data){         
				if (data) {
					
					if (bug) { debug('SYS.db setupCheckup Check'); }
					
					if (checkupBase == '{}') {	
						if (bug) { debug('SYS.db setupCheckup Empty'); }
						setLoaclDb('checkup',data, function () {
							if (bug) { debug('SYS.db setupCheckup Fill DONE'); }
							return false;
						});
						
					} else {
						
						if (bug) { debug('SYS.db setupCheckup Check Version ', {"api":data.version, "local":checkupBaseObj.version}); }
						if (data.version != checkupBaseObj.version) {
							setLoaclDb('checkup',data, function () {
								if (bug) { debug('SYS.db setupCheckup Update DONE'); }
								return false;
							});
						}
					}
				}
			});
		return false;
	},
	construct = function () {
	
		if (bug) { debug('SYS.db construct'); }
		
		setupCheckup();
		
		//setLoaclDb('userBase', {});

		var userBase = getLocalDb('userBase');
		if (userBase == '{}') {	
			SYS.page.changePageById(12,'firstToCom');
			return false;
		} else {
			SYS.page.changePageById(1,'loadStart');
			SYS.init.setActiveUserBtn();
		}
		
		if (bug) { debug('SYS.db :userBase'); }
		
		return false;
	};
    
	return {

		construct: construct,
		getLocalDbObject: getLocalDbObject,
		insertUser: insertUser,
		getUserById: getUserById,
		getUserByActive: getUserByActive,
		delUserById: delUserById,
		setUserToActive: setUserToActive,
		setupCheckup: setupCheckup,
		setupIgelApi: setupIgelApi
	};
	
}());






/*
*	Modul Page 
*/


SYS.page = (function(){
	
	
	var open = 0,
	lastopen = 0,
	timerOverlay = 0,
	pageHistory = [],
	dateFormat = 'DD.MM.YYYY',
	lang = 'de',
		
	construct = function () {
		
		if (bug) { debug('SYS.page construct'); }
		
		var page_anz = jQuery('.page').length;
		if (page_anz > 1 && typeof page_anz === 'number') {
			jQuery('.page').hide();
			//jQuery('.page:first').show();
		}
		jQuery('.pageBtn').each(function () {
			var ref = jQuery(this).data('page'),
				task = jQuery(this).data('task');
			if ( (ref && typeof ref === 'number') || task ) {
				jQuery(this).off(clickOrTouch).on(clickOrTouch,changePage);
			}
		});
		
		return open;
	},
	changePageById = function(pageId,pageTask,pageContent) {
		
		if (bug) { debug('SYS.page changePageById', {'pageId':pageId, 'pageTask':pageTask, 'pageContent':pageContent}); }
		
		var task = changeContent( null, pageTask, pageContent, pageId);
		if (task) {
			fadePageDom(pageId);
			addPageHistory(pageId,pageTask,pageContent);
		}
		return false;
	},
	changePage = function (e) {
		
		if (bug) { debug('- Click : pageBtn'); }
		
		if (jQuery(e.currentTarget).hasClass('pageBtnOffline')) {
			return false;
		}
		var pageId = jQuery(e.currentTarget).data('page'),
			pageTask = jQuery(e.currentTarget).data('task'),
			pageContent = jQuery(e.currentTarget).data('content');
			
		//alert(open+'changePage '+pageId);
		
		if (bug) { debug('SYS.page changePage', {'pageId':pageId, 'pageTask':pageTask, 'pageContent':pageContent}); }
		
	
		var task = changeContent( e, pageTask, pageContent, pageId );
		if (task) {
			fadePageDom(pageId);
			addPageHistory(pageId,pageTask,pageContent);
		}
		return false;
	},
	changeContent = function (e, task, content, pageId) {
		if (bug) { debug('SYS.page changeContent', {'task':task, 'content':content, 'pageId':pageId}); }
		
		if (SYS.task[task]) {
			return SYS.task[task](content,e);
			//return true;
		} else {
			if (bug) { debug('ERROR SYS.page changePage - no task function find:', task); }
			//return false;
		}
		return true;
	}
	fadePageDom = function (pageId) {
		
		if (bug) { debug('SYS.page fadePageDom', {'pageId':pageId, 'lastopen':lastopen}); }
		
		if (pageId && jQuery('#page_'+pageId).length > 0 ) {
			jQuery('body').find('.page').hide();
			jQuery('body').find('#page_'+pageId).show();
			lastopen = open;
			open = pageId;
		}
		return false;
	},
	addPageHistory = function (pageId,pageTask,pageContent) {
		
		if (bug) { debug('SYS.page addPageHistory',{'pageId':pageId, 'pageTask':pageTask, 'pageContent':pageContent}); }
		
		var obj = {
			pageId: pageId,
			pageTask: pageTask,
			pageContent: pageContent
		};
		pageHistory.push(obj);	
		
		if (bug) { debug(' ------------------ '); }
	},
	kickLastPageHistory = function (anz) {
		if (bug) { debug('SYS.page kickLastPageHistory', anz); }
		pageHistory = pageHistory.slice(0, pageHistory.length - anz);
	},
	openOverlay = function (type,time) {
		
		jQuery('#overlay')
			.css('background-image','url(img/overlay/'+type+'.svg)')
			.fadeIn(500)
		if (time) {
			clearTimeout(timerOverlay);
			timerOverlay = setTimeout(function (){
				closeOverlay();
			},time);
		}
	},
	closeOverlay = function () {
		jQuery('#overlay').fadeOut(400);
	},
	getLastopen = function () {
		return lastopen;
	},
	getLang = function () {
		return lang;
	};
	
	return {
		construct: construct
		,changePage: changePage
		,addPageHistory: addPageHistory
		,changePageById: changePageById
		,kickLastPageHistory: kickLastPageHistory
		,changeContent: changeContent
		,openOverlay: openOverlay
		,closeOverlay: closeOverlay
		,getLastopen: getLastopen
		,getLang: getLang
	}
	
}());




var _urlExit = [
		"https://aok.wlab.mobile.weisse-liste.de/exit"
		,"https://aok.wlae.mobile.weisse-liste.de/exit"
		,"https://registrierung-aok24.aok.de/arztnavigatormobil/index.php/exit"
		,"https://aok.wlae.mobile.weisse-liste.de/exit"
	];

SYS.task = (function(){

	var nix = function (content) {
		if (bug) { debug('SYS.task -> nix'); }
		return true;
	},
	loadStart = function (content) {
		if (bug) { debug('SYS.task -> loadStart'); }
		SYS.init.setActiveUserBtn();
		return true;
	},
	firstToCom = function (content) {
	
		if (bug) { debug('SYS.task -> firstToCom'); }
		
		$('body').addClass('first_page_11');
		
		$('#start_agerange_select').on('change',function(e) {
			jQuery(e.currentTarget).data('task','firstSave');
			SYS.page.changePage(e);	
		});
		
		
		$('#page_13 #start_age_input').cldatepick();
		
		
		$('#page_13 #start_age_input').on('change',function(e) {
			jQuery(e.currentTarget).data('page',1).data('task','firstSave');
			SYS.page.changePage(e);
		});
		


		$('#start_name_input').on('change',function(e) {
			$('#start_name_input').blur();
			jQuery(e.currentTarget).data('page','13').data('task','firstFivePage');
			SYS.page.changePage(e);
		});
		

	
		return true;
	},
	firstSkip = function (content) {
		if (bug) { debug('SYS.task -> firstSkip'); }
		
		$('body')
			.removeClass('first_page_11')
			.removeClass('first_page_12')
			.removeClass('first_page_13')
			.removeClass('first_page_15');
		
		var blankUser = {
				name : "Nutzername",
				active : 1,	
				lang: 'de'					
			};
		SYS.db.insertUser(blankUser, function () {
			SYS.page.changePageById(1,'loadStart');
		});
		return true;
	},
	firstSave = function (content) {
		if (bug) { debug('SYS.task -> firstSave'); }
		
		/*
var myage = jQuery('#start_age_input').val();
		if (myage == 'Invalid date') {
			myage = '00-00-0000';
		}
*/
		var firstUser = {
			name : jQuery('#start_name_input').val(),
			active : 1,
			age : jQuery('#start_age_input').val(),
			age_range : jQuery('#start_agerange_select').val(),
			gender : jQuery('#start_gender').val(),	
			lang : jQuery('#start_lang_select').val()				
		};

		$('#start_agerange_select').off('change');
		$('#start_age_input').off('change');
		$('#start_name_input').off('change');
		
		
		$('body')
			.removeClass('first_page_11')
			.removeClass('first_page_12')
			.removeClass('first_page_13')
			.removeClass('first_page_15');
			
			
		SYS.db.insertUser(firstUser, function () {
			
			if (bug) { debug('SYS.task -> firstSave insertUser', firstUser); }
			SYS.page.changePageById(1,'loadStart');
			
		});
		return false;
	 },
	firstFivePage = function (content) {
	 	if (bug) { debug('SYS.task -> firstFivePage'); }
		$('body').addClass('first_page_15');
		return true;
	 },
	userGetList = function (content) {
		if (bug) { debug('SYS.task -> userGetList'); }
		var html = jQuery('<ul></ul>');
		var userBase = SYS.db.getLocalDbObject('userBase');
		jQuery.each(userBase.user, function (k,i){
			var divUser = jQuery('<div></div>')
							.addClass('userName')
							.addClass('float-left hoehe-1')
							.text(i.name)
							.data('id','user-'+i.id)
							.on(clickOrTouch, function (e) {
								if (bug) { debug('SYS.task -> userGetList -Click userGetEdit id:', jQuery(this).data('id')); }
								//SYS.page.changeContent(e, 'userGetEdit', jQuery(this).data('id') );
								SYS.page.changePageById(23,'userGetEdit',jQuery(this).data('id'));
							});
			var divMainUser = jQuery('<div></div>')
							.addClass('divMainUser')
							.addClass('hoehe-1')
							.addClass('float-right')
							.data('id',i.id)
							.on(clickOrTouch, function (e) {
								var del_user_id = $(this).data('id');
								if (bug) { debug('SYS.task -> userGetList -Click setUserToActive id:', del_user_id); }
								SYS.db.setUserToActive(del_user_id, function () {
									
									SYS.init.setActiveUserBtn();
									SYS.page.changePageById(22,'userGetList');
								});
							});
			if (i.active == 1) {	
				divMainUser.addClass('mainUser');
				divUser.text( divUser.text()+' (Hauptbenutzer)');
			}
			var li = jQuery('<li class="hoehe-1 padding white schatten-aussen"></li>')
				.append(divUser)
				.append(divMainUser);
			html.append(li);
		});
		jQuery('#page_22 .content').html('').append(html);
		return true;
	},
	userClearForm = function(content) {
		if (bug) { debug('SYS.task -> userClearForm'); }
		jQuery('#page_23 .trash').hide();
		jQuery('#page_23 .trashDialog').hide();
		jQuery('#page_23 #form_id').val('');
		jQuery('#page_23 #userNew_form_name').val('');
		jQuery('#page_23 #userNew_form_date').val('');
		jQuery('#page_23 .form_gender').h6buttonset({start: 0, change: function (content) {
			jQuery('#page_23 #form_gender').val( content );
		}});
		jQuery('#page_23 .form_pregnancy').h6checkbox({start: 0, change: function (content) {
			jQuery('#page_23 #form_pregnancy').val( content );
		}});
		jQuery('#form_hauptbenutzer').val('');
		
		
		$('#page_23 #userNew_form_date').cldatepick();
		
		/*

		
		if (device.platform == 'Android') {
			//alert('userClearForm');

			if (bug) { debug('SYS.task -> userClearForm : Platform Android',device.platform); }

			DEVICEOS.calendar.setInputEvents(jQuery('#page_23 #userNew_form_date'), function (e) { 
			
				var formatedDate = moment(jQuery('#page_23 #userNew_form_date').val()).format(dateFormat);
				jQuery('#page_23 #userNew_form_date').val(formatedDate);
				
				//alert( jQuery(e.currentTarget).val() ); 	
				
			});
		

		} else if (device.platform == 'iOS') {
			
			if (bug) { debug('SYS.task -> userClearForm : Platform iOS ',device.platform); }
			
			$('#page_23 #userNew_form_date').attr('type','date');
			

		} else {
			if (bug) { debug('SYS.task -> userClearForm : Platform else'); }
		}
		
		
*/
		
		jQuery('#page_23 #form_lang_select').val('de');
		
		return true;
	},
	userSetNew = function (content) {
		if (bug) { debug('SYS.task -> userSetNew'); }
		 var newUser = {
				name : jQuery('#userNew_form_name').val(),
				age : jQuery('#userNew_form_date').val(),
				gender : jQuery('#form_gender').val(),
				active : jQuery('#form_hauptbenutzer').val(),
				pregnancy : jQuery('#form_pregnancy').val(),
				lang : jQuery('#form_lang_select').val(),
				vsblacklist: [],
				vscallist: {}				
			};
		//alert(newUser.age);
		/*
if (device.platform == 'Android') {
		
			
        	var tempDate = newUser.age.split('.');
        	newUser.age = moment( tempDate[1]+'/'+tempDate[0]+'/'+tempDate[2] ).format();
		}
		
*/
		//alert('OK '+newUser.age);
		var id = jQuery('#form_id').val();
		if ( id ) {
			newUser.id = id;
			var userData = SYS.db.getUserById(id);
			newUser.vscallist = userData.vscallist;
			newUser.vsblacklist = userData.vsblacklist;
		}
		SYS.db.insertUser(newUser, function () {
			if (bug) { debug('SYS.task -> userSetNew: insertUser done!'); }
			SYS.init.setActiveUserBtn();
			SYS.page.changePageById(22,'userGetList');
		});
		return false;
	 },
	userGetEdit = function (content) {
		if (bug) { debug('SYS.task -> userGetEdit'); }
		jQuery('#page_23 .trashDialog').hide();
		var id = content.split('-'); 
		var userData = SYS.db.getUserById( id[1] );
		if (bug) { debug('SYS.task -> userGetEdit :userData',userData); }
		if (userData.active == "1") {
			jQuery('#page_23 .trash').hide();
		} else {
			jQuery('#page_23 .trash').show();
		}
		if ( userData.name == 'Nutzername' ) {
			userData.name = '';
			jQuery('#page_23 #userNew_form_name').val('');
		}
		//|| userData.age != '0000-00-00'
		
		
		if(userData.age) {
			$('#page_23 #userNew_form_date').val(userData.age);
		}
		
		$('#page_23 #userNew_form_date').cldatepick();
		
		/*

		if(userData.age ) {
			
			//alert('age: '+userData.age);


			if (device.platform == 'Android') {
				
//if (userData.age == '0000-00-00' || userData.age == 'Invalid date' ) {
//					//userData.age == new Date();
//					//alert(userData.age);
//					userData.age = moment().format(dateFormat);
//					alert('formatedDateNow: '+userData.age);
//				}
				

				userData.age = moment(userData.age).format(dateFormat);
			//	alert(formatedDate);
				jQuery('#page_23 #userNew_form_date').val(userData.age);
				jQuery('#page_23 #userNew_form_date').removeClass('inputDate-newUserBirthday');
			} else {
				$('#page_23 #userNew_form_date').attr('type','date').val(userData.age);
			}
			
		
			
			
			
			
		} else if ( !$('#page_23 #userNew_form_date').attr('type') == 'text') {
			$('#page_23 #userNew_form_date').attr('type','text').attr('placeholder','Geburtsdatum');
		} 
		
*/

		if(userData.lang) {
			jQuery('#page_23 #form_lang_select').val(userData.lang);
		}
		
		

		
		/*

		if (device.platform == 'Android') {
		//alert('jp');
			DEVICEOS.calendar.setInputEvents(jQuery('#page_23 #userNew_form_date'), function (e) {

				var formatedDate = moment(jQuery('#page_23 #userNew_form_date').val()).format(dateFormat);
				jQuery('#page_23 #userNew_form_date').val(formatedDate);
				
				//alert( 'hier:'+jQuery('#page_23 #userNew_form_date').val() ); 
				
			});
		} else {
			$('#page_23 #userNew_form_date').on('focus',function(e) {
				$(e.currentTarget).attr('type','date');
			});

		}
		
*/

		
		jQuery('#page_23 #form_id').val(userData.id);
		jQuery('#page_23 #userNew_form_name').val(userData.name);
		jQuery('#form_hauptbenutzer').val(userData.active);
		jQuery('#page_23 .form_gender').h6buttonset({start: userData.gender, element: '.button', change: function (content) {
			jQuery('#page_23 #form_gender').val( content );
		}});
		jQuery('#page_23 .form_pregnancy').h6checkbox({start: userData.pregnancy, element: '.button', change: function (content) {
			jQuery('#page_23 #form_pregnancy').val( content );
		}});
		jQuery('#page_23 #form_pregnancy').val( userData.pregnancy );
		jQuery('#page_23 .trash').off(clickOrTouch).on(clickOrTouch,function () {
			if (bug) { debug('SYS.task -> userGetList -Click trash'); }
			jQuery('#page_23 .trashDialog').fadeIn(500).off(clickOrTouch).on(clickOrTouch,function () {
			
				var user_id = jQuery('#page_23').find('#form_id').val();
				if (bug) { debug('SYS.task -> userGetList -Click trash user id',user_id); }
				SYS.db.delUserById(user_id,function () {
					SYS.page.changePageById(22,'userGetList');
				});
			});
		});	
		//SYS.page.changePageById(23,'');
		return true;
	},
	standortLoad = function (content) {
		if (bug) { debug('SYS.task -> standortLoad'); }
		$('#docsearch_form')
			//.off('submit',_standortSubmit)
			.on('submit',_standortSubmit);
			
		$('#page_7 .gps').off(clickOrTouch).on(clickOrTouch,function () {
			//alert('click');
			if (bug) { debug('SYS.task -> standortLoad -click gps'); }
			navigator.geolocation.getCurrentPosition(
				_standortGpsSuccess,
				_standortGpsError );
		});
		return true;	
	},
	_standortSubmit = function (e) {
		var val = jQuery('#docsearch_form .docsearch_text').val();
		if (bug) { debug('SYS.task -> _standortSubmit', val); }
		$('#docsearch_form .docsearch_text').blur();
		_standortRender( val );
		return false;
	},
	_standortGpsSuccess = function (position) {
		//alert('gps ok');
		if (bug) { debug('SYS.task -> _standortGpsSuccess'); }
		_standortRender('',position.coords.latitude,position.coords.longitude);
		return true;
	},
	_standortGpsError = function (error) {
		if (bug) { debug('SYS.task -> _standortGpsError'); }
		jQuery('#page_7 .gps').addClass('pageBtnOffline').off(clickOrTouch);
		return true;
	},
	_standortRender = function (str,lat,lon,page,limit) {
		if (bug) { debug('SYS.task -> _standortRender'); }
		SYS.page.openOverlay('spinner');
		if (page == undefined) {
			page = 1;
		}
		if (limit == undefined) {
			limit = 50;
		}
		var getString = '',
			searchParam = ''; 
		if (str) {
			searchParam = '&plz_ort='+str;
		} else if (lat && lon) {
			searchParam = '&longitude='+lon+'&latitude='+lat;
		}
		if (searchParam == '') {
			if (bug) { debug('ERROR SYS.task -> _standortRender - no searchParam', e); }
			SYS.page.closeOverlay('spinner');
			return false;
		}
		getString = 'https://www.aok.de/src/bundesweit/geschaeftsstellen/json.php?limit='+limit+'&range=50&page='+page+searchParam;
		//alert(getString);
		if (bug) { debug('SYS.task -> _standortRender http-string', getString); }
		jQuery('#page_7 .list').animate({ scrollTop: 0 }, "slow");
		var back = jQuery.getJSON(getString, {}, function (data) {
			if (data.treffer > 0) {

				var liste = jQuery('<ul/>');
				jQuery.each(data.geschaeftstellen, function (i,k) {
						var detail_json = '{"desc":"'+k.beschreibung+'", "strasse":"'+k.strasse+'", "hn":"'+k.hausnummer+'", "plz":"'+k.plz+'", "ort":"'+k.ort+'", "tel":"'+k.telefon+'"}';
						var li = jQuery('<li class="hoehe-2 padding white schatten-aussen grey menu-standard"></li>')
								//.addClass('pageBtn')
								//.data('page','8')
								//.data('task','loadGeschsucheDetail')
								.off(clickOrTouch)
								.on(clickOrTouch,function () {
									
									var e = {};
									e.currentTarget = {};
									jQuery(e.currentTarget).data('page','8');
									jQuery(e.currentTarget).data('content',detail_json);
									jQuery(e.currentTarget).data('task','standortDetail');
									
									if (bug) { debug('SYS.task -> _standortRender -click pageBtn'); }
									SYS.page.changePage(e);
								})
								.html('<span class="menu-headline">'+k.beschreibung+'</span><br><span class="eventdate">'+k.strasse+' '+k.hausnummer+'<br>'+k.plz+ ' ' +k.ort+'</span>');
					liste.append(li);
				});
				jQuery('#page_7 .list').html(liste).show();
					if (bug) { debug('SYS.task -> _standortRender render done!'); }
			} else {
				jQuery('#page_7 .list').html('').hide();
				jQuery('#page_7 .pagination').hide();
				jQuery('#page_7 .empty').show();
			}
			SYS.page.closeOverlay('spinner');
		});
		return false;
	},
	standortDetail = function(content) {

		
		var k = jQuery.parseJSON(content);
		
		if (bug) { debug('SYS.task -> loadGeschsucheDetail json:', k); }
		
		
		if (k.desc != 'null') {
			jQuery('#page_8 .result_desc').text(k.desc);
		}
		if (k.strasse != 'null') {
			jQuery('#page_8 .result_strasse').text(k.strasse);
		}
		if (k.hn != 'null') {
			jQuery('#page_8 .result_hn').text(k.hn);
		}
		if (k.plz != 'null') {
			jQuery('#page_8 .result_plz').text(k.plz);
			
		}
		if (k.ort != 'null') {
			jQuery('#page_8 .result_ort').text(k.ort);
			DEVICEOS.map.setLink( jQuery('#page_8 .result_link_adresse'), k );
		}
		
		
		if (k.tel != 'null') {
			var tel = new String;
			tel = k.tel+'';
			jQuery('#page_8 .result_tel').text( k.tel );
			jQuery('#page_8 .result_link_tel').attr('href','tel:'+ tel.replace(/\D/g,'') );
		}


		return true;
	},
	sprachtoolInit = function (content, e) {
		if (bug) { debug('SYS.task -> sprachtoolInit'); }
		SYS.sprachicon.initIcon();
		return true;
	},
	sprachtextInit = function (content, e) {
		if (bug) { debug('SYS.task -> sprachtextInit'); }
		SYS.sprachicon.initText();
		return true;
	},
	sprachiconSave = function (content, e) {
		
		
		var sprachlang = jQuery(e.currentTarget).data('lang');
		if (bug) { debug('SYS.task -> sprachiconSave',sprachlang); }
		if (sprachlang) {
			SYS.sprachicon.setLang(sprachlang);
		}
		//alert(lastopen+' -'+open+'# '+pageId);
		
		//pageId,pageTask,pageContent
		var lo = SYS.page.getLastopen();
		
		if (bug) { debug('SYS.task -> sprachiconSave forward',lo); }
		if (lo == 34) {
			SYS.page.changePageById(lo, 'sprachtoolInit');
		} else if(lo == 35) {
			SYS.page.changePageById(lo, 'sprachtextInit');
		} else {
			return true;
		}
		return false;
	},
	loadArztsuche = function () {
		
		if (bug) { debug('SYS.task -> loadArztsuche'); }
		var ref_las = window.open('https://aok.wlae.mobile.weisse-liste.de/wlmoae', '_blank', 'location=no');

		var func_ref_las_close = function(event) { 
			if (bug) { debug('SYS.task -> loadArztsuche func_ref_las_close',event.url); }
			if ( _urlExit.contains(event.url)  ) {
				if (bug) { debug('SYS.task -> loadArztsuche - Close'); }
		   		ref_las.close();    
		    }
		}
		
		ref_las.addEventListener('loadstop', func_ref_las_close);
		return false;
	},
	loadArztbewertung = function () {
		if (bug) { debug('SYS.task -> loadArztbewertung'); }
		var ref_lab = window.open('https://aok.wlab.mobile.weisse-liste.de/wlmoab', '_blank', 'location=no');

		var func_ref_lab_close = function(event) { 
			if (bug) { debug('SYS.task -> loadArztbewertung func_ref_lab_close',event.url); }
			if ( _urlExit.contains(event.url)  ) {
				if (bug) { debug('SYS.task -> loadArztbewertung - Close'); }
		   		ref_lab.close();    
		    }
		}

		ref_lab.addEventListener('loadstop', func_ref_lab_close);
		return false;
	},
	loadAoksystemRegister = function () {
		
		if (bug) { debug('SYS.task -> loadAoksystemRegister'); }
		var ref_asr = window.open('https://registrierung-aok24.aok.de/arztnavigatormobil', '_blank', 'location=no');

		var func_asr_lab_close = function(event) { 
		    if (bug) { debug('SYS.task -> loadAoksystemRegister func_asr_lab_close',event.url); }
			if ( _urlExit.contains(event.url)  ) {
				if (bug) { debug('SYS.task -> loadAoksystemRegister - Close'); }
		   		ref_asr.close();    
		    }
		}
		ref_asr.addEventListener('loadstop', func_asr_lab_close);
		
		
		/* NEW VERSION	
		jQuery('#register_form_form')
			.off('click')
			.on('click', '#register_form_submit',function (e) {
			
			var kasse_nr = jQuery('#register_form_form').find('#register_form_kasse').val();
			var kn_nr = jQuery('#register_form_form').find('#register_form_number').val();
			
			if (!kasse_nr ) {
				jQuery('#register_form_form').find('#register_form_kasse').addClass('invalid');
				return false;
			} else {
				jQuery('#register_form_form').find('#register_form_kasse').removeClass('invalid');
			}
			
			if (!kn_nr ) {
				jQuery('#register_form_form').find('#register_form_number').addClass('invalid');
				return false;
			} else {
				jQuery('#register_form_form').find('#register_form_number').removeClass('invalid');
			}
			
			
			var back = jQuery.post(
			'/',
			{ kasse_nr: kasse_nr, kn_nr:kn_nr },
			function(data) {
				alert(data);
			});
		});
		return true;
		*/
	},
	loadAoksystemFav = function () {
		if (bug) { debug('SYS.task -> loadAoksystemFav'); }
		var ref_laf = window.open('https://aok.wlae.mobile.weisse-liste.de/merkliste', '_blank', 'location=no');

		var func_laf_lab_close = function(event) { 
		    if (bug) { debug('SYS.task -> loadAoksystemFav func_laf_lab_close',event.url); }
			if ( _urlExit.contains(event.url)  ) {
				if (bug) { debug('SYS.task -> loadAoksystemFav - Close'); }
		   		ref_laf.close();    
		    }

		}

		ref_laf.addEventListener('loadstop', func_laf_lab_close);
		return false;
	},
	loadVorsorgecats = function () {
	
		if (bug) { debug('SYS.task :loadVorsorgecats'); }
		var checkupBaseObj = SYS.db.getLocalDbObject('checkup');
		
		var html = jQuery('<ul></ul>');
		//jQuery.each(checkupBaseObj.data,function (k,i) {
		for (var i = 0; i < checkupBaseObj.data.length; i++) {
			
			var li = jQuery('<li class="hoehe-1 padding white schatten-aussen menu-headline"></li>')
					.text(checkupBaseObj.data[i].lang[SYS.page.getLang()].head)
					.addClass('icon-'+checkupBaseObj.data[i].icon)
					.data('id',checkupBaseObj.data[i].id)
					.on(clickOrTouch, function (e) {
						if (bug) { debug('SYS.task :loadVorsorgecats -Click in Details'); }
						SYS.page.changePageById(41, 'loadVorsorgeitems', jQuery(this).data('id') );
					});
					
					//.load('com_checkup/'+SYS.page.getLang()+'/checkupcat/head/'+i.title+'.tpl');
			html.append(li);
	    }
		jQuery('#page_4 .content').html(html);
		

		return true;
	},
	loadVorsorgeitems = function (content) {
	
		if (bug) { debug('SYS.task :loadVorsorgeitems'); }
		var checkupBaseObj = SYS.db.getLocalDbObject('checkup');
		
		var obj = {};
		for (var i = 0; i < checkupBaseObj.data.length; i++) {
			//if (bug) { debug('SYS.task :loadVorsorgeitems each', i); }
			if (content == checkupBaseObj.data[i].id) {
				obj = checkupBaseObj.data[i];
			}
		};
		
		//if (bug) { debug('SYS.task :loadVorsorgeitems item  ', obj); }
		
		
		var html = jQuery('<ul></ul>');
		if (!obj.childs) {
			

			if (bug) { debug('SYS.task :loadVorsorgeitems nothing found!'); }
			var empty = jQuery('<li />')
		    	.addClass('hoehe-1 padding white schatten-aussen grey')
		    	.text('Kein Ergebniss');
		    html.append(empty);
		    

		} else {
		
			obj.childs.sort(function (a,b) {
				return a.ordering - b.ordering;
			});
			
			if (bug) { debug('SYS.task :loadVorsorgeitems childs '); }
			
			jQuery.each(obj.childs,function (k,i) {

				if (!i.child) {
				
					var li = jQuery('<li class="hoehe-1 padding white schatten-aussen grey menu-headline"></li>')
							
							.data('id',i.id)
							.data('link',i.key)
							.on(clickOrTouch, function (e) {
								if (bug) { debug('SYS.task :loadVorsorgeitems -click to Details'); }
								SYS.page.changePageById(42, 'loadVorsorgeitemDetail',   {"id":i.id,"cat_id":content} );
							});
	
	
					if (i.lang && i.lang[SYS.page.getLang()].head) {
						li.html(i.lang[SYS.page.getLang()].head);
					}
	
	
	
					var innerContent = 0;
					if (i.info && i.info == 1) {
						
							innerContent = jQuery('<div />')
							.addClass('innerContent none content-text acco-content padding')
							.html(i.lang[SYS.page.getLang()].content);
	
						var head = jQuery('<div />')
							.addClass('pad-lft-10 hoehe-100 icon-info padding')
							.text(i.lang[SYS.page.getLang()].head);
							
							li.addClass('toggle-close')
							.off(clickOrTouch).on(clickOrTouch,function (e) {
								if (bug) { debug('SYS.task :loadVorsorgeitems -Click Toggle'); }
								if ( jQuery(e.currentTarget).hasClass('toggle-open') ) {
									jQuery(e.currentTarget).removeClass('toggle-open').addClass('toggle-close')
										.next('.innerContent').slideUp();
								} else {
									jQuery(e.currentTarget).removeClass('toggle-close').addClass('toggle-open')
										.next('.innerContent').slideDown();
								}
								return false;
							});
						li.html(head);
	
					}
	
	
					html.append(li);
					if (innerContent) {
						html.append(innerContent);
					}

				}
			});
			
		}
		
		jQuery('#page_41 .content').html(html);
		return true;
	},
	loadVorsorgeitemDetail = function (content) {
		
		
		if (bug) { debug('SYS.task :loadVorsorgeitemDetail', content); }
		
		
		var checkupBaseObj = SYS.db.getLocalDbObject('checkup');
		
		var obj = {};
		for (var i = 0; i < checkupBaseObj.data.length; i++) {
			//if (bug) { debug('SYS.task :loadVorsorgeitems each', i); }
			if (content.cat_id == checkupBaseObj.data[i].id) {
				obj = checkupBaseObj.data[i];
			}
		};
		
		
		for (var i = 0; i < obj.childs.length; i++) {
			//if (bug) { debug('SYS.task :loadVorsorgeitems each', i); }
			if (content.id == obj.childs[i].id) {
				 //= obj.childs[i];
				 
				 if (bug) { debug('SYS.task :loadVorsorgeitemDetail found'); }
				 jQuery('#page_42 .content').html(obj.childs[i].lang[SYS.page.getLang()].content);
			}
		};

		return true;
	},
	getUserEvents = function (content) {
		
		if (bug) { debug('SYS.task :getUserEvents', content); }
		
		var userData = SYS.db.getUserByActive();
		var checkupBaseObj = SYS.db.getLocalDbObject('checkup');
		
		var html = jQuery('<ul></ul>');
		
		
		
		
		if (bug) { debug('SYS.task :loadVorsorgeitems userData.age', userData.age); }
		
		var queryDiffSek = 0;
		if (userData.age) {
			//var ageSek = DEVICEOS.calendar.getDateObj( userData.age );
			//alert(userData.age);
			var timeArr = userData.age.split('.'),
				ageSek = new Date(timeArr[2],timeArr[1]-1,timeArr[0]) / 1000;
			
			//var ageSek = new Date(userData.age) / 1000;
			//alert(ageSek); 
			if (bug) { debug('SYS.task :loadVorsorgeitems ageSek', ageSek); }
			var nowSek = new Date().getTime() / 1000,
				queryDiffSek =  parseInt( nowSek - ageSek );
		} else if (userData.age_range) {
			var now = new Date(),
				nowSek = now.getTime() / 1000;
			var ageSek = new Date( now.getFullYear() - userData.age_range, now.getMonth()-1, now.getDate() ) / 1000,
				queryDiffSek =  parseInt( nowSek - ageSek );
		
		}

		for (var i = 0; i < checkupBaseObj.data.length; i++) {
			//if (bug) { debug('SYS.task :loadVorsorgeitems each', i); }
			if (checkupBaseObj.data[i].childs) {
			

				
				var arr = checkupBaseObj.data[i].childs;
				
				arr = _.filter(arr, function (o) {
					if (!o.info || o.info == 0) {
						return true;
					}
				});
				
			/*
	
				if ( parseInt(userData.pregnancy) == 1) {
					if (bug) { debug('SYS.task :loadVorsorgeitems pregnancy', userData.pregnancy); }
					
	
				} else {
					
					arr = _.filter(arr, function (o) {
						if (bug) { debug('SYS.task :loadVorsorgeitems pregnancy 2 each ', o.pregnancy); }
						if (!o.pregnancy || o.pregnancy == 0) {
							return true;
						}
					});
					
				}
				
				
*/
				
				
				
			//	alert(userData.gender);
				if ( parseInt(userData.gender) != 0) {
					if (bug) { debug('SYS.task :loadVorsorgeitems gender', userData.gender); }
					
					arr = _.filter(arr, function (o) {
						if (o.gender == userData.gender || o.gender == 0) {
							return true;
						}
					});
				}
				
				
				

				if (queryDiffSek != 0) {
					if (bug) { debug('SYS.task :loadVorsorgeitems queryDiffSek', queryDiffSek); }
					
					arr = _.filter(arr, function (o) {
						if (parseInt(o.period_start) <= parseInt(queryDiffSek) || parseInt(o.period_start) == 0) {
							
							if (parseInt(o.period_end) > parseInt(queryDiffSek) || parseInt(o.period_end) == 0) {
								return true;
							}
							
						}
					});
				}
				
				
				if (userData.vsblacklist[0]) {
					
					if (bug) { debug('SYS.task :loadVorsorgeitems vsblacklist', userData.vsblacklist); }
					
					for (keyBlack in userData.vsblacklist) {
						//if (where)  { where += ' AND '; }
						//where += ' key != "'+userData.vsblacklist[keyBlack]+'"';
						
						arr = _.filter(arr, function (o) {
							if (userData.vsblacklist[keyBlack] != o.key) {
								return true;
							}
						});
						
					}
					
				}
				
				
				_.sortBy(arr, function (o) {
					return o.ordering;
				});
				
				
				
				if ( parseInt(userData.pregnancy) == 1) {
				
					var arr_preg = checkupBaseObj.data[i].childs;
				
					arr_preg = _.filter(arr_preg, function (o) {
						if (bug) { debug('SYS.task :loadVorsorgeitems pregnancy 2 each ', o.pregnancy); }
						if (o.pregnancy == 1) {
							return true;
						}
					});
					
					arr = arr.concat(arr_preg);
					
				}
				
				
				for (var a = 0; a < arr.length; a++) {

					li = jQuery('<li class="hoehe-1 padding white schatten-aussen grey"></li>')
						.addClass('eventItem')
						.data('id',arr[a].id)
						.data('link',arr[a].key)
						.data('cat_id',checkupBaseObj.data[i].id)
						.on(clickOrTouch, function (e) {
							
							if (bug) { debug('SYS.task :loadVorsorgeitems click loadUserEventsDetail');}
							
							SYS.page.changePageById(24,'loadUserEventsDetail',{'cat_id':jQuery(e.currentTarget).data('cat_id'), 'key':jQuery(e.currentTarget).data('link')}  );
						});
						
						if (arr[a].lang
							&& arr[a].lang[SYS.page.getLang()].head) {
							
							li.html(arr[a].lang[SYS.page.getLang()].head);
						} else {
							
							var p_lang = _.find(checkupBaseObj.data[i].childs, function (o) {
								if (o.key == arr[a].key) {
									return true;
								}
							});
							//if (bug) { debug('SYS.task :loadVorsorgeitems p_lang', p_lang); }
							
							li.html(p_lang.lang[SYS.page.getLang()].head);
							
						}
						
						html.append(li);
						

				
				}
			}
		};
		
		
		//if (bug) { debug('SYS.task :getUserEvents ALL:', arr); }
		
		
		

		/*

		for (keyBlack in userData.vsblacklist) {
			if (where)  { where += ' AND '; }
			where += ' key != "'+userData.vsblacklist[keyBlack]+'"';
		}
		if (where) { sql += ' WHERE '+where; }
		sql += '  ORDER BY  period_start DESC';
		
		if (bug) { debug('SYS.task :getUserEvents query sql', sql); }
		
*/
		
		//var html = jQuery('<ul></ul>');
		/*
		MYAPP.db.select(sql, function (results) {
			for (var i = 0; i <= results.rows.length; i += 1) {
				var li = jQuery('<li class="hoehe-1 padding white schatten-aussen grey"></li>')
						.addClass('eventItem')
						.data('id',results.rows.item(i).id)
						.data('link',results.rows.item(i).key)
						.on(clickOrTouch, function (e) {
							MYAPP.page.changePageById(24,'loadUserEventsDetail',jQuery(e.currentTarget).data('link') );
						})
						.load('com_checkup/'+lang+'/checkupitem/head/'+results.rows.item(i).key+'.tpl',function () {
							var key = jQuery(this).data('link'),
								text = '(Vorsorgetermin planen)';
							if ( typeof userData.vscallist[key] === 'object' ) {
								text = 'Vorsorgetermin geplant am '+userData.vscallist[key].startdate;
							}	
							var calDiv = jQuery('<div>')
								.addClass('eventdate')
								.text(text);
							jQuery(this).append(calDiv);									
						});
						
				html.append(li);
			}
		}); */
		
		/*
		
		if (userData.pregnancy != 0) {
			var sql_preg = 'SELECT * FROM checkupitem',
				where_preg = '';
			if (where_preg)  { where_preg += ' AND '; }
			where_preg += ' ( pregnancy = 1 ) ';
			for (keyBlack in userData.vsblacklist) {
				if (where_preg)  { where_preg += ' AND '; }
				where_preg += ' key != "'+userData.vsblacklist[keyBlack]+'"';
			}
			if (where_preg) { sql_preg += ' WHERE '+where_preg; }
			
			if (bug) { debug('SYS.task :getUserEvents query sql_preg', sql_preg); }
			
			MYAPP.db.select(sql_preg, function (results_preg) {
				for (var j = 0; j <= results_preg.rows.length; j += 1) {
					var li = jQuery('<li class="hoehe-1 padding white schatten-aussen grey"></li>')
							.addClass('eventItem')
							.text(results_preg.rows.item(j).key)
							.data('id',results_preg.rows.item(j).id)
							.data('link',results_preg.rows.item(j).key)
							.on(clickOrTouch, function (e) {
								MYAPP.page.changePageById(24,'loadUserEventsDetail',jQuery(e.currentTarget).data('link') );
							})
							.load('com_checkup/'+lang+'/checkupitem/head/'+results_preg.rows.item(j).key+'.tpl',function () {
								var key = jQuery(this).data('link'),
									text = '(Vorsorgetermin planen)';
								if ( typeof userData.vscallist[key] === 'object' ) {
									text = userData.vscallist[key].startdate;
								}	
								var calDiv = jQuery('<div>')
									.addClass('eventdate')
									.text(text);
								jQuery(this).append(calDiv);
							});
					html.append(li);
				}
			});
			
		}
		
		*/
		jQuery('#page_21 .content').html(html);
		
		
		
		
		
		return true;
	},
	loadUserEventsDetail = function (content) {
	
		if (bug) { debug('SYS.task :loadUserEventsDetail', content); }
		
		
		//jQuery('#page_24 .content').html('');
		
		var checkupBaseObj = SYS.db.getLocalDbObject('checkup');
		
		var obj = {};
		var parent = {};
		for (var i = 0; i < checkupBaseObj.data.length; i++) {
			//if (bug) { debug('SYS.task :loadVorsorgeitems each', checkupBaseObj.data[i]); }
			if (content.cat_id == checkupBaseObj.data[i].id) {
				//obj = checkupBaseObj.data[i];
				parent = checkupBaseObj.data[i];
				for (var a = 0; a < checkupBaseObj.data[i].childs.length; a++) {
					if (content.key == checkupBaseObj.data[i].childs[a].key) {
						obj = checkupBaseObj.data[i].childs[a];
					}
				}
			}
		};
		
		
		//if (bug) { debug('SYS.task :loadUserEventsDetail data', obj); }
		
		
		//jQuery('#page_24 .content').html(obj.lang[SYS.page.getLang()].content);
		
		
		if (obj.lang
			&& obj.lang[SYS.page.getLang()].content) {
			
			jQuery('#page_24 .content').html(obj.lang[SYS.page.getLang()].content);
		} else {
			
			var p_lang = _.find(parent.childs, function (o) {
				if (o.key == obj.key) {
					return true;
				}
			});
			//if (bug) { debug('SYS.task :loadVorsorgeitems p_lang', p_lang); }
			
			jQuery('#page_24 .content').html(p_lang.lang[SYS.page.getLang()].content);
			
		}
		
		
		
		var btn_kill = jQuery('<div />')
			.text('Untersuchung ausblenden')
			.addClass('hoehe-1 padding white schatten-aussen active menu-headline')
			.off ('click')
			.on ('click', function () {
				if (bug) { debug('SYS.task :loadUserEventsDetail -click', content.key); }
				
				var userData = SYS.db.getUserByActive();
				userData.vsblacklist.push(content.key);
				SYS.db.insertUser(userData, function () {
					if (bug) { debug('SYS.task :loadUserEventsDetail -click :changePageById'); }
					SYS.page.changePageById(21,'getUserEvents');
				});
			}),
		breaker = jQuery('<br />')
			.addClass('breaker'),
		form_info = jQuery('<span />')
			.html('<br> Legen Sie einen neuen Termin fest <br>'),
		form_date = jQuery('<input />')
			.attr('type','text')
			.attr('id','inputDate-newUserEvent')
			.addClass('hoehe-1 padding white schatten-innen menu-headline')
		,form_userDate = jQuery('<div />');

	

		
	
	/*

		
			
*/





		var userData = SYS.db.getUserByActive();
		if ( typeof userData.vscallist[content.key] === 'object' ) {
			form_userDate.html('<br>Vorsorgetermin geplant am '+userData.vscallist[content.key].startdate);
		}	
		


		jQuery('#page_24 .content')
		.append(form_userDate)
		.append(form_info)
		.append(form_date)
		.append(btn_kill);


		form_date.cldatepick();
		
		
		jQuery(form_date).off('change').on('change',function(e) {
	        
	        if (bug) { debug('SYS.task :loadUserEventsDetail -blur :form_date'); }
	        //alert('blur');
	        DEVICEOS.calendar.setInputEvents(e,content.key,obj.lang[SYS.page.getLang()].head);
			//makeMyCalEvent(e,content.key,obj.lang[SYS.page.getLang()].head);
			return false;
	    });
	    
	    
	    
		return true;





		/*
		
				if (device.platform == 'Android') {
					
					form_date.attr('type','text');

					DEVICEOS.calendar.setInputEvents(form_date, function (e) {

					//	alert('VALUE: '+form_date.val());
					//	alert('done! '+lang+' - '+content);
						var back = jQuery.get(
							'com_checkup/'+lang+'/checkupitem/head/'+content+'.tpl',
							function(data) {
					//			alert(data);
								var options = {'title': data,
												'location' : '',
												'notes': ''
									},
									success = function(message) {
										//alert("Done! # "+JSON.stringify(message));
									},
									error = function(message) {
										alert("error "+message); 
									};
								DEVICEOS.calendar.insertEvent(e, options, success, error, function (logDate) {
									form_date.val(logDate);
									var userData = MYAPP.db.getUserByActive();
									userData.vscallist[content] = {'startdate':logDate};
									MYAPP.db.insertUser(userData, function () {});
								});
						});
						

						
					});

				} else {
					DEVICEOS.calendar.setInputEvents(form_date, content, lang, function (e) {});
					
				}
*/

	},
	loadIgel = function	() {

		jQuery('#page_3 .content .innerContent').hide();
		
		jQuery('#page_3 .content').find('.acco-head').each(function () {
			
			//alert(jQuery(this).attr('class'));
			if ( jQuery(this).hasClass('toggle-open') ) {
				jQuery(this).removeClass('toggle-open').addClass('toggle-close');
			}
			
			jQuery(this).off('click').on('click',function (e) {

				if ( jQuery(e.currentTarget).hasClass('toggle-open') ) {

					jQuery(e.currentTarget).removeClass('toggle-open').addClass('toggle-close')
						.next('.innerContent').slideUp();

				} else {
					
					jQuery(e.currentTarget).removeClass('toggle-close').addClass('toggle-open')
						.next('.innerContent').slideDown();
						
					if ( jQuery(e.currentTarget).find('.itemCheck').hasClass('checkbox-off') ) {
						jQuery(e.currentTarget).find('.itemCheck')
						.removeClass('checkbox-off')
						.addClass('checkbox-on');
					}
				}
				return false;
			});
		});
					
		/* NEW VERSION
			SYS.db.setupIgel();
			return false;
		*/

	},
	loadIgelKoerper = function () {

		var igel = SYS.db.getLocalDbObject('igel');

		
		if (igel.cathuman) {
			
			var list = jQuery('<div>');

			_.each(igel.cathuman, function (o){
				var item = jQuery('<div>',{'text':o.name})
				.on('click', function() {
					SYS.page.changePageById(93,'loadIgelList','koerper_id:'+o.id);
				});
				list.append(item);
			});

			jQuery('#page_9 .content').find('.koerper').html(list);
		}

		return true;
	},
	loadIgelArztgroup = function () {

		var igel = SYS.db.getLocalDbObject('igel');

		
		if (igel.catdoc) {
			
			var list = jQuery('<div>');

			_.each(igel.catdoc, function (o){
				var item = jQuery('<div>',{'text':o.name+o.id})
				.on('click', function() {
					SYS.page.changePageById(93,'loadIgelList','arztgroup_id:'+o.id);
				});
				list.append(item);
			});

			jQuery('#page_92 .content').html(list);
		}

		return true;
	},
	loadIgelList = function (content) {
		

		var igelBaseObj = SYS.db.getLocalDbObject('igel').data;
		
		igelBaseObj = _.sortBy(igelBaseObj, function (o) {
			return o.title;
		});
		
		if (content) {
			
			content = content.split(':');
			
			if (content[0] && content[1]) {
				igelBaseObj = _.filter(igelBaseObj, function (o) {
					if (o[content[0]] == content[1]) {
						return true;
					}
				});
			}
			
			
			
		}
		
		var html = jQuery('<ul>');
	
		_.each(igelBaseObj, function (o) {
			
			if (bug) { debug('SYS.task :igeldata ', o.title); }
		
			var li = jQuery('<li>', {'text':o.title,'class':'hoehe-1 grey padding schatten-aussen'})
			.on('click', function () {
				SYS.page.changePageById(95,'loadIgelDetail',o.api_id);
			});
			html.append(li);
		});

		jQuery('#page_93 .content').html(html);
		return true;
	},
	loadIgelDetail = function (content) {
		

		var igelBaseObj = SYS.db.getLocalDbObject('igel').data;

		

		var data = _.filter(igelBaseObj, function (o) {
			if (o.api_id && o.api_id == content) {
				return true;
			}
		});
		
		if (data[0]) {
			
			var dom = jQuery('#page_95 .content');
			
			dom.find('.data-title').text(data[0].title);
			dom.find('.data-methode').text(data[0].methode);
			dom.find('.data-bewertung').text(data[0].bewertung);

			return true;
		}				
								
		
		
	};



	
	return {
		nix: nix
		,loadStart: loadStart
		,firstToCom: firstToCom
		,firstSkip: firstSkip
		,firstSave: firstSave
		,firstFivePage: firstFivePage
		,userGetList: userGetList
		,userClearForm: userClearForm
		,userSetNew: userSetNew
		,userGetEdit: userGetEdit
		,standortLoad: standortLoad
		,standortDetail: standortDetail
		,sprachtoolInit: sprachtoolInit
		,sprachiconSave: sprachiconSave
		,sprachtextInit: sprachtextInit
		,loadArztsuche: loadArztsuche
		,loadArztbewertung: loadArztbewertung
		,loadAoksystemRegister: loadAoksystemRegister
		,loadAoksystemFav: loadAoksystemFav
		,loadVorsorgecats: loadVorsorgecats
		,loadVorsorgeitems: loadVorsorgeitems
		,loadVorsorgeitemDetail: loadVorsorgeitemDetail
		,getUserEvents: getUserEvents
		,loadUserEventsDetail: loadUserEventsDetail
		,loadIgel: loadIgel
		,loadIgelKoerper: loadIgelKoerper
		,loadIgelList: loadIgelList
		,loadIgelDetail: loadIgelDetail
		,loadIgelArztgroup: loadIgelArztgroup
	}
	
}());





/*
*	Modul Sprachicon 
*/



SYS.sprachicon = (function(){

	var lang = 'en',
	db = {},
	initIcon = function () {
		
		if (bug) { debug('SYS.sprachicon -> initIcon'); }
		if (db && db.data) {
			setLang(lang);
			
			jQuery('#page_34').off(clickOrTouch,'.sprachiconPlay').on(clickOrTouch,'.sprachiconPlay', function (e) {
				var id = jQuery(e.currentTarget).data('sprachicon');
				//if (bug) { debug('SYS.sprachicon -> initIcon -click sprachiconPlay', id); }
				if (id) {
					play(id, e.currentTarget);
				}
			});
		} else {

			jQuery.getJSON("com_sprachicons/db.json", function(data){         
				if (data) {
					if (bug) { debug('SYS.sprachicon -> initIcon -getJSON'); }
					db = data;
					initIcon();
				}
			});
		}
	},
	initText = function () {
		if (bug) { debug('SYS.sprachicon -> initText'); }
	    if (db && db.data) {
	    	setLang(lang);
	    	
		    if (db.data.text[lang]) {
		    	var dom = renderTestList( jQuery('#page_35 #sprachtool_form_input').val() );
				jQuery('#page_35 .content').html(dom);
				
				jQuery('#page_35').off('submit','#sprachtool_form').on('submit','#sprachtool_form', function (e) {
					jQuery(e.currentTarget).find('input').blur();
					//alert('- submit');
					return false;
				});
				
				jQuery('#page_35').off('change','#sprachtool_form_input').on('change','#sprachtool_form_input', function (e) {
					//alert('- change');
					
					var val = jQuery(e.currentTarget).val();
					var dom = renderTestList(val);
					jQuery('#page_35 .content').html(dom);
				});
				
				jQuery('#page_35').on(clickOrTouch, '#sprachtool_form_kill', function (e) {
					jQuery('#page_35').find('#sprachtool_form_input').val('').trigger('change');
				});	
				
			}
		} else {
			jQuery.getJSON("com_sprachicons/db.json", function(data){         
				if (data) {
					db = data;
					initText();
					if (bug) { debug('SYS.sprachicon -> initText getJSON'); }
				}
			});
		}
	},
	checkLangData = function () {
		if (bug) { debug('SYS.sprachicon -> checkLangData', lang); }
		if (lang) {
			if (db && db.data.text[lang]) {
				jQuery('#page_30 .btn_sprachtext').removeClass('pageBtnOffline');
			} else {
			 	jQuery('#page_30 .btn_sprachtext').addClass('pageBtnOffline');
			}
			if (db && db.data.icons[lang]) {
				jQuery('#page_30 .btn_sprachicons').removeClass('pageBtnOffline');
			} else {
			 	jQuery('#page_30 .btn_sprachicons').addClass('pageBtnOffline');
			}
		}
	},
	renderTestList = function (search) {
		if (bug) { debug('SYS.sprachicon -> renderTestList'); }
		//var empty = false;
		var dom = jQuery('<div>', {'class':'hoehe-100'});
		jQuery.each(db.data.text.de, function (i,k) {

			if ( search && k.text.toLowerCase().indexOf( search.toLowerCase() ) < 0 ) {
				//empty = true;
			} else {
				var box = jQuery('<div>', {'class':'hoehe-1 padding white schatten-aussen acco-head toggle-close-right text_'+i})
				.on(clickOrTouch, function (e) {

					if ( jQuery(e.currentTarget).hasClass('toggle-open-right') ) {
						jQuery(e.currentTarget).removeClass('toggle-open-right').addClass('toggle-close-right')
							.next('.innerContent').slideUp(300, function () {
								jQuery(this).remove();
							});
					} else {
						var file = getText(i);
						if (file) {
							var audio = getTextAudio(i);
							var more = jQuery('<div>', {'class':'hoehe-1 innerContent green content-text acco-content  text_more'});
							var text = jQuery('<div>',{'text':file, 'class':'padding width-70 float-left menu-headline'});
							more.append(text);
							if (audio) {
								var text = jQuery('<div>',{'class':'hoehe-1 width-20 float-right sprachtextplay'})
									.append('<img src="com_sprachicons/play_grey_trans.svg" />')
									.off(clickOrTouch)
									.on(clickOrTouch, function () {
										
										if (bug) { debug('SYS.sprachicon -> renderTestList -click: sprachtextplay'); }
										var src = 'com_sprachicons/audio_all/'+lang+'/'+audio;
										if (device.platform == 'Android') {
											src = '/android_asset/www/'+src;
										}
										var media = new Media(src, function () {
											//alert('ok');
										}, function () {
											//alert('error');
											if (bug) { debug('ERROR SYS.sprachicon -> renderTestList -click: sprachtextplay Media'); }
										}, function (s) {
											if (s == 2) {
												text.css('opacity', 0.2);
											} else if ( s == 4) {
												text.css('opacity', 1);
											}
											if (bug) { debug('SYS.sprachicon -> renderTestList -click: sprachtextplay Media Done'); }
										});
										media.play();
									});
								more.append(text);
							}
							more.hide();
							jQuery(e.currentTarget).after(more);
							more.fadeIn(500);
							jQuery(e.currentTarget).removeClass('toggle-close-right').addClass('toggle-open-right');
						}
					}	
				});
				var span = jQuery('<div>', {'text':k.text, 'class':'padding width-90 float-left menu-headline'});
				box.append(span);
				dom.append(box);
			}
		});
		if (dom.find('div').length < 1) {
			var box = jQuery('<div>', {'class':'hoehe-1 padding white schatten-aussen', 'text':'Keine Treffer'});
			dom.append(box);
		}
		return dom;
	},
	getText = function (key) {
		if (bug) { debug('SYS.sprachicon -> getText'); }
		var file = db.data.text[lang][key].text;
		if (!file) {
			return false;
		}
		return file;
	},
	getTextAudio = function (key) {
		if (bug) { debug('SYS.sprachicon -> getTextAudio'); }
		var file = db.data.text[lang][key].audio;
		if (!file) {
			return false;
		}
		return file;
	},
	play = function (id, dom) {
		if (bug) { debug('SYS.sprachicon -> play ', {"id":id, "dom":dom}); }
		if (!id) {
			return false;
		}
		var file = db.data.icons[lang][id];
		if (bug) { debug('SYS.sprachicon -> play file ', file); }
		if (!file) {
			return false;
		}
		var over = undefined;
		var src = 'com_sprachicons/audio/'+lang+'/'+file+'.mp3';
	
		if (device.platform == 'Android') {
			src = '/android_asset/www/'+src;
		}
		
		if (bug) { debug('SYS.sprachicon -> play media src ', src); }
		var media = new Media(src, function () {
			//alert('ok');
		}, function (e) {
			//alert('error');
			
			over.fadeOut(300, function () {
				over.remove();
			});
			if (bug) { debug('ERROR SYS.sprachicon -> play'); }

		}, function (s) {
			if (bug) { debug('SYS.sprachicon -> play media ',s); }
			if (s == 2) {
				
				over = jQuery(dom).clone();
				var offset = jQuery(dom).offset();
				
				over.css({'position':'absolute', 'top':offset.top, 'left':offset.left, 'width':jQuery(dom).css('width'), 'height':jQuery(dom).css('height'),'background-color':'rgba(0,0,0,0)'})
					.attr('id','com_sprachicons_overlay')
					.hide()
					.html('<img src="com_sprachicons/play_grey_white.svg" />');
					
				jQuery('body').append(over);
				
				over.fadeIn('slow');

			} else if ( s == 4) {
		
				over.fadeOut(300, function () {
					over.remove();
				});

			}
		});
		media.play();
	},
	setLang = function (getlang) {
		if (bug) { debug('SYS.sprachicon -> setLang',getlang); }
		if (getlang) {
			jQuery('#page_31 .sprachiconLangItem.active').removeClass('active');
			var langText = jQuery('#page_31 .sprachiconLangItem[data-lang="'+getlang+'"]').addClass('active').text();
			lang = getlang;
			checkLangData();
			
			if (langText) {
				/*
				jQuery('#page_30 .activ_sprachwahl').text(langText);
				jQuery('#page_34 .activ_sprachwahl').text(langText);
				jQuery('#page_35 .activ_sprachwahl').text(langText);
				
*/
				jQuery('#page_34 .langswitch').attr('data-lang',getlang); //.find('.activ_sprachwahl').text(langText);
				jQuery('#page_35 .langswitch').attr('data-lang',getlang); //.find('.activ_sprachwahl').text(langText);
				
				
			}
			
		}
	};
	
	return {
		initIcon: initIcon,
		initText: initText,
		play: play,
		setLang: setLang,
		checkLangData: checkLangData
	};
	
}());










