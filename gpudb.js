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

function subscribe(GPUdb_topic) {
    var request = {
		url : "http://localhost:8080/gadmin/atmosphere/pubsub/" + GPUdb_topic,
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

function connect(GPUdb_topic) {
    console.log("connect called");
    unsubscribe();
    subscribe(GPUdb_topic);
}

function GPUdb() {
	this._GPUdb_url = null;
	this._user_auth = "";
	this._sets = [];
	this._GPUdb_types = {};
	this._connect_state = "closed";

	this.logged = false;
	this.socket = $.atmosphere;
	this.subSocket = null;
	this.request = {};
	this.verbose = true;
	this.timeoutMilliseconds = 1000 * 60; // 1 minute
	
	console.log("To turn off GPUdb JavaScript API console logging, set verbose=false on the GPUdb object.");
	
    this.make_request = function(endpoint, fdatum, succeeded, failed) {
		var data_arr = {};
		var startMs = new Date().getTime();
		this.consoleLog(endpoint + " sending: " + JSON.stringify(fdatum));

		$.ajax({
			async: !!succeeded, // If a callback method is provided, make the call asynchronously
			url: this._GPUdb_url + endpoint,
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(fdatum),
			dataType: "json",
			context: this,
			timeout: this.timeoutMilliseconds, // Only valid for async mode
			success: function(data) {
				var endTime = new Date();
				var endMs = endTime.getTime();
				data_arr = JSON.parse(data.data_str.replace(/\\U/g,"\\u"));
				this.consoleLog(endpoint + " took " + ((endMs - startMs) / 1000) + " seconds (at " + endTime.toISOString() + ")");
				this.consoleLog(endpoint + " returned: " + JSON.stringify(data));
				if (succeeded) succeeded(data_arr);
			},
			error: function(xhr, status, error) {
				console.log("GPUdb " + endpoint + " call failed (" + status + "): " + error);
				if (failed) failed(xhr, status, error);
			}
		});

		return data_arr;
    }

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

  	this.connect = function(connect_str) {
  		if(this._connect_state == "closed") {
  			this._connect_state = "open";
  		}

		this._GPUdb_url = connect_str;
		this.consoleLog("opening connection to: " + this._GPUdb_url);
  	};

    this.add = function(set_id, object) {
		var fdatum = {
			object_data: '',
			object_data_str: JSON.stringify(object),
			object_encoding: "JSON",
			set_id: set_id
		};

		return this.make_request("/add", fdatum);
    }
  
    this.bbox = function(set_id, min_x, min_y, max_x, max_y, x_map, y_map, user_auth, dest_id) {
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
        
        return this.make_request("/boundingbox", fdatum);
    }

    this.create_parent_set = function(set_id) {
		var tempset = new Set();
		tempset._GPUdb_client = this;
		tempset.set_type = "parent";
		tempset.set_id = set_id;
		return tempset;
    };

    this.create_set = function(type_object, parent_set, set_id) {
		var fdatum = {};
		fdatum.set_id = set_id;
		if(parent_set != null) {
			fdatum.parent_set_id = parent_set.set_id;
		} else {
			//fdatum.parent_set_id = parent_set.set_id;
		}

		fdatum.type_id = type_object.type_id;
		
		this.make_request("/newset", fdatum);

		var tempset = new Set();
        tempset.set_id = set_id;
        tempset.semantic_type = type_object.semantic_type;
        tempset.type_label = type_object.type_label;
        tempset.type_id = type_object.type_id;
        tempset._GPUdb_client = this;

        if(parent_set != null) {
			parent_set.addChild(tempset);
        }

        return tempset;
    };

    this.create_type = function(object, stype, tlabel, annotation_id) {
		var type_def = {};
		type_def["type"] = "record";
		type_def["name"] = "point";
		type_def["fields"] = [];

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

		object.type_id = this.make_request("/registertype", fdatum).type_id;
        
        var temp = new GPUdbType(object.type_id, stype,tlabel);
        this._GPUdb_types[temp.type_id] = temp;
        return temp;
    };

    this.filter_by_list = function(filter_map, dest_id, set_id, user_auth) {
		var fdatum = {
			attribute_map: filter_map,
			result_set_id: dest_id,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/filterbylist", fdatum);
    }
	
	this.filter_by_nai = function(result_set_id, set_id, x_attribute, y_attribute, x_vector, y_vector, user_auth, succeeded, failed) {
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
	}

    this.filter_by_radius = function(result_set_id, set_id, x_attribute, y_attribute, x_center, y_center, radius, user_auth, succeeded, failed) {
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
    }
    
    this.filter_by_string = function(expression, mode, options, set_id, attributes, result_set_id, user_auth, succeeded, failed) {
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
    }
    
    this.get_set = function(set_id, start, end, user_auth, succeeded, failed) {
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
    }

    this.get_set_size = function(set_id) {
		var fdatum = {set_id: set_id};
		return this.make_request("/stats", fdatum).count_map[set_id];
    }

    this.group_by = function(set_id, attributes, user_auth) {
		var fdatum = {
			set_id: set_id,
			attributes:  attributes,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/groupby", fdatum);
    }

    this.histogram = function(set_id, attribute, start, end, interval, user_auth) {
		var fdatum = {
			attribute: attribute,
			end: end,
			interval: interval,
			set_id: set_id,
			start: start,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/histogram", fdatum);
    }

    this.maxmin = function(attribute, set_id, user_auth, succeeded, failed) {
    	var fdatum = {
			attribute: attribute,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};
    	
    	return this.make_request("/maxmin", fdatum, succeeded, failed);
    }
    
    this.nai  = function(set_id, x_vec , y_vec, x_map, y_map, user_auth, dest_id, succeeded, failed)
    {
		return this.filter_by_nai(dest_id, set_id, x_map, y_map, x_vec, y_vec, user_auth, succeeded, failed);
    }

    this.register_geofence = function(trigger_name, set_id, x_attribute, y_attribute, x_vector, y_vector, id_attr) {
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
    }

    this.select = function(expression, dest_id, set_id, user_auth, succeeded, failed) {
		var fdatum = {
			expression: expression,
			result_set_id: dest_id,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/select", fdatum, succeeded, failed);
    }

    this.set_info = function(set_id, succeeded, failed) {
		var fdatum = {set_ids: [set_id]};
		return this.make_request("/setinfo", fdatum, succeeded, failed);
    }

    this.status = function(set_id, succeeded, failed) {
		var fdatum = {set_id: set_id};
		return this.make_request("/status", fdatum, succeeded, failed);
    }

    this.store_group_by = function(set_id, attribute, group_map, sort_bool, sort_attr, user_auth) {
		var fdatum = {
			attribute: attribute,
			group_map: group_map,
			sort: sort_bool,
			sort_attribute: sort_attr,
			set_id: set_id,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/storegroupby", fdatum);
    }

    this.unique = function(set_id, attribute, user_auth, succeeded, failed) {
		var fdatum = {
			set_id: set_id,
			attribute: attribute,
			user_auth_string: user_auth || this._user_auth
		};

		return this.make_request("/unique", fdatum, succeeded, failed);
    }
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
	this._GPUdb_client = gc;
}

Set.prototype.histogram = function(attribute, start, end, interval) {
	this._GPUdb_client.consoleLog("attempting histogram at set");
	return this._GPUdb_client.histogram(this.set_id, attribute, start, end, interval, this._GPUdb_client._user_auth);
}

Set.prototype.get = function(start, end) {
	this._GPUdb_client.consoleLog("get called " + this.set_id);
	this.set_data =  this._GPUdb_client.get_set(this.set_id, start,end, "");
	return this.set_data;
}

Set.prototype.group_by = function(attributes) {
	this._GPUdb_client.consoleLog("CALLING FROM EVEN BEFORE THIS");
	return this._GPUdb_client.group_by(this.set_id, attributes, this._GPUdb_client._user_auth);
}

Set.prototype.select = function(expression) {
	var dest_id = guid();
	var nextset = new Set(this._GPUdb_client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._GPUdb_client.select(expression, dest_id, this.set_id, this._GPUdb_client._user_auth);
	return this.buildset(stats, nextset);
}

Set.prototype.size = function() {
	console.log("size called" + this.set_id);
	return GPUdb.get_set_size(this.set_id);
}

Set.prototype.store_group_by = function(attribute, group_map, sort_bool, sort_attr) {
	this._GPUdb_client.consoleLog("store group by");
	return this._GPUdb_client.store_group_by(this.set_id, attribute, group_map, sort_bool, sort_attr, this._GPUdb_client._user_auth);
}

Set.prototype.push = function(object) {
	this._GPUdb_client.consoleLog("sending: " + this.set_id);
	this._GPUdb_client.add(this.set_id, object);
}

Set.prototype.addChild = function(_set) {
    if(this.set_type == "parent") {
		this._GPUdb_client.consoleLog("actually attempting to push child in:" + _set.set_id);
		this.children[_set.set_id] = _set;
    }
}

Set.prototype.filter_by_radius = function(x_center, y_center, radius) {
	this._GPUdb_client.consoleLog("set filter by radius");
	var dest_id = guid();
	var nextset = new Set(this._GPUdb_client, dest_id,"", this.semantic_type, this.type_label);
	var stats = new this._GPUdb_client.filter_by_radius(dest_id, this.set_id, "x", "y", x_center, y_center, radius, this._GPUdb_client.user_auth);

	return this.buildset(stats,nextset);
}

Set.prototype.filter_by_list = function(filter_map) {
	this._GPUdb_client.consoleLog("set filter by list");
	var dest_id = guid();
	var nextset = new Set(this._GPUdb_client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._GPUdb_client.filter_by_list(filter_map, dest_id, this.set_id, this._GPUdb_client._user_auth);

	return this.buildset(stats,nextset);
}

Set.prototype.nai  = function(x_vec, y_vec) {
	this._GPUdb_client.consoleLog("set.nai called");
	var x_map = "x";
	var y_map = "y";
	var user_auth = "";
	var dest_id = guid();
	this._GPUdb_client.consoleLog("set.nai:guid:" + dest_id);
	var nextset = new Set(this._GPUdb_client, dest_id, "", this.semantic_type, this.type_label);
	this._GPUdb_client.consoleLog("before nai call");
	var stats = this._GPUdb_client.nai(this.set_id, x_vec, y_vec, x_map, y_map, user_auth, dest_id);
	this._GPUdb_client.consoleLog("after nai call");
	nextset.set_size = stats.count;

	return this.buildset(stats, nextset);
}

Set.prototype.buildset = function(stats, nextset) {
	nextset.set_size = stats.count;
	var set_info = this._GPUdb_client.set_info(nextset.set_id);

	if(set_info.type_ids.length > 1) {
		nextset.set_type = "parent";
		for(var x = 0;x < set_info.set_ids.length;x++) {
			this._GPUdb_client.consoleLog("adding child");
			var tempset = new Set(this._GPUdb_client, set_info.set_ids[x], set_info.type_ids[x], set_info.semantic_types[x], set_info.labels[x]);
			nextset.children[set_info.set_ids[x]] = tempset;
		}
	} else {
		nextset.parent_type = "default";
	}

	return nextset;
}

Set.prototype.bbox = function(min_x, min_y, max_x, max_y) {
	this._GPUdb_client.consoleLog("bbox called");
	var temptype = {};
	var x_map = "x";
	var y_map = "y";
	var user_auth = "";
	var dest_id = guid();
	var nextset = new Set(this._GPUdb_client, dest_id, "", this.semantic_type, this.type_label);
	var stats = this._GPUdb_client.bbox(this.set_id, min_x, min_y, max_x, max_y, x_map, y_map, user_auth, dest_id);

	return this.buildset(stats,nextset);
}
