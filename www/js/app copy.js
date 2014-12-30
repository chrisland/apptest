

var clickOrTouch = 'click';
//var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';


window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);






var MYAPP = MYAPP || {};

MYAPP.namespace = function (ns_string) {
	var parts = ns_string.split('.'),
		parent = MYAPP,
		i;
	
	// führenden, redundaten globalen Bezeichner entfernen
	if (parts[0] === 'MYAPP') {
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

MYAPP.namespace('MYAPP.config');

//MYAPP.namespace('MYAPP.init');
MYAPP.namespace('MYAPP.db');
MYAPP.namespace('MYAPP.page');
MYAPP.namespace('MYAPP.app');
MYAPP.namespace('MYAPP.page.com_docsearch');


var $_urlSuccessPage_1 = "https://aok.wlab.mobile.weisse-liste.de/exit";
var $_urlSuccessPage_3 = "https://aok.wlae.mobile.weisse-liste.de/exit";
var $_urlSuccessPage_4 = "https://registrierung-aok24.aok.de/arztnavigatormobil/index.php/exit";
var $_urlSuccessPage_5 = "https://aok.wlae.mobile.weisse-liste.de/exit";




/*
*	Modul Database 
*/

MYAPP.db = (function(){
	
//	var db = {},
	var query = '',
	queryDone = {},
	queryNothing = {},
	
	getLocalDb = function(dbName) {
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
			callback();
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
			age : "0000-00-00",
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
			callback();
		});
	},
	openDatabase = function () {
		//db = window.openDatabase("aok", "1.0", "aok database", 2000000);
		var userBase = getLocalDb('userBase');
		if (userBase == '{}') {	
			MYAPP.page.changePageById(12,'toComFirst');
		} else {
			MYAPP.app.setActiveUserBtn();
		}
		//createTable();
	
	},
	select = function (getQuery,getQuerySuccess,getQueryNothing) {

		if (!getQuery) {
			alert('no Query');
			return false;
		}
		db.transaction(function (tx) {
			tx.executeSql(getQuery, [], 
			function (tx, results) {
			    if (!results.rows) {
			       	getQueryNothing();
			        return false;
			    } else {
					getQuerySuccess(results,tx);
			    }
			}
			, getQueryNothing);
		}, queryError);
	},
	queryError = function (tx, error) {
		console.log("Database Error: " + error.message);
	},
	createTable = function () {
		
		db.transaction(function (tx) {
			
			//BUG!!!!
			tx.executeSql('DROP TABLE IF EXISTS checkupcat');
		   
			var sql2 = "CREATE TABLE IF NOT EXISTS checkupcat ( id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(50), icon VARCHAR(50), gender INTEGER , pregnancy INTEGER )";
		   //tx.executeSql(sql2);
		    
		    tx.executeSql(sql2,[],function (tx){
		    	
			    //console.log('+ create checkupcat');
			    
			    tx.executeSql("INSERT INTO checkupcat (id,title,icon,gender,pregnancy) VALUES (1,'checkup_prevention','stethoscope',0,0)",[],function (tx){
				  // console.log('++ insert checkupcat'); 
			    });
				tx.executeSql("INSERT INTO checkupcat (id,title,icon,gender,pregnancy) VALUES (2,'checkup_dental','tooth',0,0)");
				tx.executeSql("INSERT INTO checkupcat (id,title,icon,gender,pregnancy) VALUES (3,'checkup_vaccination','syringe',0,0)");
				tx.executeSql("INSERT INTO checkupcat (id,title,icon,gender,pregnancy) VALUES (4,'checkup_pregnancy','pregnancy',2,1)");
				tx.executeSql("INSERT INTO checkupcat (id,title,icon,gender,pregnancy) VALUES (5,'checkup_pediatric','baby',0,0)");
				
				
		    },queryError);
		    
		    
			/* !DB INSERT */

			//BUG!!!!
		    tx.executeSql('DROP TABLE IF EXISTS checkupitem');
			var sql3 = "CREATE TABLE IF NOT EXISTS checkupitem ( id INTEGER PRIMARY KEY AUTOINCREMENT,cat_id INTEGER, ordering INTEGER, key VARCHAR(50), icon VARCHAR(50), gender INTEGER, pregnancy INTEGER , period_start INTEGER, period_end INTEGER, child INTEGER, info INTEGER )";
		    tx.executeSql(sql3);
		    
		    //tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end,info) VALUES (201 ,1, 100,'info_checkup_prevention','stethoscope',0,0,0,1)");
		    //tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (7,1, 107,'FE2','stethoscope',2, 631138520, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (1,1, 101,'FE3','stethoscope',2, 946707780, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (3,1, 103,'FE4','stethoscope',0, 1104492410, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (8,1, 108,'FE5','stethoscope',0, 1104492410, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (9,1, 109,'FE11','stethoscope',1, 1420061670, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (5,1, 105,'FE6','stethoscope',0, 1577846300, 1735630930)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (2,1, 102,'FE7','stethoscope',2, 1577846300, 2177427894)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (6,1, 106,'FE8','stethoscope',0, 1735630930, 0)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (4,1, 104,'FE1','stethoscope',2, 441796964, 788923150)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end,info) VALUES (202,2, 200,'info_checkup_dental','tooth',0,0,0,1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (11,2, 201,'ZV1_ZV2_ZV3','tooth',0, 31556926 ,189341556)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (12,2, 202,'ZV4','tooth',0, 189341556 ,536467742)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (10,2, 201,'ZV5','tooth',0, 568024668 ,0)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end,info) VALUES (203,3, 300,'info_checkup_impfung','syringe',0,0,0,1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (13,3, 301,'V1','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (51 ,3,'V1','syringe',0 ,7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (52 ,3,'V1','syringe',0 , 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (53 ,3,'V1','syringe',0 , 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (54 ,3,'V1','syringe',0 , 157784630, 189341556, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (55 ,3,'V1','syringe',0 , 284012334, 536467742, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (56 ,3,'V1','syringe',0 , 568024668, 1861858634, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (57 ,3,'V1','syringe',0 , 1893415560, 0, 1)");
			

			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (14,3, 302, 'V2','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (61,3,'V2','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (62,3,'V2','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (63,3,'V2','syringe',0, 28927182, 36816414, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (15,3, 303, 'V3','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (71,3,'V3','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (72,3,'V3','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (73,3,'V3','syringe',0, 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (74,3,'V3','syringe',0, 284012334, 536467742, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (16,3, 304, 'V4','syringe',2, 347126186, 441796964)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (17,3, 305, 'V5','syringe',0, 1893415560, 0)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (20,3, 308, 'V6','syringe',0, 28927182, 36816414)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (81,3,'V6','syringe',0, 39446157, 60484108, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (82,3,'V6','syringe',0, 568024668, 0, 1)");
		
		
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (21,3, 309, 'V7','syringe',0, 28927182, 60484108)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (22,3, 310, 'V8','syringe',0, 28927182, 36816414)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (91,3,'V8','syringe',0, 39446157, 60484108, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (18,3, 306, 'V9','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (101,3,'V9','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (102,3,'V9','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (103,3,'V9','syringe',0, 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (104,3,'V9','syringe',0, 157784630, 189341556, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (105,3,'V9','syringe',0, 284012334, 536467742, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (106,3,'V9','syringe',0, 568024668, 1861858634, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (107,3,'V9','syringe',0, 1893415560, 0, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (23,3, 311, 'V10','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (111,3,'V10','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (112,3,'V10','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (113,3,'V10','syringe',0, 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (114,3,'V10','syringe',0, 1893415560, 0, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (19,3, 307, 'V11','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (121,3,'V11','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (122,3,'V11','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (123,3,'V11','syringe',0, 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (124,3,'V11','syringe',0, 284012334, 536467742, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (24,3, 312, 'V12','syringe',0, 28927182, 36816414)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (131,3,'V12','syringe',0, 39446157, 60484108, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (132,3,'V12','syringe',0, 568024668, 0, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (25,3, 313, 'V13','syringe',0, 5259488, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (141,3,'V13','syringe',0, 7889231, 10518975, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (142,3,'V13','syringe',0, 10518975, 13148719, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (143,3,'V13','syringe',0, 28927182, 36816414, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (144,3,'V13','syringe',0, 157784630, 189341556, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (145,3,'V13','syringe',0, 284012334, 536467742, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (146,3,'V13','syringe',0, 568024668, 1861858634, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (147,3,'V13','syringe',0, 1893415560, 0, 1)");
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (26,3, 314, 'V14','syringe',0, 28927182, 36816414)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (151,3,'V14','syringe',0, 39446157, 60484108, 1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,key,icon,gender,period_start,period_end,child) VALUES (152,3,'V14','syringe',0, 284012334, 536467742, 1)");
			
			
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end,info) VALUES (204,4, 400,'info_checkup_schwangerschaft','pregnancy',0,0,0,1)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (27,4, 401,'S1','pregnancy',2,1, 0, 4838400)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (28,4, 402,'S2','pregnancy',2,1, 5443200, 7257600)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (29,4, 403,'S3','pregnancy',2,1, 7862400, 9676800)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (30,4, 404,'S4','pregnancy',2,1, 10281600, 12096000)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (31,4, 405,'S5','pregnancy',2,1, 12700800, 14515200)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (32,4, 406,'S6','pregnancy',2,1, 15120000, 16934400)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (33,4, 407,'S7','pregnancy',2,1, 17539200, 19353600)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (34,4, 408,'S8','pregnancy',2,1, 19958400, 21772800)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (35,4, 409,'S9','pregnancy',2,1, 22377600, 24192000)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (36,4, 410,'S10','pregnancy',2,1, 24796800, 25401600)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,pregnancy,period_start,period_end) VALUES (37,4, 411,'S11','pregnancy',2,1, 27820800, 29030400)");



			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end,info) VALUES (205,5, 500,'info_checkup_u','baby',0,0,0,1)");
		
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (38,5, 501,'UU1','baby',0, 0, 259200)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (39,5, 502,'UU2','baby',0, 259200, 2419200)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (40,5, 503,'UU3','baby',0, 2419200, 7889231)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (41,5, 504,'UU4','baby',0, 7889231, 15778463)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (42,5, 505,'UU5','baby',0, 15778463, 26297438)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (43,5, 506,'UU6','baby',0, 26297438, 31556926)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (44,5, 507,'UU7','baby',0, 31556926, 63113852)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (45,5, 508,'UU7A','baby',0, 63113852, 94670778)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (46,5, 509,'UU8','baby',0, 94670778, 126227704)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (47,5, 510,'UU9','baby',0, 126227704, 168303605)");
			//tx.executeSql("INSERT INTO checkupitem (id,cat_id,ordering,key,icon,gender,period_start,period_end) VALUES (48,5, 511,'UU10','baby',0, 168303605, 441796964)");

			
			
			


		   // console.log('createTable done !');
		    
			
			
			
		}, queryError, function () {
		
			console.log('!!!! db done!');
		});
		
	};
    
	return {
		select: select,
		openDatabase: openDatabase,
		queryError: queryError,
		getLocalDbObject: getLocalDbObject,
		insertUser: insertUser,
		getUserById: getUserById,
		getUserByActive: getUserByActive,
		delUserById: delUserById,
		setUserToActive: setUserToActive
	};
	
}());


/*
*	Modul App 
*/


MYAPP.app = (function(){
	
	var open = 0,
		setActiveUserBtn = function () {
			var userData = MYAPP.db.getUserByActive()
				userBtns = jQuery('.btn_userName');
			if (userData.name != 'Nutzername') {
				userBtns.html(userData.name);
			}
		};
	
	return {
		setActiveUserBtn: setActiveUserBtn
	};
	
}());






/*
*	Modul Sprachicon 
*/



MYAPP.sprachicon = (function(){

	var lang = 'en',
	db = {},
	initIcon = function () {

		if (db && db.data) {
			setLang(lang);
			
			jQuery('#page_34').off(clickOrTouch,'.sprachiconPlay').on(clickOrTouch,'.sprachiconPlay', function (e) {
				var id = jQuery(e.currentTarget).data('sprachicon');
				if (id) {
					play(id, e.currentTarget);
				}
			});
		} else {

			jQuery.getJSON("com_sprachicons/db.json", function(data){         
				if (data) {
					db = data;
					initIcon();
				}
			});
		}
	},
	initText = function () {
	
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
				}
			});
		}
	},
	checkLangData = function () {
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
										
										var src = 'com_sprachicons/audio_all/'+lang+'/'+audio;
										if (device.platform == 'Android') {
											src = '/android_asset/www/'+src;
										}
										var media = new Media(src, function () {
											//alert('ok');
										}, function () {
											alert('error');
										}, function (s) {
											if (s == 2) {
												text.css('opacity', 0.2);
											} else if ( s == 4) {
												text.css('opacity', 1);
											}
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
		var file = db.data.text[lang][key].text;
		if (!file) {
			return false;
		}
		return file;
	},
	getTextAudio = function (key) {
		var file = db.data.text[lang][key].audio;
		if (!file) {
			return false;
		}
		return file;
	},
	play = function (id, dom) {

		if (!id) {
			return false;
		}
		var file = db.data.icons[lang][id];
		if (!file) {
			return false;
		}
		var over = undefined;
		var src = 'com_sprachicons/audio/'+lang+'/'+file+'.mp3';
	
		if (device.platform == 'Android') {
			src = '/android_asset/www/'+src;
		}
		
		var media = new Media(src, function () {
			//alert('ok');
		}, function (e) {
			alert('error');
		}, function (s) {
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



/*
*	Modul Page 
*/



MYAPP.page = (function(){
	
	var open = 0,
		lastopen = 0,
		dateFormat = 'DD.MM.YYYY',
		lang = 'de',
		pageHistory = [],
		changeContent = function (e, task, content, pageId) {


			switch (task) {

				case 'nix':
					break;
				
				case 'loadStart':
					MYAPP.app.setActiveUserBtn();
					break;

				case 'sprachiconBtnInit':
					MYAPP.sprachicon.checkLangData();
					MYAPP.page.changePageById(lastopen);
					break;
					
				case 'sprachtoolInit':
					MYAPP.sprachicon.initIcon();
					break;
				
				case 'sprachtextInit':
					MYAPP.sprachicon.initText();
					break;
				
				case 'sprachiconSave':
					var sprachlang = jQuery(e.currentTarget).data('lang');
					if (sprachlang) {
						MYAPP.sprachicon.setLang(sprachlang);
					}
					//alert(lastopen+' -'+open+'# '+pageId);
					
					//pageId,pageTask,pageContent
					
					if (lastopen == 34) {
						MYAPP.page.changePageById(lastopen, 'sprachtoolInit');
					} else if(lastopen == 35) {
						MYAPP.page.changePageById(lastopen, 'sprachtextInit');
					}
					
					
					break;
					
				case 'loadIgel':
				
					jQuery('#page_3 .content .innerContent').hide();
					jQuery('#page_3 .content').find('.acco-head').each(function () {
						if ( jQuery(this).hasClass('toggle-open') ) {
							jQuery(this).removeClass('toggle-open').addClass('toggle-close');
						}
						jQuery(this).off(clickOrTouch).on(clickOrTouch,function (e) {
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
					break;

				case 'loadArztsuche':

					var ref_las = window.open('https://aok.wlae.mobile.weisse-liste.de/wlmoae', '_blank', 'location=no');
					
					//var ref_las_close = function () {
					//	ref_las.close(); 
						/* !only Android */
						//document.removeEventListener('backbutton', ref_las_close);
						//MYAPP.init.onBackButtonListener();
					//};

					var func_ref_las_close = function(event) { 
						if (event.url == $_urlSuccessPage_1 || event.url == $_urlSuccessPage_3 || event.url == $_urlSuccessPage_4 || event.url == $_urlSuccessPage_5 ) {
					   		ref_las.close();    
					    }
					}
					
					ref_las.addEventListener('loadstop', func_ref_las_close);
					
					/* !only Android */
					//document.addEventListener('backbutton', ref_las_close);
					break;
				
				case 'loadArztbewertung':
					
					var ref_lab = window.open('https://aok.wlab.mobile.weisse-liste.de/wlmoab', '_blank', 'location=no');
					
					//var ref_lab_close = function () {
					//	ref_lab.close(); 
						/* !only Android */
						//document.removeEventListener('backbutton', ref_lab_close);
						//MYAPP.init.onBackButtonListener();
					//};
					
					var func_ref_lab_close = function(event) { 
						if (event.url == $_urlSuccessPage_1 || event.url == $_urlSuccessPage_3 || event.url == $_urlSuccessPage_4 || event.url == $_urlSuccessPage_5 ) {
					   		ref_lab.close();    
					    }
					}

					ref_lab.addEventListener('loadstop', func_ref_lab_close);
					/* !only Android */
					//document.addEventListener('backbutton', ref_lab_close);
					break;
					
				case 'loadAoksystemRegister':

					var ref_asr = window.open('https://registrierung-aok24.aok.de/arztnavigatormobil', '_blank', 'location=no');

					//var ref_asr_close = function () {
					//	ref_asr.close(); 
						/* !only Android */
						//document.removeEventListener('backbutton', ref_asr_close);
						//MYAPP.init.onBackButtonListener();
					//};

					var func_asr_lab_close = function(event) { 
						if (event.url == $_urlSuccessPage_1 || event.url == $_urlSuccessPage_3 || event.url == $_urlSuccessPage_4 || event.url == $_urlSuccessPage_5 ) {
					   		ref_asr.close();    
					    }
					}

					ref_asr.addEventListener('loadstop', func_asr_lab_close);
					
					
					/* !only Android */
					//document.addEventListener('backbutton', ref_asr_close);
					break;
					
				case 'loadAoksystemFav':
				
					var ref_laf = window.open('https://aok.wlae.mobile.weisse-liste.de/merkliste', '_blank', 'location=no');

					//var ref_laf_close = function () {
					//	ref_laf.close(); 
						/* !only Android */
						//document.removeEventListener('backbutton', ref_laf_close);
						//MYAPP.init.onBackButtonListener();
					//};
					
					var func_laf_lab_close = function(event) { 
						if (event.url == $_urlSuccessPage_1 || event.url == $_urlSuccessPage_3 || event.url == $_urlSuccessPage_4 || event.url == $_urlSuccessPage_5 ) {
					   		ref_laf.close();    
					    }
					}

					ref_laf.addEventListener('loadstop', func_laf_lab_close);

              
              
					/* !only Android */
					//document.addEventListener('backbutton', ref_laf_close);
					break;

			
				case 'loadDocsearch':
				
					$('#docsearch_form')
						.on('submit',MYAPP.page.com_docsearch.submitForm);
						
					$('#page_7 .gps').off(clickOrTouch).on(clickOrTouch,function () {
						//alert('click');
						
						navigator.geolocation.getCurrentPosition(MYAPP.page.com_docsearch.onGpsSuccess, MYAPP.page.com_docsearch.onGpsError );
					});
						
					break;
					
				case 'loadVorsorgecats':
					
					var sqlwhere = [];
					sqlwhere.push(' ( pregnancy = 1 OR pregnancy IS NOT NULL ) ');
					var sql = 'SELECT * FROM checkupcat';
					if (sqlwhere.length > 0) {
						sql += ' WHERE ';
						jQuery.each(sqlwhere,function (k,i) {
							if (k > 0) { 
								sql += ' AND ';
							}
							sql += i;
						});
					}
					var html = jQuery('<ul></ul>');
					MYAPP.db.select(sql, function (results) {
						for (var i = 0; i <= results.rows.length; i += 1) {
						var li = jQuery('<li class="hoehe-1 padding white schatten-aussen menu-headline"></li>')
									.text(results.rows.item(i).title)
									.addClass('icon-'+results.rows.item(i).icon)
									.data('id',results.rows.item(i).id)
									.on(clickOrTouch, function (e) {
										changePageById(41, 'loadVorsorgeitems', jQuery(this).data('id') );
									})
									.load('com_checkup/'+lang+'/checkupcat/head/'+results.rows.item(i).title+'.tpl');
							html.append(li);
					    }
					});
					jQuery('#page_4 .content').html('').append(html);
					break;
					
				case 'loadVorsorgeitems':
					
					var sqlwhere = [];
					sqlwhere.push(' cat_id = '+content+' ');
					sqlwhere.push(' ( pregnancy = 1 OR pregnancy IS NULL ) ');
					var sql = 'SELECT * FROM checkupitem';
					sql += ' WHERE ';
					if (sqlwhere.length > 0) {
						jQuery.each(sqlwhere,function (k,i) {
							if (k > 0) { 
								sql += ' AND ';
							}
							sql += i;
						});
					}
					if (sql)  { sql += ' AND '; }
					sql += ' child IS NULL ';
					sql += 'ORDER BY ordering ASC';
					var html = jQuery('<ul></ul>');
					MYAPP.db.select(sql, function (results) {
						if (results.rows.length) {
							for (var i = 0; i <= results.rows.length; i += 1) {
								var li = jQuery('<li class="hoehe-1 padding white schatten-aussen grey menu-headline"></li>')
										.data('id',results.rows.item(i).id)
										.data('link',results.rows.item(i).key)
										.on(clickOrTouch, function (e) {
											changePageById(42, 'loadVorsorgeitemDetail',   {link:jQuery(this).data('link'),cat_id:content} );
										});
								var innerContent = 0;
								if (results.rows.item(i).info == 1) {
									innerContent = jQuery('<div />')
										.addClass('innerContent none content-text acco-content padding')
										.text('Info')
										.load('com_checkup/'+lang+'/checkupitem/content/'+results.rows.item(i).key+'.tpl',function () {});
									var head = jQuery('<div />')
										.load('com_checkup/'+lang+'/checkupitem/head/'+results.rows.item(i).key+'.tpl',function () {})
										.addClass('pad-lft-10 hoehe-100 icon-info padding');
										li.addClass('toggle-close')
										.off(clickOrTouch).on(clickOrTouch,function (e) {
											if ( jQuery(e.currentTarget).hasClass('toggle-open') ) {
												jQuery(e.currentTarget).removeClass('toggle-open').addClass('toggle-close')
													.next('.innerContent').slideUp();
											} else {
												jQuery(e.currentTarget).removeClass('toggle-close').addClass('toggle-open')
													.next('.innerContent').slideDown();
											}
											return false;
										});
									li.html('').append(head);
								} else {
									li.load('com_checkup/'+lang+'/checkupitem/head/'+results.rows.item(i).key+'.tpl',function () {});
								}
								html.append(li);
								if (innerContent) {
									html.append(innerContent);
								}
							}
						} else {
						    var empty = jQuery('<li />')
						    	.addClass('hoehe-1 padding white schatten-aussen grey')
						    	.text('Kein Ergebniss');
						    html.append(empty);
					    }
					    
					});
					jQuery('#page_41 .content').html('').append(html);
					
					break;
				
				case 'loadVorsorgeitemDetail':
					jQuery('#page_42 .content')
						.html('')
						.load('com_checkup/'+lang+'/checkupitem/content/'+content.link+'.tpl');
					break;
				
				case 'loadUserEventsDetail':

					jQuery('#page_24 .content')
						.html('')
						.load('com_checkup/'+lang+'/checkupitem/content/'+content+'.tpl', function () {
							var btn_kill = jQuery('<div />')
								.text('Untersuchung ausblenden')
								.addClass('hoehe-1 padding white schatten-aussen active menu-headline')
								.off (clickOrTouch)
								.on (clickOrTouch, function () {
									var userData = MYAPP.db.getUserByActive();
									userData.vsblacklist.push(content);
									MYAPP.db.insertUser(userData, function () {
										changePageById(21,'getUserEvents');
									});
								}),
							breaker = jQuery('<br />')
								.addClass('breaker'),
							form_info = jQuery('<span />')
								.html('<br> Legen Sie einen neuen Termin fest <br>'),
							form_date = jQuery('<input />')
								.attr('type','date')
								.attr('id','inputDate-newUserEvent')
								.addClass('hoehe-1 padding white schatten-innen menu-headline')
							,form_userDate = jQuery('<div />');

							
							
							
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



							var userData = MYAPP.db.getUserByActive();
							if ( typeof userData.vscallist[content] === 'object' ) {
								form_userDate.html('<br>Vorsorgetermin geplant am '+userData.vscallist[content].startdate);
							}	
							jQuery('#page_24 .content')
							.append(form_userDate)
							.append(form_info)
							.append(form_date)
							.append(btn_kill);
						});
					break;
					
					
				case 'getUserEvents':
				
					var sql = 'SELECT * FROM checkupitem',
						where = 'info IS NULL AND pregnancy IS NULL';
					var userData = MYAPP.db.getUserByActive();
					if (userData.age != '0000-00-00') {
						var ageSek = DEVICEOS.calendar.getDateObj( userData.age );
						var nowSek = new Date().getTime() / 1000,
							diffSek =  parseInt( nowSek - ageSek );
						if (diffSek > 0) {
							if (where)  { where += ' AND '; }
							where += ' ( period_start = 0 OR period_start <= '+diffSek+' ) AND ( period_end > '+diffSek+' OR period_end = 0 ) ';
						}
					} else {
						if (userData.age_range !='date') {
							var now = new Date(),
								nowSek = now.getTime() / 1000;
							var ageSek = new Date( now.getFullYear() - userData.age_range, now.getMonth()-1, now.getDate() ) / 1000,
								diffSek =  parseInt( nowSek - ageSek );
							if (diffSek != 0) {
								if (where)  { where += ' AND '; }
								where += ' ( period_start = 0 OR period_start <= '+diffSek+' ) AND ( period_end > '+diffSek+' OR period_end = 0 ) ';
							}
						}
					}
					if (userData.gender != 0) {
						if (where)  { where += ' AND '; }
						where += ' (gender = '+userData.gender+' OR gender = 0) ';
					}
					for (keyBlack in userData.vsblacklist) {
						if (where)  { where += ' AND '; }
						where += ' key != "'+userData.vsblacklist[keyBlack]+'"';
					}
					if (where) { sql += ' WHERE '+where; }
					sql += '  ORDER BY  period_start DESC';
					var html = jQuery('<ul></ul>');
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
					});
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
					jQuery('#page_21 .content').html('').append(html);
					break;
					
					
				case 'getUserList':
					
					var html = jQuery('<ul></ul>');
					var userBase = MYAPP.db.getLocalDbObject('userBase');
					jQuery.each(userBase.user, function (k,i){
						var divUser = jQuery('<div></div>')
										.addClass('userName')
										.addClass('float-left hoehe-1')
										.text(i.name)
										.data('id','user-'+i.id)
										.on(clickOrTouch, function (e) {
											changeContent(e, 'getUserEdit', jQuery(this).data('id') );
										});
						var divMainUser = jQuery('<div></div>')
										.addClass('divMainUser')
										.addClass('hoehe-1')
										.addClass('float-right')
										.data('id',i.id)
										.on(clickOrTouch, function (e) {
											var del_user_id = $(this).data('id');
											MYAPP.db.setUserToActive(del_user_id, function () {
												MYAPP.app.setActiveUserBtn();
												MYAPP.page.changePageById(22,'getUserList');
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
					break;
				
				case 'setNewUser':
					
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
					if (device.platform == 'Android') {
					
						
			        	var tempDate = newUser.age.split('.');
			        	newUser.age = moment( tempDate[1]+'/'+tempDate[0]+'/'+tempDate[2] ).format();
		        	
			        	
					}
					//alert('OK '+newUser.age);
					var id = jQuery('#form_id').val();
					if ( id ) {
						newUser.id = id;
						var userData = MYAPP.db.getUserById(id);
						newUser.vscallist = userData.vscallist;
						newUser.vsblacklist = userData.vsblacklist;
					}
					MYAPP.db.insertUser(newUser, function () {
						MYAPP.app.setActiveUserBtn();
						changePageById(22,'getUserList');
					});
					break;
					
				case 'clearUserForm':
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
					
					
					
					
					if (device.platform == 'Android') {
						//alert('clearUserForm');

						

						DEVICEOS.calendar.setInputEvents(jQuery('#page_23 #userNew_form_date'), function (e) { 
						
							var formatedDate = moment(jQuery('#page_23 #userNew_form_date').val()).format(dateFormat);
							jQuery('#page_23 #userNew_form_date').val(formatedDate);
							
							//alert( jQuery(e.currentTarget).val() ); 	
							
						});
					

					} else {
						
						$('#page_23 #userNew_form_date').attr('type','text').attr('placeholder','Geburtsdatum');
						
						$('#page_23 #userNew_form_date').on('focus',function(e) {
							$(e.currentTarget).attr('type','date');
						});
						$('#page_23 #userNew_form_date').on(clickOrTouch,function(e) {
							$(e.currentTarget).attr('type','date');
						});
					}
					
					jQuery('#page_23 #form_lang_select').val('de');
					break;
					
				case 'getUserEdit':
					
					jQuery('#page_23 .trashDialog').hide();
					var id = content.split('-'); 
					var userData = MYAPP.db.getUserById( id[1] );
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
					if(userData.age ) {
						
						//alert('age: '+userData.age);

						if (device.platform == 'Android') {
							/*
if (userData.age == '0000-00-00' || userData.age == 'Invalid date' ) {
								//userData.age == new Date();
								//alert(userData.age);
								userData.age = moment().format(dateFormat);
								alert('formatedDateNow: '+userData.age);
							}
							
*/
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
					

					if(userData.lang) {
						jQuery('#page_23 #form_lang_select').val(userData.lang);
					}
					
					

					
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
						$('#page_23 #userNew_form_date').on(clickOrTouch,function(e) {
							$(e.currentTarget).attr('type','date');
						});
					}
					

					
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
						jQuery('#page_23 .trashDialog').fadeIn(500).off(clickOrTouch).on(clickOrTouch,function () {
							var user_id = jQuery('#page_23').find('#form_id').val();
							MYAPP.db.delUserById(user_id,function () {
								MYAPP.page.changePageById(22,'getUserList');
							});
						});
					});	
					changePageById(23,'');
					break;
					
				case 'toComFirst':
					
					$('body').addClass('first_page_11');
					$('#start_agerange_select').on('blur',function(e) {
						jQuery(e.currentTarget).data('task','firstSave');
						changePage(e);	
					});
					
					
					
					if (device.platform == 'Android') {
					
					//alert('ok a');
					
						$('#page_13 #start_age_input').on('focus',function(e) {
							$(e.currentTarget).removeClass('inputDate-firstUserBirthday');
						});
	

						DEVICEOS.calendar.setInputEvents( $('#page_13 #start_age_input'), function (e) { 
	
							changePageById(1,'firstSave');
							return false;
						});
						
					} else {
					

						$('#start_age_input').on(clickOrTouch,function(e) {
							$(e.currentTarget).attr('type','date');
						});
						
						$('#start_age_input').on('blur',function(e) {
							jQuery(e.currentTarget).data('task','firstSave');
							changePage(e);
						});
						

					}
					
					
					
					
					$('#start_name_input').on('blur',function(e) {
						jQuery(e.currentTarget).data('page','13').data('task','firstFivePage');
						changePage(e);
					});
					
					$('#start_name_input').on('change',function(e) {
						jQuery(e.currentTarget).data('page','13').data('task','firstFivePage');
						changePage(e);
					});

					break;

				case 'firstFivePage':
					$('body').addClass('first_page_15');
					
					break;	
					
				case 'firstCloseAndtoHome':					
					$('#start_lang_select').off('blur');
					$('#start_agerange_select').off('blur');
					$('#start_age_input').off('blur');
					$('#start_name_input').off('blur');
					
					$('body')
						.removeClass('first_page_11')
						.removeClass('first_page_12')
						.removeClass('first_page_13')
						.removeClass('first_page_15');
					
					MYAPP.app.setActiveUserBtn();
					break;
						
				case 'firstSkip':
					
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
					MYAPP.db.insertUser(blankUser, function () {
						changePageById(1,'firstCloseAndtoHome');
					});
					
					break;	
				
				
				case 'firstSetLang':
					$('body').addClass('first_page_12');
					break;
					
					
				case 'firstSetGender':
					$('body').addClass('first_page_13');
					jQuery('#start_gender').val( content );
					break;
		
				case 'firstSave':

					var myage = jQuery('#start_age_input').val();
					if (myage == 'Invalid date') {
						myage = '00-00-0000';
					}
					var firstUser = {
						name : jQuery('#start_name_input').val(),
						active : 1,
						age : myage,
						age_range : jQuery('#start_agerange_select').val(),
						gender : jQuery('#start_gender').val(),	
						lang : jQuery('#start_lang_select').val()				
					};

					MYAPP.db.insertUser(firstUser, function () {
						changePageById(1,'firstCloseAndtoHome');
					});
					
					break;
				
				case 'loadGeschsucheDetail':
					
					var k = jQuery.parseJSON(content);
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
					break;
					
				default:
					break;
			}	
			
			return true;
		},
		construct = function () {

			var page_anz = jQuery('.page').length;
			if (page_anz > 1 && typeof page_anz === 'number') {
				jQuery('.page').hide();
				jQuery('.page:first').show();
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
			
			//alert('changePageById '+pageId);
			
			var task = changeContent( null, pageTask, pageContent, pageId);
			if (task) {
				fadePageDom(pageId);
				addPageHistory(pageId,pageTask,pageContent);
			}
		},
		changePage = function (e) {

			if (jQuery(e.currentTarget).hasClass('pageBtnOffline')) {
				return false;
			}
			var pageId = jQuery(e.currentTarget).data('page'),
				pageTask = jQuery(e.currentTarget).data('task'),
				pageContent = jQuery(e.currentTarget).data('content');
				
			//alert(open+'changePage '+pageId);
				
			var task = changeContent( e, pageTask, pageContent, pageId );
			if (task) {
				fadePageDom(pageId);
				addPageHistory(pageId,pageTask,pageContent);
			}
			return false;
			
		}, 
		fadePageDom = function (pageId) {
			if (pageId && jQuery('#page_'+pageId).length > 0 ) {
				jQuery('body').find('.page').hide();
				jQuery('body').find('#page_'+pageId).show();
				lastopen = open;
				open = pageId;
				
			}
			return false;
		},
		addPageHistory = function (pageId,pageTask,pageContent) {
			var obj = {
				pageId: pageId,
				pageTask: pageTask,
				pageContent: pageContent
			};
			pageHistory.push(obj);	
		},
		getPageHistory = function () {
			return pageHistory;	
		},
		kickLastPageHistory = function (anz) {
			pageHistory = pageHistory.slice(0, pageHistory.length - anz);
		},
		timerOverlay = 0,
		openOverlay = function (type,time) {
			
			jQuery('#overlay')
				.css('background-image','url(img/overlay/'+type+'.svg)')
				.fadeIn(500)
			if (time) {
				clearTimeout(timerOverlay);
				timerOverlay = setTimeout(function (){
					closeOverlay()
				},time);
			}
		},
		closeOverlay = function () {
			jQuery('#overlay').fadeOut(400);
		};
	
	construct();
	
	return {
		changePage: changePage
		,changePageById: changePageById
		,openOverlay: openOverlay
		,closeOverlay: closeOverlay
		,getPageHistory: getPageHistory
		,kickLastPageHistory: kickLastPageHistory
		,addPageHistory: addPageHistory
	};
	
}());



/*
*	Modul Geschaeftsstellensuche
*/


MYAPP.page.com_docsearch = (function(){
	
	var configApp,
		timer,
		submitForm = function (e) {
			$('#docsearch_form .docsearch_text').blur();
			render( jQuery('#docsearch_form .docsearch_text').val() );
			return false;
		},
		onGpsSuccess = function (position) {
			//alert('gps ok');
			render('',position.coords.latitude,position.coords.longitude);
		},
		onGpsError = function (error) {
			jQuery('#page_7 .gps').addClass('pageBtnOffline').off(clickOrTouch);
		},
		render = function (str,lat,lon,page,limit) {
			MYAPP.page.openOverlay('spinner');
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
			getString = 'https://www.aok.de/src/bundesweit/geschaeftsstellen/json.php?limit='+limit+'&range=50&page='+page+searchParam;
			//alert(getString);
			jQuery('#page_7 .list').animate({ scrollTop: 0 }, "slow");
			var back = jQuery.getJSON(getString, {}, function (data) {
				if (data.treffer > 0) {

					var liste = jQuery('<ul/>');
					jQuery.each(data.geschaeftstellen, function (i,k) {
							var detail_json = '{"desc":"'+k.beschreibung+'", "strasse":"'+k.strasse+'", "hn":"'+k.hausnummer+'", "plz":"'+k.plz+'", "ort":"'+k.ort+'", "tel":"'+k.telefon+'"}';
							var li = jQuery('<li class="hoehe-2 padding white schatten-aussen grey menu-standard"></li>')
									.addClass('pageBtn')
									.data('page','8')
									.data('task','loadGeschsucheDetail')
									.off(clickOrTouch)
									.on(clickOrTouch,function () {
										var e = {};
										e.currentTarget = {};
										jQuery(e.currentTarget).data('page','8');
										jQuery(e.currentTarget).data('content',detail_json);
										jQuery(e.currentTarget).data('task','loadGeschsucheDetail');
										MYAPP.page.changePage(e);
									})
									.html('<span class="menu-headline">'+k.beschreibung+'</span><br><span class="eventdate">'+k.strasse+' '+k.hausnummer+'<br>'+k.plz+ ' ' +k.ort+'</span>');
						liste.append(li);
					});
					jQuery('#page_7 .list')
						.html(liste).show();
				} else {
					jQuery('#page_7 .list').html('').hide();
					jQuery('#page_7 .pagination').hide();
					jQuery('#page_7 .empty').show();
				}
				MYAPP.page.closeOverlay('spinner');
			});
		};
		
	return {
		submitForm: submitForm,
		onGpsSuccess: onGpsSuccess,
		onGpsError: onGpsError
	};
	
}());




/*
*	Modul init 
*/


MYAPP.init = (function () {
	
	var initialize = function () {
		//console.log('initialize!');
		bindEvents();
	},
	bindEvents = function () {
	
		document.addEventListener('deviceready', onDeviceReady, false);
		
		//alert('jo2');
		
		document.addEventListener("pause", function () {
			//console.log('$ os pause');
		}, false);
		
		
		
		
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
		jQuery('#page_1 .pageBtn[data-page="7"], #page_1 .pageBtn[data-page="2"]')
			.on(clickOrTouch,MYAPP.page.changePage)
			.removeClass('pageBtnOffline')
			.find('.menu-subline')
			.each(function () {
				jQuery(this).text( jQuery(this).data('text') );
			});
		
		initialize();
	},
	onDeviceReady = function () {

		//console.log('$ os deviceready');

		//alert('jo3');
		//alert(device.platform);
		
		if (device.platform == 'Android') {
			//console.log('------------ bindEvents onBackButton');
			//onBackButtonListener();
			
			$.getScript( "js/android/system.js", function () {
				MYAPP.page.addPageHistory(1,'loadStart','');
				MYAPP.db.openDatabase();
				var networkState = navigator.connection.type;
		
				if (networkState == 'none') {
					onDeviceOffline();
				}

				//alert('device '+device.platform);
			});
			
			
			document.removeEventListener('backbutton', onBackButton);
			document.addEventListener('backbutton', onBackButton);
	
		} else {
			
			$.getScript( "js/ios/system.js", function () {
				MYAPP.page.addPageHistory(1,'loadStart','');
				MYAPP.db.openDatabase();
				var networkState = navigator.connection.type;
		
				if (networkState == 'none') {
					onDeviceOffline();
				}

				//alert('device '+device.platform);
			});
		}
		



	}
	,onBackButton = function () {

		//console.log('------------ onBackButton');
		//console.log( MYAPP.page.getPageHistory() );
		var history = MYAPP.page.getPageHistory(),
			last = history[history.length -2];
		if ( typeof last === 'object') {
			//console.log('history laenge '+history.length)
			//console.log( last.pageId );
			MYAPP.page.kickLastPageHistory(2);
			MYAPP.page.changePageById(last.pageId, last.pageId, last.pageId);
		} else {
			navigator.app.exitApp();
		}
 	};
	return {
		initialize: initialize
	}
}());




