(function() {
	fruit.ui.define('Component', 'demo.Main', {
		$view : {
			content : [{
				tag : 'h2',
				content : 'Demo for ToolTip'
			}, {
				name : 'tooltip1',
				type : 'Tooltip',
				options : {
					'tooltip' : 'TestToolTip=============',
					'position' : {
						x : 170,
						y : 60
					},
					'direction' : 'left'
				}
			}, {
				tag : 'h3',
				content : 'API'
			}, {
				tag : 'p',
				content : [{
					tag : 'label',
					content : 'showHide:'
				}, {
					name : 'btnShowHide',
					type : 'Button',
					options : {
						text : 'showHide'
					}
				}]
			}, {
				tag : 'p',
				content : [{
					tag : 'label',
					content : 'setDirection:'
				}, {
					name : 'btnSetDirection',
					type : 'Button',
					options : {
						text : 'show && setDirection'
					}
				}, {
					name : 'directionText',
					type : 'TextBox',
					options : {
						placeHolder : '"right","left","top","bottome"'
					}
				}]
			}, {
				tag : 'p',
				content : [{
					tag : 'label',
					content : 'setPosition:'
				}, {
					name : 'btnSetPositon',
					type : 'Button',
					options : {
						text : 'show && setPositon'
					}
				}, {
					name : 'positonText',
					type : 'TextBox',
					options : {
						placeHolder : '{x:0,y:0}'
					}
				}]
			}, {
				tag : 'p',
				content : [{
					tag : 'label',
					content : 'setToolTip:'
				}, {
					name : 'btnSetToolTip',
					type : 'Button',
					options : {
						text : 'show && setToolTip'
					}
				}, {
					name : 'toolTipText',
					type : 'TextBox',
					options : {
						placeHolder : 'tooltip content'
					}
				}]
			}]
		},
		$events : {
			subscribe : {
				'btnShowHide' : {
					'mouseover' : '__mouseover',
					'mouseout' : '__mouseout'
				},
				'btnSetDirection' : {
					'onClick' : '__setDirection'
				},
				'btnSetPositon' : {
					'onClick' : '__setPosition'
				},
				'btnSetToolTip' : {
					'onClick' : '__setToolTip'
				}
			}
		},
		$controller : {
			create : function() {
				this.$parent(arguments);
			},
			__setText : function(comp) {
				this.tb.setText(comp.getAttribute('value'));
			},
			__mouseover : function() {
				var tooltip = this.tooltip1;
				tooltip.show();
			},
			__mouseout : function() {
				var tooltip = this.tooltip1;
				tooltip.hide();
			},
			__setDirection : function() {
				var directionText = this.queryByKey('directionText').getText() || 'left';
				var tooltip = this.tooltip1;
				tooltip.show();
				tooltip.setDirection(directionText);
			},
			__setPosition : function() {
				var positonText = directionText = this.queryByKey('positonText').getText() || '{x:485,y:136}';
				var pos = eval('(' + positonText + ')');
				var tooltip = this.tooltip1;
				tooltip.show();
				tooltip.setPositon(pos);
			},
			__setToolTip : function() {
				var toolTipText = directionText = this.queryByKey('toolTipText').getText() || '[content is here!]';
				var tooltip = this.tooltip1;
				tooltip.show();
				tooltip.setTooltip(toolTipText);
			}
		}
	});

	fruit.ready(function() {
		var main = new demo.Main();
		fruit.Application.load(main);
	});
})();
