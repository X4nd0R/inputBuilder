/**************************************************************************\
*																			*
*		Input Builder														*
*																			*
*		This was meant to be a simple library to build and style custom		*
*		`select`, `checkbox` and `radio` elements. It is written in			*
*		vanilla JavaScript to be able to use with any project.				*
*																			*
*		Written by: X4nd0R													*
*		Xenith Tech															*
*		www.xenithtech.com/?keyword=inputbuilder							*
*																			*
\**************************************************************************/


function inputBuilder(){
	this.selectClass = function select(opts){

		let defaults = {
			dropdownImage: '',
			selector: '',
			placement: 'fill',
			name: '',
			id: ''
		};

		opts = extend({}, defaults, opts || {});

		let selector = opts.selector;
		let placement = opts.placement;
		let id = opts.id;
		let name = opts.name;
		let options = [];

		let open = false;
		let animating = false;
		let timer = -1;
		let current = 0;
		let interacted = false;

		let sel, outer, inner, display, dropdown;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){

			if(placement == 'fill'){

				let markup =
				'<div class="ib-select-outer">' +
				'<div class="ib-select-inner">' +
				'<select tabindex="-1" class="ib-select" ' + ( (id.length > 0) ? ('id="' + id + '" ') : ' ' ) + ( (name.length > 0) ? ('name="' + name + '" ') : ' ' ) + '>';

				for( let i = 0; i < options.length; i++ ){
					markup += '<option data-label="' + options[i].label + '" value="' + options[i].value + '">' + options[i].label + '</option>';
				}

				markup +=
				'</select>' +
				'<span tabindex="0" class="ib-select-display">' + options[0].label + '</span>' +
				'</div>' +
				'<div class="ib-select-dropdown-outer">';

				for( let i = 0; i < options.length; i++ ){
					markup += '<div data-id="' + i + '" class="ib-select-dropdown-option" data-value="' + options[i].value + '">' + options[i].label + '</div>';
				}

				markup += '</div>' +
				'</div>';

				let container = find(selector);

				if(container != null){
					container.innerHTML = markup;

					sel = find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' ));
					display = find(selector + ' span.ib-select-display');
					outer = find(selector + ' div.ib-select-outer');
					dropdown = find(selector + ' div.ib-select-dropdown-outer');

					if(opts.dropdownImage != ''){
						find(selector + ' .ib-select-inner').style.backgroundImage = opts.dropdownImage;
					}

					let optionEls = findAll(selector + ' div.ib-select-dropdown-option');

					optionEls.forEach(function addOptionClicks(option){
						option.addEventListener('mousedown', function(e){
							let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
							selected.forEach(function(el){
								el.classList.remove('selected');
							});

							this.classList.add('selected');
							sel.value = option.attributes['data-value'].value;
							current = parseInt(option.attributes['data-id'].value);
							display.innerHTML = this.innerHTML;
							clearTimeout(timer);
							animating = false;
							closeDrawer();
							open = false;

							e.preventDefault();
							return false;
						});

						option.addEventListener('mouseover', function(e){
							interacted = true;
							let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
							selected.forEach(function(el){
								el.classList.remove('selected');
							});

							this.classList.remove('selected');
						});
					});

					sel.addEventListener('change', function(){
						let opt = find(selector + ' option[value="' + sel.value + '"]');
						if(opt != null){
							display.innerHTML = opt.attributes['data-label'].value;
						}
					});

					display.addEventListener('click', function(e){
						console.log('display clicked');
						toggleDrawer();

						e.preventDefault();
						return false;
					});

					setDetectChangeHandler(sel);
					display.addEventListener('blur', function(){
						clearTimeout(timer);
						animating = false;

						open = false;
						dropdown.style.display = 'none';
						sync();
						//closeDrawer();
					});

					display.addEventListener('focus', function(){
						clearTimeout(timer);
						animating = false;
						//openDrawer();
					});

					display.addEventListener('keydown', function(e){
						var keyCode = e.which;
						if(keyCode == 38){
							if(!open){
								openDrawer();
							}
							else{
								current--;
								if(current < 0){
									current = options.length - 1;
								}
							}

							let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
							selected.forEach(function(el){
								el.classList.remove('selected');
							});
							find(selector + ' div.ib-select-dropdown-option[data-id="' + current + '"]').classList.add('selected');
							
							e.preventDefault();
							return false;
						}
						else if(keyCode == 40){
							if(!open){
								openDrawer();
							}
							else{
								current++;
								if(current >= options.length){
									current = 0;
								}
							}

							let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
							selected.forEach(function(el){
								el.classList.remove('selected');
							});
							find(selector + ' div.ib-select-dropdown-option[data-id="' + current + '"]').classList.add('selected');
							
							e.preventDefault();
							return false;
						}
						else if(keyCode == 13  ||  keyCode == 32){
							if(open){
								let selected = find(selector + ' div.ib-select-dropdown-option.selected');
								sel.value = selected.attributes['data-value'].value;
								current = parseInt(selected.attributes['data-id'].value);

								clearTimeout(timer);
								animating = false;
								closeDrawer();

								e.preventDefault();
								return false;
							}
							else{
								openDrawer();
							}
						}
					});

					let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
					selected.forEach(function(el){
						el.classList.remove('selected');
					});

					find(selector + ' div.ib-select-dropdown-option[data-value="' + sel.value + '"]').classList.add('selected');
				}
			}
			else if(placement == 'replace'){
				sel = find(selector);
				let tabIndex = 0;
				if(sel.hasAttribute('tabindex')  &&  sel.getAttribute('tabindex').length > 0){
					tabIndex = sel.getAttribute('tabindex');
				}
				sel.setAttribute('tabindex', '-1');

				let optEls = findAll(selector + ' option');			//Get options to parse through
				let _this = this;										//Store `this` in another variable to add option objects inside forEach
				let selected = 0;										//Default option to set the display with

				optEls.forEach(function(el, i){						//Parse Options
					let args = {};
					if(el.hasAttribute('value')  &&  el.getAttribute('value').length > 0){
						args.value = el.getAttribute('value');
					}
					else{
						args.value = i;									//If no value is found set it to index count as default
					}

					if(el.hasAttribute('data-label')  &&  el.getAttribute('data-label').length > 0){
						args.label = el.getAttribute('data-label');
					}
					else{
						args.label = ( (el.innerHTML.length > 0) ? el.innerHTML : ('Option ' + (i + 1)) );	//Set default label if no label was found
						el.setAttribute('data-label', args.label);
					}

					_this.addOption(args);

					if(el.selected){
						selected = i;
					}
				});

				if(sel != null  &&  sel.matches('select')){				//Make sure selector points to a select element
					let parent = sel.parentNode;							//Build outer container
					outer = document.createElement('div');
					outer.classList.add('ib-select-outer');
					parent.insertBefore(outer, sel);
					outer.appendChild(sel);

					inner = document.createElement('div');				//Build inner container
					inner.classList.add('ib-select-inner');
					outer.insertBefore(inner, sel);
					inner.appendChild(sel);

					display = document.createElement('span');			//Build Display
					display.classList.add('ib-select-display');
					display.setAttribute('tabindex', tabIndex);
					sel.after(display);
					display.innerHTML = options[selected].label;

					dropdown = document.createElement('div');			//Build dropdown tray
					dropdown.classList.add('ib-select-dropdown-outer');
					inner.after(dropdown);

					options.forEach(function(el, i){						//Populate Options
						let opt = document.createElement('div');
						opt.classList.add('ib-select-dropdown-option');
						opt.setAttribute('data-id', i);
						opt.setAttribute('data-value', el.value);
						dropdown.appendChild(opt);
						opt.innerHTML = el.label;
					});
				}
				else{
					throw new Error('When using replace, the provided selector must point to a radio input element');
				}
				
				if(opts.dropdownImage != ''){
					inner.style.backgroundImage = opts.dropdownImage;
				}

				let optionEls = dropdown.childNodes;

				optionEls.forEach(function addOptionClicks(option){
					option.addEventListener('mousedown', function(e){
						dropdown.childNodes.forEach(function(el, i){
							el.classList.remove('selected');
						});

						this.classList.add('selected');
						sel.value = this.attributes['data-value'].value;
						current = parseInt(this.attributes['data-id'].value);
						display.innerHTML = this.innerHTML;
						clearTimeout(timer);
						animating = false;
						closeDrawer();
						open = false;

						e.preventDefault();
						return false;
					});

					option.addEventListener('mouseover', function(){
						interacted = true;
						let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');
						selected.forEach(function(el){
							el.classList.remove('selected');
						});

						this.classList.remove('selected');
					});
				});

				sel.addEventListener('change', function(){
					let opt = find(selector + ' option[value="' + sel.value + '"]');
					if(opt != null){
						display.innerHTML = opt.attributes['data-label'].value;
					}
				});

				display.addEventListener('click', function(e){
					toggleDrawer();

					e.preventDefault();
					return false;
				});

				setDetectChangeHandler(sel);
				display.addEventListener('blur', function(){
					clearTimeout(timer);
					animating = false;

					open = false;
					dropdown.style.display = 'none';
					sync();
					//closeDrawer();
				});

				display.addEventListener('focus', function(e){
					clearTimeout(timer);
					animating = false;
					//openDrawer();

					e.preventDefault();
					return false;
				});

				display.addEventListener('keydown', function(e){
					var keyCode = e.which;
					if(keyCode == 38){
						if(!open){
							openDrawer();
						}
						else{
							current--;
							if(current < 0){
								current = options.length - 1;
							}
						}

						dropdown.childNodes.forEach(function(el, i){
							el.classList.remove('selected');
						});

						dropdown.childNodes.forEach(function(el, i){
							if(el.hasAttribute('data-id')  &&  el.getAttribute('data-id') == current){
								el.classList.add('selected');
							}
						});

						e.preventDefault();
						return false;
					}
					else if(keyCode == 40){
						if(!open){
							openDrawer();
						}
						else{
							current++;
							if(current >= options.length){
								current = 0;
							}
						}

						dropdown.childNodes.forEach(function(el, i){
								el.classList.remove('selected');
						});

						dropdown.childNodes.forEach(function(el, i){
							if(el.hasAttribute('data-id')  &&  el.getAttribute('data-id') == current){
								el.classList.add('selected');
							}
						});

						e.preventDefault();
						return false;
					}
					else if(keyCode == 13  ||  keyCode == 32){
						if(open){
							let selected = -1;
							dropdown.childNodes.forEach(function(el, i){
								if(el.classList.contains('selected')){
									selected = el;
								}
							});

							if(selected == -1){
								return;
							}

							sel.value = selected.attributes['data-value'].value;
							current = parseInt(selected.attributes['data-id'].value);

							clearTimeout(timer);
							animating = false;
							closeDrawer();

							e.preventDefault();
							return false;
						}
						else{
							openDrawer();
						}
					}
				});

				let seld = findAll(selector + ' div.ib-select-dropdown-option.selected');
				seld.forEach(function(el){
					el.classList.remove('selected');
				});

			}

		};

		function openDrawer(duration = 250){
			if(!open && !animating){
				animating = true;
				open = true;
				interacted = false;
				outer.classList.add('open');
				slideDown(dropdown, duration, function(){
					animating = false;
					sync();
				});
			}
		}

		function closeDrawer(duration = 250){
			if(open && !animating){
				animating = true;
				open = false;
				interacted = false;
				slideUp(dropdown, duration, function(){
					animating = false;
					sync();
				});
			}
		}

		function toggleDrawer(duration = 250){
			if(!animating){
				interacted = false;
				animating = true;
				if(open){
					open = false;
					slideUp(dropdown, duration, function(){
						animating = false;
						sync();
					});
				}
				else{
					open = true;
					outer.classList.add('open');
					slideDown(dropdown, duration, function(){
						animating = false;
						sync();
					});
				}
			}
		}

		function sync(){
			let selected = [];

			let opt = -1;

			dropdown.childNodes.forEach(function(el){
				if(el.hasAttribute('data-value')  &&  el.getAttribute('data-value') == sel.value){
					opt = el;
				}

				if(el.classList.contains('selected')){
					selected.push(el);
				}
			});

			if(opt == -1  ||  selected == -1){
				return;
			}

			if(!interacted){
				selected.forEach(function(el){
					el.classList.remove('selected');
				});
				opt.classList.add('selected');
				current = opt.attributes['data-id'].value;
			}

			if(open){
				outer.classList.add('open');
			}
			else{
				outer.classList.remove('open');
			}
			interacted = false;
		}

		this.open = function(duration = 250){
			openDrawer(duration);
		};

		this.close = function(duration = 250){
			closeDrawer(duration);
		};

		this.toggle = function(duration = 250){
			toggleDrawer(duration);
		};

		this.addOption = function addOption(args){
			if(typeof args == 'object'){
				return (options.push(args) - 1);
			}
		};

		this.val = function val(v){
			if(typeof v == 'undefined'){
				return sel.value;
			}
			else{
				
				let options = findAll(selector + ' div.ib-select-dropdown-option');
				options.forEach(function(option){
					if(option.attributes['data-value'].value == v){
						current = parseInt(option.attributes['data-id'].value);
						sel.value = v;
					}
				});
			}
		};
	};

	this.checkboxClass = function checkbox(opts){
		let defaults = {
			selector: '',
			placement: 'fill',
			name: '',
			id: '',
			label: '',
			checked: false,
			value: ''
		};

		opts = extend({}, defaults, opts || {});

		let selector = opts.selector;
		let placement = opts.placement;
		let name = opts.name;
		let id = opts.id;
		let label = opts.label;
		let checked = opts.checked;
		let value = opts.value;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){
			if(placement == 'fill'){
				let markup =
				'<label class="ib-checkbox-outer">' + label +
				'<input tabindex="-1" type="checkbox" ' + ( checked ? 'checked="checked" ' : ' ' ) + ( (id.length > 0) ? ('id="' + id + '" ') : ' ' ) + ( (name.length > 0) ? ('name="' + name + '" ') : ' ' ) + ( (value.length > 0) ? ('value="' + value + '" ') : ' ' ) + '>' +
				'<span tabindex="0" class="ib-checkbox-inner"><span class="ib-checkbox-mark"></span></span>' +
				'</label>';


				let container = find(selector);

				if(container != null){
					container.innerHTML = markup;

					let cb = find(selector + ' .ib-checkbox-inner');
					cb.addEventListener('keydown', function(e){
						var keyCode = e.which;
						if(keyCode == 32  ||  keyCode == 13){
							var inp = find(selector + ' input[type="checkbox"]');
							inp.checked = !(inp.checked);

							e.preventDefault();
							return false;
						}
					});
				}
			}
			else if(placement == 'replace'){
				let el = find(selector);
				if(el != null  &&  el.matches('input[type="checkbox"]')){
					let parent = el.parentNode;
					if(!parent.matches('label')){
						let wrapper = document.createElement('label');
						parent.insertBefore(wrapper, el);
						wrapper.appendChild(el);
					}
					let labelEl = el.parentNode;
					labelEl.classList.add('ib-checkbox-outer');
					if(!labelEl.hasAttribute('id')  ||  labelEl.getAttribute('id').length == 0){
						labelEl.setAttribute('id', Math.random().toString(36).slice(2));
					}

					let tabIndex = '0';
					if(el.hasAttribute('tabindex')  &&  el.getAttribute('tabindex').length > 0){
						tabIndex = el.getAttribute('tabindex');
					}

					el.setAttribute('tabindex', '-1');

					let inner = document.createElement('span');
					inner.classList.add('ib-checkbox-inner');
					labelEl.appendChild(inner);
					inner.setAttribute('tabindex', tabIndex);

					let mark = document.createElement('span');
					mark.classList.add('ib-checkbox-mark');
					inner.appendChild(mark);

					if(el.hasAttribute('id')  &&  el.getAttribute('id').length > 0){
						id = el.getAttribute('id');
					}
					else{
						id = Math.random().toString(36).slice(2);
						el.setAttribute('id', id);
					}

					if(label == ''){
						if(el.hasAttribute('data-label')  &&  el.getAttribute('data-label').length > 0){
							label = el.getAttribute('data-label');
						}
					}

					if(value == ''){
						if(el.hasAttribute('value')  &&  el.getAttribute('value').length > 0){
							value = el.getAttribute('value');
						}
					}

					el.setAttribute('value', value);

					let nodeFound = false;

					for(let i = 0; i < el.childNodes; i++){
						let curNode = el.childNodes[i];
						if(curNode.nodeName == '#text'){
							if(curNode.nodeValue.length > 0){
								if(label == ''){
									label = curNode.nodeValue;
								}
								else{
									curNode.nodeValue = label;
								}
							}
							nodeFound = true;
							break;
						}
					}

					if(!nodeFound){
						labelEl.prepend(label);
					}

					selector = '#' + labelEl.getAttribute('id');

					inner.addEventListener('keydown', function(e){
						var keyCode = e.which;
						if(keyCode == 32  ||  keyCode == 13){
							var inp = find(selector + ' input[type="checkbox"]');
							inp.checked = !(inp.checked);

							e.preventDefault();
							return false;
						}
					});
				}
				else{
					throw new Error('When using replace, the provided selector must point to a checkbox input element');
				}
			}
		};

		this.checked = function checked(val){
			let el = find(selector + ' input[type="checkbox"]');

			if( typeof val == 'undefined' ){
				return ( el == null ? null : el.checked);
			}
			else{
				if(el != null){
					//convert val to true boolean
					val = ( val ? true : false );
					el.checked = val;
				}
			}
		};

		this.val = function val(val){
			let el = find(selector + ' input[type="checkbox"]');
			if(typeof val == 'undefined'){
				return ( el == null ? null : el.value);
			}
			else{
				if(el != null){
					el.value = val;
				}
			}
		};
	};

	this.radioClass = function radio(opts){
		let defaults = {
			selector: '',
			placement: 'fill',
			name: '',
			id: '',
			label: '',
			checked: false,
			value: ''
		};

		opts = extend({}, defaults, opts || {});

		let selector = opts.selector;
		let placement = opts.placement;
		let id = opts.id;
		let name = opts.name;
		let label = opts.label;
		let checked = opts.checked;
		let value = opts.value;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){
			if(placement == 'fill'){
				let markup =
				'<label class="ib-radio-outer">' + label +
	  			'<input tabindex="-1" type="radio" ' + ( checked ? 'checked="checked" ' : ' ' ) + ( (id.length > 0) ? ('id="' + id + '" ') : ' ' ) + ( (name.length > 0) ? ('name="' + name + '" ') : ' ' ) + ( (value.length > 0) ? ('value="' + value + '" ') : ' ' ) + '>' +
	  			'<span tabindex="0" class="ib-radio-inner"><span class="ib-radio-mark"></span></span>' +
				'</label>';

				let container = find(selector);

				if(container != null){
					container.innerHTML = markup;

					let cb = find(selector + ' .ib-radio-inner');
					cb.addEventListener('keydown', function(e){
						let keyCode = e.which;
						if(keyCode == 32  ||  keyCode == 13){
							let inp = find(selector + ' input[type="radio"]');
							inp.checked = !(inp.checked);

							e.preventDefault();
							return false;
						}
					});
				}
			}
			else if(placement == 'replace'){
				let el = find(selector);
				if(el != null  &&  el.matches('input[type="radio"]')){
					let parent = el.parentNode;
					if(!parent.matches('label')){
						let wrapper = document.createElement('label');
						parent.insertBefore(wrapper, el);
						wrapper.appendChild(el);
					}
					let labelEl = el.parentNode;
					labelEl.classList.add('ib-radio-outer');
					if(!labelEl.hasAttribute('id')  ||  labelEl.getAttribute('id').length == 0){
						labelEl.setAttribute('id', Math.random().toString(36).slice(2));
					}

					let tabIndex = '0';
					if(el.hasAttribute('tabindex')  &&  el.getAttribute('tabindex').length > 0){
						tabIndex = el.getAttribute('tabindex');
					}
					el.setAttribute('tabindex', '-1');

					let inner = document.createElement('span');
					inner.classList.add('ib-radio-inner');
					labelEl.appendChild(inner);
					inner.setAttribute('tabindex', tabIndex);

					let mark = document.createElement('span');
					mark.classList.add('ib-radio-mark');
					inner.appendChild(mark);

					if(el.hasAttribute('id')  &&  el.getAttribute('id').length > 0){
						id = el.getAttribute('id');
					}
					else{
						id = Math.random().toString(36).slice(2);
						el.setAttribute('id', id);
					}

					if(label == ''){
						if(el.hasAttribute('data-label')  &&  el.getAttribute('data-label').length > 0){
							label = el.getAttribute('data-label');
						}
					}

					if(value == ''){
						if(el.hasAttribute('value')  &&  el.getAttribute('value').length > 0){
							value = el.getAttribute('value');
						}
					}

					el.setAttribute('value', value);

					let nodeFound = false;

					for(let i = 0; i < el.childNodes; i++){
						let curNode = el.childNodes[i];
						if(curNode.nodeName == '#text'){
							if(curNode.nodeValue.length > 0){
								if(label == ''){
									label = curNode.nodeValue;
								}
								else{
									curNode.nodeValue = label;
								}
							}
							nodeFound = true;
							break;
						}
					}

					if(!nodeFound){
						labelEl.prepend(label);
					}

					selector = '#' + labelEl.getAttribute('id');

					inner.addEventListener('keydown', function(e){
						let keyCode = e.which;
						if(keyCode == 32  ||  keyCode == 13){
							let inp = find(selector + ' input[type="radio"]');
							inp.checked = !(inp.checked);

							e.preventDefault();
							return false;
						}
					});
				}
				else{
					throw new Error('When using replace, the provided selector must point to a radio input element');
				}
			}
		};

		this.checked = function checked(val){
			let el = find(selector + ' input[type="radio"]');

			if( typeof val == 'undefined' ){
				return ( el == null ? null : el.checked);
			}
			else{
				if(el != null){
					//convert val to true boolean
					val = ( val ? true : false );
					el.checked = val;
				}
			}
		};

		this.val = function val(val){
			let el = find(selector + ' input[type="radio"]');
			if(typeof val == 'undefined'){
				return ( el == null ? null : el.value);
			}
			else{
				if(el != null){
					el.value = val;
				}
			}
		};
	};

	function find(selector){ return document.querySelector(selector); }
	function findAll(selector){ return document.querySelectorAll(selector); }

	var registered = [];
	var setDetectChangeHandler = function(field) {
		if (!registered.includes(field)) {
			var superProps = Object.getPrototypeOf(field);
			var superSet = Object.getOwnPropertyDescriptor(superProps, "value").set;
			var superGet = Object.getOwnPropertyDescriptor(superProps, "value").get;
			var newProps = {
				get: function() {
					return superGet.apply(this, arguments);
				},
				set: function (t) {
					var _this = this;
					setTimeout( function() { _this.dispatchEvent(new Event("change")); }, 50);
					return superSet.apply(this, arguments);
				}
			};
			Object.defineProperty(field, "value", newProps);
			registered.push(field);
		}
	};

	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	let slideUp = (target, duration=250, callback) => {
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.boxSizing = 'border-box';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		timer = window.setTimeout( () => {
			target.style.display = 'none';
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			if(typeof callback == 'function'){
				callback();
			}
		}, duration);
	};

	let slideDown = (target, duration=250, callback) => {
		console.log('target: ', target);
		target.style.removeProperty('display');
		let display = window.getComputedStyle(target).display;

		if (display === 'none')
			display = 'block';

		target.style.display = display;
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.boxSizing = 'border-box';
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		timer = window.setTimeout( () => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			if(typeof callback == 'function'){
				callback();
			}
		}, duration);
	};

	let slideToggle = (target, duration = 250, callback) => {
		if (window.getComputedStyle(target).display === 'none') {
			return slideDown(target, duration, callback);
		} else {
			return slideUp(target, duration, callback);
		}
	};
}
