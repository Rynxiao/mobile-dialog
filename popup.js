window.Popup = (function(d) {
	var _instance = null,
		_progressInstance = null,
		doc = d.body,
		docWidth = doc.clientWidth,
		docHeight = doc.clientHeight;

	function Dialog() {
		this.title = '标题';
		this.content = '内容';
		this.btns = [
			{name : '确定', ac : function() {}},
			{name : '取消', ac : function() {}}
		];
		this.type = 'alert';
		this.hasTitle = true;
		this.timeout = 500;
		this.dialogWrapper = null;
		this.mask = null;
		this.fadeTime = 250;
		this.fadeInTime = 0;
		this.hasDialog = false;
		// loading
		this.loadingText = '正在加载';
		this.hasLoadingText = false;
		this.spinNumber = 8;			// 菊花瓣数
		this.loadingRadius = 18;		// 菊花半径
		this.startAngle = 90;			// 正上方菊花角度
		this.spinMargin = 2;
	}

	Dialog.prototype = {
		/**
		 * 创建mask
		 * 
		 * @return {[type]} [description]
		 */
		_createMask : function() {
			var _this = this;
			if (!this.mask) {
				this.mask = document.createElement('div');
				this.mask.className = 'ui-mask fade';
				doc.appendChild(this.mask);
				// 在创建了mask之后250ms，给其设置透明度为1，达到动画效果
				setTimeout(function() {
					_this.mask.className = 'ui-mask fade in';
				}, this.fadeInTime);
				
			}
		},

		/**
		 * 移除mask
		 * 
		 * @return {[type]} [description]
		 */
		_removeMask : function() {
			var _this = this;
			if (this.mask) {
				// 移除dom之前，给其设置className，达到动画过渡效果
				this.mask.className = 'ui-mask fade';
				setTimeout(function() {
					_this.mask.remove();
					_this.mask = null;
				}, this.fadeTime);
			}
		},

		/**
		 * 创建弹窗的容器
		 * 
		 * @return {[type]} [description]
		 */
		_createWrapper : function() {
			if (!this.dialogWrapper) {
				this.dialogWrapper = document.createElement('div');
			}
		},

		/**
		 * 移除弹窗的容器
		 * 
		 * @return {[type]} [description]
		 */
		_removeWrapper : function() {
			var _this = this;
			if (this.dialogWrapper) {
				if (this.type === 'toast') {
					this.dialogWrapper.className = 'ui-dialog ui-toast fade';
				} else if(this.type === 'loading') {
					this.dialogWrapper.className = 'ui-dialog ui-loading fade';
				} else if(this.type === 'progress') {
					this.dialogWrapper.className = 'ui-dialog ui-progress fade';
				} else {
					this.dialogWrapper.className = 'ui-dialog fade';
				}
				setTimeout(function() {
					_this.dialogWrapper.remove();
					_this.dialogWrapper = null;
					_this.hasDialog = false;
				}, this.fadeTime);
			}
		},

		/**
		 * 如果存在标题，则创建标题容器
		 * 
		 * @return {[type]} [description]
		 */
		_createTitle : function() {
			var title = document.createElement('div');
			title.className = 'ui-title';
			title.textContent = this.title;
			return title;
		},

		/**
		 * 创建内容区域
		 * 
		 * @return {[type]} [description]
		 */
		_createContent : function() {
			var content = document.createElement('div');
			content.className = 'ui-content';
			content.textContent = this.content;
			return content;
		},

		/**
		 * 创建按钮组
		 * 
		 * @return {[type]} [description]
		 */
		_createBtns : function() {
			var buttons = document.createElement('div'), _this = this;
			buttons.className = 'ui-btns';
			this.btns && this.btns.forEach(function(btn, index) {
				var link = document.createElement('a');
				link.href = 'javascript:void(0)';
				link.textContent = btn.name;
				buttons.appendChild(link);
				link.addEventListener('click', function() {
					_this.close();
					btn.ac && btn.ac();
				});
			});
			return buttons;
		},

		/**
		 * 创建loading文字
		 * 
		 * @return {[type]} [description]
		 */
		_createLoadingText : function() {
			var text = document.createElement('div');
			text.className = 'ui-text';
			text.textContent = this.loadingText;
			return text;
		},

		/**
		 * 创建loading菊花
		 * 
		 * @return {[type]} [description]
		 */
		_createLoadingContent : function() {
			var content = document.createElement('div'),
				lineSpin = document.createElement('div'),
				deltaAngle = 360 / this.spinNumber;
			content.className = 'ui-content';
			if (!this.hasLoadingText) {
				content.style.height = '86px';
				content.style.borderRadius = '5px';
			}
			lineSpin.className = 'ui-line-spin';
			lineSpin.style.width = (this.loadingRadius * 2 + this.spinMargin * 2) + 'px';
			lineSpin.style.height = (this.loadingRadius * 2 + this.spinMargin * 2) + 'px';
			for (var i = 0; i < this.spinNumber; i++) {
				var div = document.createElement('div');
				var angle = this.startAngle + i * (-deltaAngle),
					rotateAngle = i * deltaAngle,
					p = Math.PI * 2 * (angle / 360);
				div.style.top = this.loadingRadius * (1 - Math.sin(p)) + 'px';
				div.style.left = this.loadingRadius * (1 + Math.cos(p)) + 'px';
				div.style.transform = 'rotate('+rotateAngle+'deg)';
				div.style.WebkitTransform = 'rotate('+rotateAngle+'deg)';
				div.style.MozTransform = 'rotate('+rotateAngle+'deg)';
				div.style.msTransform = 'rotate('+rotateAngle+'deg)';
				div.style.OTransform = 'rotate('+rotateAngle+'deg)';
				lineSpin.appendChild(div);
			}
			content.appendChild(lineSpin);
			return content;
		},

		/**
		 * 渲染弹窗
		 * 
		 * @return {[type]} [description]
		 */
		_renderDialog : function() {
			this._createWrapper();
			switch (this.type) {
				case 'confirm':
					this.dialogWrapper.className = 'ui-dialog fade';
					var title, content, btns, _this = this;
					content = this._createContent();
					btns = this._createBtns();
					if (this.hasTitle) {
						title = this._createTitle();
						this.dialogWrapper.appendChild(title);
					}
					
					this.dialogWrapper.appendChild(content);
					this.dialogWrapper.appendChild(btns);
					doc.appendChild(this.dialogWrapper);
					setTimeout(function() {
						_this.dialogWrapper.className = 'ui-dialog fade in';
					}, this.fadeInTime);
					break;
				case 'toast': 
					this.dialogWrapper.className = 'ui-dialog ui-toast fade';
					var content = this._createContent(), _this = this;
					this.dialogWrapper.appendChild(content);
					doc.appendChild(this.dialogWrapper);
					setTimeout(function() {
						_this.dialogWrapper.className = 'ui-dialog ui-toast fade in';
					}, this.fadeInTime);
					setTimeout(function() {
						_this.close();
					}, this.timeout);
					break;
				case 'loading':
					this.dialogWrapper.className = 'ui-dialog ui-loading fade';
					var text, content, _this = this;
					content = this._createLoadingContent();
					if (this.hasLoadingText) {
						text = this._createLoadingText();
						this.dialogWrapper.appendChild(text);
					}
					this.dialogWrapper.appendChild(content);
					doc.appendChild(this.dialogWrapper);
					setTimeout(function() {
						_this.dialogWrapper.className = 'ui-dialog ui-loading fade in';
					}, this.fadeInTime);
					break;
				default:
					break;
			}
		},

		/**
		 * confirm/alert 弹窗，返回供外部使用
		 * 
		 * @return {[type]} [description]
		 */
		confirm : function() {
			var args = arguments && arguments[0],
				length = args && args.length;
			if (length === 3) {
				// 有标题
				this.title = args[0];
				this.content = args[1];
				this.btns = args[2];
				this.hasTitle = true;
			} else if(length === 2) {
				this.content = args[0];
				this.btns = args[1];
				this.hasTitle = false;
			} else {
				// alert
				this.hasTitle = false;
				this.content = args[0];
				this.btns = [{name : '确定'}]
			}
			this.type = 'confirm';
			this._create();
		},

		/**
		 * toast弹窗，返回供外部使用
		 * 
		 * @return {[type]} [description]
		 */
		toast : function() {
			var args = arguments && arguments[0],
				length = args && args.length;
			if (length === 2) {
				this.content = args[0];
				this.timeout = args[1];
			} else if(length === 1) {
				this.content = args[0];
			}
			this.type = 'toast';
			if (!this.hasDialog) {
				this._create();
			}
			this.hasDialog = true;
		},

		/**
		 * loading弹窗，返回供外部使用
		 * 
		 * @return {[type]} [description]
		 */
		showLoading : function() {
			var args = arguments && arguments[0],
				length = args && args.length;

			// 带有参数
			if (length === 1) {
				this.loadingText = args[0];
				this.hasLoadingText = true;
			}

			this.type = 'loading';
			this._create();
		},

		/**
		 * 创建弹窗 
		 * 
		 * @return {[type]} [description]
		 */
		_create : function() {
			this._createMask();
			this._renderDialog();
		},

		/**
		 * 关闭弹窗
		 * 
		 * @return {[type]} [description]
		 */
		close : function() {
			this._removeMask();
			this._removeWrapper();
			_instance = null;
			_progressInstance = null;
		}
	};

	function Progress() {
		Dialog.call(this);
		this.percent = 0;
		this.text = '正在更新程序';
		this.innerBar = null;
	}

	/**
	 * 继承
	 * @param  {[type]} subClass   [description]
	 * @param  {[type]} superClass [description]
	 * @return {[type]}            [description]
	 */
	function inherit(subClass, superClass) {  
	    function F() {}  
	    F.prototype = superClass.prototype;  
	    subClass.prototype = new F();  
	    subClass.prototype.constructor = subClass;  
	}  

	/**
	 * 继承条用
	 */
	inherit(Progress, Dialog);

	/**
	 * 创建进度条文字
	 * @return {[type]} [description]
	 */
	Progress.prototype._createProgressText = function() {
		var text = document.createElement('div');
		text.className = 'ui-text';
		text.textContent = this.text;
		return text;
	}

	/**
	 * 创建进度条
	 * @return {[type]} [description]
	 */
	Progress.prototype._createProgressContent = function() {
		var	content = document.createElement('div'), 
			outer = document.createElement('div'),
			inner = document.createElement('div');
		content.className = 'ui-content';
		outer.className = 'ui-outer';
		inner.className = 'ui-inner';
		outer.appendChild(inner);
		content.appendChild(outer)

		this.innerBar = inner;

		return content;
	}

	/**
	 * 进度条初始化
	 * @return {[type]} [description]
	 */
	Progress.prototype.init = function() {
		var text, content, bar, _this = this;
		// 创建mask
		this._createMask();
		// 创建warpper
		this._createWrapper();
		
		this.dialogWrapper.className = 'ui-dialog ui-progress fade';
		
		// 1. 创建文字
		text = this._createProgressText();
		// 2. 创建内容
		content = this._createProgressContent();
		// 3. 将文字和content加入到warpper中
		this.dialogWrapper.appendChild(text);
		this.dialogWrapper.appendChild(content);
		// 4. 将warpper加入到body中
		doc.appendChild(this.dialogWrapper);

		setTimeout(function() {
			_this.dialogWrapper.className = 'ui-dialog ui-progress fade in';
		}, this.fadeInTime);
	}

	/**
	 * 创建进度条
	 * @return {[type]} [description]
	 */
	Progress.prototype.create = function() {
		var args = arguments && arguments[0],
			length = args && args.length;

		if (length === 1) {
			this.text = args[0];
		}

		this.type = 'progress';
		this.init();
		return this;
	}

	/**
	 * 更新进度条进度
	 * @return {[type]} [description]
	 */
	Progress.prototype.update = function(percent) {
		if (this.percent === 100) {
			this.close();
		}
		this.percent = percent;
		this.innerBar.style.width = percent + '%';
	}

	/**
	 * 关闭进度条
	 * @return {[type]} [description]
	 */
	Progress.prototype.closeBar = function() {
		this.percent = 0;
		this.close();
	}

	/**
	 * 获取dialog实例
	 * @return {[type]} [description]
	 */
	function _getInstance() {
		if (!_instance) {
			_instance = new Dialog();
		} 
		return _instance;
	}

	/**
	 * 获取进度条实例
	 * @return {[type]} [description]
	 */
	function _getProgressInstance() {
		if (!_progressInstance) {
			_progressInstance = new Progress();
		}
		return _progressInstance;
	}

	/**
	 * return 调用
	 */
	return {
		alert : function() {
			return _getInstance().confirm(arguments);
		},
		confirm : function() {
			return _getInstance().confirm(arguments);
		},
		toast : function() {
			return _getInstance().toast(arguments);
		},
		showLoading : function() {
			return _getInstance().showLoading(arguments);
		},
		progress : function() {
			return _getProgressInstance().create(arguments);
		},
		close : function() {
			return _getInstance().close();
		}
	}

})(document);