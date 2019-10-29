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
		let id = opts.id;
		let name = opts.name;
		let options = [];

		let open = false;
		let animating = false;
		let timer = -1;
		let current = 0;
		let interacted = false;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){

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

				const sel = find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' ));
				const display = find(selector + ' span.ib-select-display');
				const selectOuter = find(selector + ' div.ib-select-outer');
				const dropdown = find(selector + ' div.ib-select-dropdown-outer');

				if(opts.dropdownImage != ''){
					find(selector + ' .ib-select-inner').style.backgroundImage = opts.dropdownImage;
				}

				options = findAll(selector + ' div.ib-select-dropdown-option');

				options.forEach(function addOptionClicks(option){
					option.addEventListener('mousedown', function(){
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
					let opt = find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' ) + ' option[value="' + sel.value + '"]');
					if(opt != null){
						display.innerHTML = opt.attributes['data-label'].value;
					}
				});

				display.addEventListener('click', function(){
					toggleDrawer();
				});

				setDetectChangeHandler(sel);
				display.addEventListener('blur', function(){
					clearTimeout(timer);
					animating = false;

					open = false;
					find(selector + ' div.ib-select-dropdown-outer').style.display = 'none';
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

		};

		function openDrawer(duration = 250){
			if(!open && !animating){
				animating = true;
				open = true;
				interacted = false;
				find(selector + ' div.ib-select-outer').classList.add('open');
				slideDown(find(selector + ' div.ib-select-dropdown-outer'), duration, function(){
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
				slideUp(find(selector + ' div.ib-select-dropdown-outer'), duration, function(){
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
					slideUp(find(selector + ' div.ib-select-dropdown-outer'), duration, function(){
						animating = false;
						sync();
					});
				}
				else{
					open = true;
					find(selector + ' div.ib-select-outer').classList.add('open');
					slideDown(find(selector + ' div.ib-select-dropdown-outer'), duration, function(){
						animating = false;
						sync();
					});
				}
			}
		}

		function sync(){
			let selected = findAll(selector + ' div.ib-select-dropdown-option.selected');

			let outer = find(selector + ' div.ib-select-outer');
			let sel = find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' ));
			let opt = find(selector + ' div.ib-select-dropdown-option[data-value="' + sel.value + '"]');

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
				if(typeof args.label == 'string'){
					if(typeof args.value == 'string'){
						return (options.push(args) - 1);
					}
				}
			}
		};

		this.val = function val(v){
			if(typeof v == 'undefined'){
				return find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' )).value;
			}
			else{
				let sel = find(selector + ' select' + ( (id.length > 0) ? ('#' + id) : '' ));

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
		let id = opts.id;
		let name = opts.name;
		let label = opts.label;
		let checked = opts.checked;
		let value = opts.value;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){
			let markup =
			'<label class="ib-checkbox-outer">' + label +
  			'<input tabindex="-1" type="checkbox" ' + ( checked ? 'checked="checked" ' : ' ' ) + ( (id.length > 0) ? ('id="' + id + '" ') : ' ' ) + ( (name.length > 0) ? ('name="' + name + '" ') : ' ' ) + ( (value.length > 0) ? ('value="' + value + '" ') : ' ' ) + '>' +
  			'<span tabindex="0" class="ib-checkbox-inner"></span>' +
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
						return false;
					}
				});
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
		let id = opts.id;
		let name = opts.name;
		let label = opts.label;
		let checked = opts.checked;
		let value = opts.value;

		if(selector == ''){
			throw new Error('Missing selector');
		}

		this.build = function build(){
			let markup =
			'<label class="ib-radio-outer">' + label +
  			'<input tabindex="-1" type="radio" ' + ( checked ? 'checked="checked" ' : ' ' ) + ( (id.length > 0) ? ('id="' + id + '" ') : ' ' ) + ( (name.length > 0) ? ('name="' + name + '" ') : ' ' ) + ( (value.length > 0) ? ('value="' + value + '" ') : ' ' ) + '>' +
  			'<span tabindex="0" class="ib-radio-inner"></span>' +
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
						return false;
					}
				});
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