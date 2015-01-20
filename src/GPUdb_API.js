function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
			   .toString(16)
			   .substring(1);
}

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		   s4() + '-' + s4() + s4() + s4();
}

var detectedTransport = null;
var socket; // = atmosphere;
var subSocket;

function subscribe(topic) {
    var request = {
		url : "http://localhost:8080/gadmin/atmosphere/pubsub/" + topic,
		trackMessageLength : true,
		transport: 'websocket'
    };

    request.onMessage = function (response) {
        detectedTransport = response.transport;
        console.log(response.responseBody);
    };

    subSocket = socket.subscribe(request);
}

function unsubscribe(){
    socket.unsubscribe();
}

function connect(topic) {
    console.log("connect called");
    unsubscribe();
    subscribe(topic);
}

function GPUdb() {
	this._server_url = null;
	this._user_auth = "";
	this._sets = [];
	this._types = {};
	this._connect_state = "closed";
	this.logged = false;
	this.socket = $.atmosphere;
	this.subSocket = null;
	this.request = {};
	this.verbose = false;
	this.timeoutMilliseconds = 1000 * 60; // 1 minute
	
	//console.log("To turn off GPUdb JavaScript API console logging, set verbose=false on the GPUdb object.");
	
    this.make_request = function(endpoint, fdatum, succeeded, failed) {
		var data_arr = {};
		var startMs = new Date().getTime();
		this.consoleLog(endpoint + " sending: " + JSON.stringify(fdatum));

		$.ajax({
			async: !!succeeded, // If a callback method is provided, make the call asynchronously
			url: this._server_url + endpoint,
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(fdatum),
			dataType: "json",
			context: this,
			timeout: this.timeoutMilliseconds, // Only valid for async mode
			success: function(data) {
				var endTime = new Date();
				var endMs = endTime.getTime();
				this.consoleLog(endpoint + " took " + ((endMs - startMs) / 1000) + " seconds (at " + endTime.toISOString() + ")");
				this.consoleLog(endpoint + " returned: " + JSON.stringify(data));

				if (data.status === "OK") {
					data_arr = JSON.parse(data.data_str.replace(/\\U/g,"\\u"));
					if (succeeded) succeeded(data_arr);
				} else if (failed) {
					failed(data, data.status, data.message);
				}
			},
			error: function(xhr, status, error) {
				console.log("GPUdb " + endpoint + " call failed (" + status + "): " + error);
				if (failed) failed(xhr, status, error);
			}
		});

		return data_arr;
    };

	this.consoleLog = function(str) {
		if (this.verbose) console.log(str);
	};

	this.request.onOpen = function(response) {
		this.consoleLog('Atmosphere connected using ' + response.transport);
	};

	this.request.onMessage = function (response) {
		this.consoleLog("recvd:" + response);
	};

	this.request.onClose = function(response) {
		logged = false;
		this.consoleLog("finished closing connection");
	};

	this.request.onError = function(response) {
		this.consoleLog("error occured");
	};

	this.__defineGetter__("sets", function(){
		this.consoleLog("define getter of sets called");
		return this._sets;
	});

	this.connect = function(connect_str, user, password) {
		if(this._connect_state === "closed") {
			this._connect_state = "open";
		}

		this._server_url = connect_str;

		if (user) {
			this.consoleLog("using authentication connection");

			$.ajaxSetup({
				headers: { 'Authorization': "Basic " + Base64.encode(user + ":" + password) }
			});
		}

		this.consoleLog("opening connection to: " + this._server_url);
	};

    this.add = function(set_id, object, succeeded, failed) {
 		var fdatum = {
 			object_data: '',
 			object_data_str: JSON.stringify(object),
 			object_encoding: "JSON",
 			set_id: set_id
 		};

 		return this.make_request("/add", fdatum, succeeded, failed);
     };
  
    this.boundingBox = function(set_id, min_x, min_y, max_x, max_y, x_map, y_map, user_auth, dest_id, succeeded, failed) {
        var fdatum = {
			min_x: min_x,
			max_x: max_x,
			min_y: min_y,
			max_y: max_y,
			x_attr_name: x_map,
			y_attr_name: y_map,
			set_id: set_id,
			result_set_id: dest_id,
			user_auth_string: user_auth || this._user_auth
		};
        
        return this.make_request("/boundingbox", fdatum, succeeded, failed);
    };

    this.clear = function(set_id, user_auth, succeeded, failed) {
		var fdatum = {
			set_id: set_id,
			authorization: user_auth || this._user_auth
		};

		return this.make_request("/clear", fdatum, succeeded, failed);
    };
  
    this.createParentSet = function(set_id) {
		var tempset = new Set();
		tempset._client = this;
		tempset.set_type = "parent";
		tempset.set_id = set_id;
		return tempset;
    };
	
    this.deleteObject = function(set_ids, object_id, user_auth, succeeded, failed) {
		var fdatum = {
			set_ids: set_ids,
			OBJECT_ID: object_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/deleteobject", fdatum, succeeded, failed);
    };

    this.filterByBounds = function(set_id, dest_id, attribute, lowerBound, upperBound, user_auth, succeeded, failed) {
		var fdatum = {
			attribute: attribute,
			lower_bound: lowerBound,
			result_set_id: dest_id,
			set_id: set_id,
			upper_bound: upperBound,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/filterbybounds", fdatum, succeeded, failed);
    };
	
    this.filterByList = function(filter_map, dest_id, set_id, user_auth, succeeded, failed) {
		var fdatum = {
			attribute_map: filter_map,
			result_set_id: dest_id,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/filterbylist", fdatum, succeeded, failed);
    };
	
    this.filterByNai = function(result_set_id, set_id, x_attribute, y_attribute, x_vector, y_vector, user_auth, succeeded, failed) {
            var fdatum = {
                    result_set_id: result_set_id,
                    set_id: set_id,
                    x_attribute: x_attribute,
                    x_vector: x_vector,
                    y_attribute: y_attribute,
                    y_vector: y_vector,
                    user_auth_string: user_auth || this._user_auth
            };

            return this.make_request("/filterbynai", fdatum, succeeded, failed);
    };

    this.filterByRadius = function(result_set_id, set_id, x_attribute, y_attribute, x_center, y_center, radius, user_auth, succeeded, failed) {
		var fdatum = {
			result_set_id: result_set_id,
			set_id: set_id,
			x_attribute: x_attribute,
			y_attribute: y_attribute,
			x_center: x_center,
			y_center: y_center,
			radius: radius,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/filterbyradius", fdatum, succeeded, failed);
    };
    
    this.filterByString = function(expression, mode, options, set_id, attributes, result_set_id, user_auth, succeeded, failed) {
    	var fdatum = {
			expression: expression,
			mode: mode,
			options: options,
			set_id: set_id,
			attributes: attributes,
			result_set_id: result_set_id,
			user_auth_string: user_auth || this._user_auth
		};
    	
    	return this.make_request("/filterbystring", fdatum, succeeded, failed);
    };
    
    this.filterByTrackRequest = function(set_id, track_id, spatial_radius, time_radius, spatial_distance_metric, target_track_ids,
        result_set_id, user_auth, succeeded, failed) {
        if(spatial_distance_metric !== null)
            spatial_distance_metric = "great_circle";
        var fdatum = {
            set_id: set_id,
            track_id: track_id,
            target_track_ids: target_track_ids,
            params: {
                spatial_distance_metric: spatial_distance_metric,// 'euclidean' or 'great_circle'
                spatial_radius: spatial_radius, //in meters when great_circle, otherwise uses euclidean
                time_radius: time_radius //seconds
            },
            result_set_id: result_set_id,
            user_auth_string: user_auth || this._user_auth
        };
        return this.make_request("/filterbytrack ", fdatum, succeeded, failed);
    };
    
    this.filterByValue = function(set_id, attribute, val, result_set_id, user_auth, succeeded, failed) {
    	var fdatum = {
			set_id: set_id,
			is_string: (typeof val === "string"),
			value: Number(val) || 0,
			value_str: val,
			attribute: attribute,
			result_set_id: result_set_id,
			user_auth_string: user_auth || this._user_auth
		};
    	
    	return this.make_request("/filterbyvalue", fdatum, succeeded, failed);
    };
	
    
    this.getSet = function(set_id, start, end, user_auth, succeeded, failed) {
		var fdatum = {
			start: start,
			end: end,
			set_id: set_id,
			semantic_type: "",
			user_auth_string: user_auth || this._user_auth
		};
		
		if (!!succeeded) {
			// We need to intercept the succeeded function
			var result = this.make_request("/getset", fdatum, function(r) {
				var sl = r.list_str;
				var da = [];
				for (var i = 0; i < sl.length; ++i) da.push(JSON.parse(sl[i]));
				succeeded(da);
			}, failed);
		} else { // Synchronous mode
			var result = this.make_request("/getset", fdatum);
			
			var strList = result.list_str;
			var data_arr = [];
			for (var i = 0; i < strList.length; ++i) data_arr.push(JSON.parse(strList[i]));
			
			return data_arr;
		}
    };
	
    this.getSetWithObjectIds = function(set_id, start, end, user_auth, succeeded, failed) {
		var fdatum = {
			start: start,
			end: end,
			set_id: set_id,
			semantic_type: "",
			user_auth_string: user_auth || this._user_auth
		};

		if (!!succeeded) {
			// We need to intercept the succeeded function
			var result = this.make_request("/getset", fdatum, function(r) {
				var sl = r.list_str;
				var da = [];
				for (var i = 0; i < sl.length; ++i) da.push(JSON.parse(sl[i]));
				succeeded({ object_ids: r.object_ids, objects: da });
			}, failed);
		} else { // Synchronous mode
			var result = this.make_request("/getset", fdatum);

			var strList = result.list_str;
			var data_arr = [];
			for (var i = 0; i < strList.length; ++i) data_arr.push(JSON.parse(strList[i]));

			return { object_ids: result.object_ids, objects: data_arr };
		}
    };
        
    this.groupBy = function(set_id, attributes, user_auth) {
		var fdatum = {
			set_id: set_id,
			attributes:  attributes,
			value_attribute: '',
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/groupbyvalue", fdatum);
    };

    this.groupByValue = function(set_id, attributes, value_attribute, user_auth) {
		var fdatum = {
			set_id: set_id,
			attributes:  attributes,
			value_attribute: value_attribute,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/groupbyvalue", fdatum);
    };

    this.histogram = function(set_id, attribute, start, end, interval, user_auth, succeeded, failed, value_attribute) {
		var params = {};
		if (value_attribute) { params["value_attribute"] = value_attribute; }
		var fdatum = {
			set_id: set_id,
        	attribute: attribute,
        	start: start,
        	end: end,
        	interval: interval,
        	params: params,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/histogram", fdatum, succeeded, failed);
    };

    this.maxmin = function(attribute, set_id, user_auth, succeeded, failed) {
    	var fdatum = {
			attribute: attribute,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};
    	
    	return this.make_request("/maxmin", fdatum, succeeded, failed);
    };
    
    this.newSet = function(type_object, parent_set, set_id, succeeded, failed) {
		var fdatum = {};
		fdatum.set_id = set_id;
		fdatum.parent_set_id = (parent_set && parent_set.set_id) || "";
		fdatum.type_id = type_object.type_id;
                var client = this;

		if (!!succeeded) {
			// We need to intercept the succeeded function
			this.make_request("/newset", fdatum, function() {
				var tempset = new Set();
				tempset.set_id = set_id;
				tempset.semantic_type = type_object.semantic_type;
				type_object.type_label;
				tempset.type_id = type_object.type_id;
				tempset._client = client;

				if(parent_set !== null) {
					parent_set.addChild(tempset);
				}

				succeeded(tempset);
			}, failed);
		} else { // Synchronous mode
			this.make_request("/newset", fdatum, succeeded, failed);

			var tempset = new Set();
			tempset.set_id = set_id;
			tempset.semantic_type = type_object.semantic_type;
			type_object.type_label;
			tempset.type_id = type_object.type_id;
			tempset._client = client;

			if(parent_set !== null) {
				parent_set.addChild(tempset);
			}

			return tempset;
		}
    };

    this.populateFullTracks = function(set_id, world_set_id, result_set_id, reserved, user_auth, succeeded, failed) {
        var fdatum = {
            set_id: set_id,
            world_set_id: world_set_id,
            result_set_id: result_set_id,
            reserved: [],
            user_auth_string: user_auth || this._user_auth
        };
        return this.make_request("/populatefulltracks ", fdatum, succeeded, failed);

    };
	
    this.random = function(set_id, count, param_map, succeeded, failed) {
        var fdatum = {
            set_id: set_id,
            count: count,
            param_map: param_map
        };
        return this.make_request("/random", fdatum, succeeded, failed);
    };

    this.registerTriggerNai = function(trigger_name, set_id, x_attribute, y_attribute, x_vector, y_vector, id_attr) {
		var fdatum = {
			request_id: trigger_name,
			set_ids: set_id,
			x_attribute: x_attribute,
			x_vector: x_vector,
			y_attribute: y_attribute,
			y_vector: y_vector,
			id_attr: ""
		};

		var res = this.make_request("/registertriggernai", fdatum);
		connect(res.trigger_id);
    };

    this.registerType = function(object, stype, tlabel, annotation_id, succeeded, failed) {
 		var type_def = {};
 		type_def["type"] = "record";
 		type_def["name"] = "point";
 		type_def["fields"] = [];
                 var types = this._types;

 		for(var name in object) {
 			var value = object[name];
 			var temp_field = {};
 			temp_field["name"] = name;
 			temp_field["type"] = (typeof value === "number") ? "double" : "string";
 			type_def.fields.push(temp_field);
 		}

 		var fdatum = {
 			type_definition: JSON.stringify(type_def),
 			annotation: annotation_id,
 			label: tlabel,
 			semantic_type: stype
 		};

 		if (!!succeeded) {
                     	// We need to intercept the succeeded function
 			this.make_request("/registertype", fdatum, function(r) {
 				object.type_id = r.type_id;

 				var temp = new GPUdbType(object.type_id, stype,tlabel);
 				types[temp.type_id] = temp;
 				succeeded(temp);
 			}, failed);
                 } else { // Synchronous mode
 			object.type_id = this.make_request("/registertype", fdatum, succeeded, failed).type_id;

         		var temp = new GPUdbType(object.type_id, stype,tlabel);
         		types[temp.type_id] = temp;
         		return temp;
 		}
     };

    this.select = function(expression, dest_id, set_id, user_auth, succeeded, failed) {
		var fdatum = {
			expression: expression,
			result_set_id: dest_id,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/select", fdatum, succeeded, failed);
    };
	
	this.serverStatus = function(option, succeeded, failed) {
			var fdatum = {option: option};
			return this.make_request("/serverstatus", fdatum, succeeded, failed);
	};
	

    this.setInfo = function(set_id, succeeded, failed) {
		var fdatum = {set_ids: [set_id]};
		return this.make_request("/setinfo", fdatum, succeeded, failed);
    };

    this.statistics = function(set_id, stats, attribute, user_auth, succeeded, failed) {
		var fdatum = {
			stats: stats,
			params: {},
			attribute: attribute,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/statistics", fdatum, succeeded, failed);
    };

    this.stats = function(set_id) {
		var fdatum = {set_id: set_id};
		return this.make_request("/stats", fdatum).count_map[set_id];
    };

    this.status = function(set_id, succeeded, failed) {
		var fdatum = {set_id: set_id};
		return this.make_request("/status", fdatum, succeeded, failed);
    };

    this.storeGroupBy = function(set_id, attribute, group_map, sort_bool, sort_attr, user_auth) {
		var fdatum = {
			attribute: attribute,
			group_map: group_map,
			sort: sort_bool,
			sort_attribute: sort_attr,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/storegroupby", fdatum);
    };

    this.unique = function(set_id, attribute, user_auth, succeeded, failed) {
		var fdatum = {
			set_id: set_id,
			attribute: attribute,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/unique", fdatum, succeeded, failed);
    };
	
    this.updateObject = function(set_ids, object_id, object, user_auth, succeeded, failed) {
		var fdatum = {
			set_ids: set_ids,
			OBJECT_ID: object_id,
			object_data: "",
			object_data_str: JSON.stringify(object),
			object_encoding: "JSON",
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/updateobject", fdatum, succeeded, failed);
    };
    
    this.selectdelete = function(set_id, expression, user_auth, succeeded, failed) {
    	var fdatum = {
    		set_id: set_id,
    		expression: expression,
    		user_auth_string: user_auth || this._user_auth
    	};
    	
    	return this.make_request("/selectdelete", fdatum, succeeded, failed);
    };
    
    this.selectupdate = function(set_id, expression, new_values_map, user_auth, succeeded, failed) {
    	var fdatum = {
    		set_id: set_id,
    		expression: expression,
    		new_values_map: new_values_map,
    		user_auth_string: user_auth || this._user_auth
    	};

    	return this.make_request("/selectupdate", fdatum, succeeded, failed);
    };
}

function GPUdbType(type_id, semantic_type, type_label) {
	this.type_id = type_id;
	this.semantic_type = semantic_type;
	this.type_label = type_label;
}

function Set(gc, set_id, type_id, semantic_type, type_label) {
	this.set_id = set_id;
	this.type_id = type_id;
	this.set_data = [];
	this.set_size = 0;
	this.type_label = type_label;
	this.semantic_type = semantic_type;
	this.set_type = "default";
	this.children = {};
	this._client = gc;
}

Set.prototype.addChild = function(_set) {
    if(this.set_type === "parent") {
		this._client.consoleLog("actually attempting to push child in:" + _set.set_id);
		this.children[_set.set_id] = _set;
    }
};

Set.prototype.boundingBox = function(min_x, min_y, max_x, max_y) {
	var x_map = "x";
	var y_map = "y";
	var dest_id = guid();
	var nextset = new Set(this._client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._client.boundingBox(this.set_id, min_x, min_y, max_x, max_y, x_map, y_map, null, dest_id);

	return this.buildset(stats, nextset);
};

Set.prototype.buildset = function(stats, nextset) {
	nextset.set_size = stats.count;
	var set_info = this._client.setInfo(nextset.set_id);

	if(set_info.type_ids.length > 1) {
		nextset.set_type = "parent";
		for(var x = 0;x < set_info.set_ids.length;x++) {
			this._client.consoleLog("adding child");
			var tempset = new Set(this._client, set_info.set_ids[x], set_info.type_ids[x], set_info.semantic_types[x], set_info.labels[x]);
			nextset.children[set_info.set_ids[x]] = tempset;
		}
	} else {
		nextset.parent_type = "default";
	}

	return nextset;
};

Set.prototype.filterByList = function(filter_map) {
	var dest_id = guid();
	var nextset = new Set(this._client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._client.filterByList(filter_map, dest_id, this.set_id, this._client._user_auth);

	return this.buildset(stats,nextset);
};

Set.prototype.filterByRadius = function(x_center, y_center, radius) {
	var dest_id = guid();
	var nextset = new Set(this._client, dest_id,"", this.semantic_type, this.type_label);
	var stats = new this._client.filterByRadius(dest_id, this.set_id, "x", "y", x_center, y_center, radius, this._client.user_auth);

	return this.buildset(stats,nextset);
};

Set.prototype.get = function(start, end) {
	this.set_data =  this._client.getSet(this.set_id, start,end, "");
	return this.set_data;
};

Set.prototype.groupBy = function(attributes) {
	return this._client.groupBy(this.set_id, attributes, this._client._user_auth);
};

Set.prototype.groupByValue = function(attributes, value_attribute) {
	return this._client.groupByValue(this.set_id, attributes, value_attribute, this._client._user_auth);
};

Set.prototype.histogram = function(attribute, start, end, interval) {
	return this._client.histogram(this.set_id, attribute, start, end, interval, this._client._user_auth);
};

Set.prototype.filterByNai  = function(x_vec, y_vec) {
	var x_map = "x";
	var y_map = "y";
	var user_auth = "";
	var dest_id = guid();
	var nextset = new Set(this._client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._client.filterByNai(this.set_id, x_vec, y_vec, x_map, y_map, user_auth, dest_id);
	nextset.set_size = stats.count;

	return this.buildset(stats, nextset);
};

Set.prototype.push = function(object) {
	this._client.add(this.set_id, object);
};

Set.prototype.select = function(expression) {
	var dest_id = guid();
	var nextset = new Set(this._client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._client.select(expression, dest_id, this.set_id, this._client._user_auth);
	return this.buildset(stats, nextset);
};

Set.prototype.stats = function() {
	console.log("stats called" + this.set_id);
	return this._client.stats(this.set_id);
};

Set.prototype.storeGroupBy = function(attribute, group_map, sort_bool, sort_attr) {
	return this._client.storeGroupBy(this.set_id, attribute, group_map, sort_bool, sort_attr, this._client._user_auth);
};
