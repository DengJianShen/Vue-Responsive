/*!
 * Vue-Responsive v@@version@@
 * @Url: https://github.com/reinerBa/Vue-Responsive
 * @License: MIT, Reiner Bamberger
 */
(function(){
	var vue_responsive={
		bind: function (el, binding, vnode) {
			var self=this;
			//Bootstrap 4 Repsonsive Utils default
			if (!this.__rPermissions) {
				this.__rPermissions = {};
				for (i in vnode.context.$data)
					if (i.indexOf("responsiveMarks$$") === 0) {
						var name = new String(i).replace("responsiveMarks$$", "").toLowerCase();
						this.__rPermissions[name] = {};
						for (ii in vnode.context.$data[i]) this.__rPermissions[name][ii] = vnode.context.$data[i][ii];
					}
				this.__rPermissions.undefined = { xs: { show: true, min: -1, max: 543 }, sm: { show: true, min: 544, max: 767 }, md: { show: true, min: 768, max: 991 }, lg: { show: true, min: 992, max: 1199 }, xl: { show: true, min: 1200, max: Infinity } };
				//:bs3
				this.__rPermissions.bs3 = { xs: { show: true, min: -1, max: 767 }, sm: { show: true, min: 768, max: 991 }, md: { show: true, min: 992, max: 1199 }, lg: { show: true, min: 1200, max: Infinity } };
			}
			var validInputs = ['hidden-all'];
			for (i in this.__rPermissions[binding.arg]) {
				validInputs.push(i);
				validInputs.push("hidden-"+i);
			} 
			
			//to use just one resize-event-listener whoose functions can easy unbound
			this.intervalInstId = ++this.intervalInstId || 1;
			vnode.intervalInstId = String(this.intervalInstId);
			if(typeof this.resizeListeners === 'undefined'){
				this.resizeListeners={};
				function callInstances(){
					for(var i in self.resizeListeners)
						if(!isNaN(i))
							self.resizeListeners[i]();
				}
				window.addEventListener("resize", callInstances);		
			}
			
			if (el.style.display.length){
				el.dataset.initialDisplay = el.style.display; //save the user defined css-value
			}
			var preParams = [];

			if (Array.isArray(binding.value) || (typeof binding.expression === "string" && !!binding.expression.match(/\[*\]/))) {
				if (Array.isArray(binding.value))
					preParams = binding.value;
				else {
					var stringArray = binding.expression.replace(/'/g, '"');
					preParams = JSON.parse(stringArray );
				}
				preParams.sort();
			} else if (typeof binding.value === 'object') {
				for (i in binding.value) {
					if (binding.value[i]) preParams.push(i);
				}
			} else if (typeof binding.value === "string" || typeof binding.expression === "string") {   //a single parameter
				var val = binding.value || binding.expression.replace(/'"/g, "");
				preParams = new Array(val);
				preParams.sort();
			} else {
				preParams = null;
				return false;
			}
			if (!preParams) return 0;


			var rPermissions = {};
			for (k in this.__rPermissions[binding.arg]){
				rPermissions[k] = true;
			}
			
			if (preParams[0] === "hidden-all") {
				preParams.splice(0, 1);
				for (i in this.__rPermissions[binding.arg]) {
					rPermissions[i] = false;
				}
			}
			
			var i = 0, item;
			while(item = preParams[i++]) {
				if (validInputs.indexOf(item) != -1) {
					if (item.indexOf("hidden")===0){ //hidden-..
						var key = item.split("-")[1];
						rPermissions[key] = false;
					} else {
						rPermissions[item]= true;
					}  
				}
			}
			el.dataset.responsives = JSON.stringify(rPermissions);
		},
		inserted: function (el, binding, vnode) { 
			if (el.dataset.responsives == null) return 0;
			var self=this;
			
			function checkDisplay() {
				var myPermissions = JSON.parse(el.dataset.responsives);
				var curWidth = window.innerWidth;
				var initial = el.dataset.initialDisplay ? el.dataset.initialDisplay : "block";
				for (i in self.__rPermissions[binding.arg]) {
					if (curWidth >= self.__rPermissions[binding.arg][i].min && curWidth <= self.__rPermissions[binding.arg][i].max) {
						el.style.display = myPermissions[i] ? initial :"none";
						break;
					}
				}
			};
			checkDisplay();
			
			this.resizeListeners[vnode.intervalInstId] = checkDisplay;
		},
		unbind: function (el, binding, vnode) { 
			delete this.resizeListeners[vnode.intervalInstId];
		}
	};

	// Check if the directive should be used globally
	var notGlobal=false;
	try{
		document.currentScript = document.currentScript || (function() {
			var scripts = document.getElementsByTagName('script');
			return scripts[scripts.length - 1];
		})();
		notGlobal= Boolean(document.currentScript.getAttribute('notGlobal'));
	}catch(e){e}

	if(!notGlobal && Vue)
		Vue.directive('responsiveness', vue_responsive);
	else
		window.v_responsiveness= vue_responsive;

})();